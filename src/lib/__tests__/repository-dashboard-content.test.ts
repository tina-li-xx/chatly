const mocks = vi.hoisted(() => ({
  query: vi.fn()
}));

vi.mock("@/lib/db", () => ({
  query: mocks.query
}));

import {
  claimTemplateDelivery,
  claimRetryableTemplateDeliveries,
  findConversationTemplateContext,
  listStoredMessageAttachments,
  listConversationTranscriptRows,
  markTemplateDeliveryFailed,
  markTemplateDeliverySent
} from "@/lib/repositories/conversation-template-email-repository";
import { getDashboardGrowthSnapshot } from "@/lib/repositories/dashboard-growth-repository";
import {
  getConversationTotalsForUser,
  getRatedConversationCountForUser,
  listTopTagsForUser
} from "@/lib/repositories/stats-repository";

describe("dashboard growth, stats, and conversation template repositories", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns dashboard growth rows and the empty snapshot fallback", async () => {
    mocks.query
      .mockResolvedValueOnce({
        rows: [
          {
            total_conversations: "14",
            first_conversation_at: "2026-03-01T10:00:00.000Z",
            conversations_last_7_days: "4",
            conversations_previous_7_days: "2",
            login_sessions_last_7_days: "7",
            last_login_at: "2026-03-29T10:00:00.000Z"
          }
        ]
      })
      .mockResolvedValueOnce({ rows: [] });

    await expect(getDashboardGrowthSnapshot("user_1")).resolves.toMatchObject({
      total_conversations: "14",
      login_sessions_last_7_days: "7"
    });
    await expect(getDashboardGrowthSnapshot("user_2")).resolves.toEqual({
      total_conversations: "0",
      first_conversation_at: null,
      conversations_last_7_days: "0",
      conversations_previous_7_days: "0",
      login_sessions_last_7_days: "0",
      last_login_at: null
    });

    expect(mocks.query.mock.calls[0]?.[0]).toContain("CROSS JOIN");
  });

  it("reads totals, ratings, and top tags for the stats dashboard", async () => {
    mocks.query
      .mockResolvedValueOnce({ rows: [{ total: "12", answered: "9" }] })
      .mockResolvedValueOnce({ rows: [{ rated: "5" }] })
      .mockResolvedValueOnce({ rows: [{ tag: "pricing", count: "3" }] });

    await expect(getConversationTotalsForUser("user_1")).resolves.toEqual({ total: "12", answered: "9" });
    await expect(getRatedConversationCountForUser("user_1")).resolves.toBe("5");
    await expect(listTopTagsForUser("user_1")).resolves.toEqual([{ tag: "pricing", count: "3" }]);

    expect(mocks.query.mock.calls[0]?.[0]).toContain("COUNT(*) FILTER");
    expect(mocks.query.mock.calls[1]?.[0]).toContain("FROM feedback f");
    expect(mocks.query.mock.calls[2]?.[0]).toContain("LIMIT 4");
  });

  it("reads conversation template context and transcript rows", async () => {
    mocks.query
      .mockResolvedValueOnce({
        rows: [
          {
            conversation_id: "conv_1",
            user_id: "user_1",
            site_name: "Docs",
            domain: "docs.usechatting.com",
            email: "hello@example.com",
            plan_key: "growth"
          }
        ]
      })
      .mockResolvedValueOnce({
        rows: [{ id: "msg_1", sender: "user", content: "Hi", created_at: "2026-03-29T10:00:00.000Z" }]
      });

    await expect(findConversationTemplateContext("conv_1")).resolves.toMatchObject({ site_name: "Docs" });
    await expect(listConversationTranscriptRows("conv_1")).resolves.toEqual([
      { id: "msg_1", sender: "user", content: "Hi", created_at: "2026-03-29T10:00:00.000Z" }
    ]);

    expect(mocks.query.mock.calls[0]?.[0]).toContain("LEFT JOIN billing_accounts");
    expect(mocks.query.mock.calls[1]?.[0]).toContain("ORDER BY created_at ASC");
  });

  it("claims, marks, retries, and reads template delivery payloads", async () => {
    mocks.query
      .mockResolvedValueOnce({ rowCount: 1 })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({
        rows: [
          {
            conversation_id: "conv_1",
            user_id: "user_1",
            template_key: "follow_up_email",
            delivery_key: "follow_up:conv_1",
            attempt_count: 2
          }
        ]
      })
      .mockResolvedValueOnce({
        rows: [{ file_name: "quote.pdf", content_type: "application/pdf", content: Buffer.from("hi") }]
      });

    await expect(
      claimTemplateDelivery({
        deliveryId: "delivery_1",
        conversationId: "conv_1",
        userId: "user_1",
        templateKey: "follow_up_email",
        deliveryKey: "follow_up:conv_1",
        recipientEmail: "hello@example.com",
        nextAttemptAt: new Date("2026-03-31T10:05:00.000Z")
      })
    ).resolves.toBe(true);
    await markTemplateDeliverySent("follow_up:conv_1");
    await markTemplateDeliveryFailed({
      deliveryKey: "follow_up:conv_1",
      errorMessage: "mail down",
      nextAttemptAt: new Date("2026-03-31T10:10:00.000Z")
    });
    await expect(
      claimRetryableTemplateDeliveries({
        now: new Date("2026-03-31T10:15:00.000Z"),
        leaseUntil: new Date("2026-03-31T10:20:00.000Z"),
        limit: 5
      })
    ).resolves.toEqual([
      {
        conversationId: "conv_1",
        userId: "user_1",
        templateKey: "follow_up_email",
        deliveryKey: "follow_up:conv_1",
        attemptCount: 2
      }
    ]);
    await expect(listStoredMessageAttachments("msg_1")).resolves.toEqual([
      { file_name: "quote.pdf", content_type: "application/pdf", content: Buffer.from("hi") }
    ]);

    expect(mocks.query.mock.calls[0]?.[0]).toContain("ON CONFLICT (delivery_key) DO NOTHING");
    expect(mocks.query.mock.calls[1]?.[0]).toContain("SET status = 'sent'");
    expect(mocks.query.mock.calls[2]?.[0]).toContain("SET status = 'failed'");
    expect(mocks.query.mock.calls[3]?.[0]).toContain("FOR UPDATE SKIP LOCKED");
    expect(mocks.query.mock.calls[4]?.[0]).toContain("FROM message_attachments");
  });
});
