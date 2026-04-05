const mocks = vi.hoisted(() => ({
  claimDailyDigestDelivery: vi.fn(),
  getAnalyticsDatasetForOwnerUserId: vi.fn(),
  getPublicAppUrl: vi.fn(),
  listDailyDigestRecipientRows: vi.fn(),
  mapSummary: vi.fn((row) => row),
  queryConversationSummaries: vi.fn(),
  releaseDailyDigestDelivery: vi.fn(),
  sendDailyDigestEmail: vi.fn()
}));

vi.mock("@/lib/chatly-notification-email-senders", () => ({
  sendDailyDigestEmail: mocks.sendDailyDigestEmail
}));
vi.mock("@/lib/data/analytics", () => ({
  getAnalyticsDatasetForOwnerUserId: mocks.getAnalyticsDatasetForOwnerUserId
}));
vi.mock("@/lib/data/shared", () => ({
  mapSummary: mocks.mapSummary,
  queryConversationSummaries: mocks.queryConversationSummaries
}));
vi.mock("@/lib/env", () => ({
  getPublicAppUrl: mocks.getPublicAppUrl
}));
vi.mock("@/lib/repositories/daily-digest-repository", () => ({
  claimDailyDigestDelivery: mocks.claimDailyDigestDelivery,
  listDailyDigestRecipientRows: mocks.listDailyDigestRecipientRows,
  releaseDailyDigestDelivery: mocks.releaseDailyDigestDelivery
}));

import {
  runScheduledDailyDigests,
  sendUserDailyDigest,
  shouldRunDailyDigests
} from "@/lib/daily-digest";
import { openConversation } from "@/lib/__tests__/daily-digest-test-fixtures";

describe("daily digest", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-30T13:15:00.000Z"));
    mocks.getPublicAppUrl.mockReturnValue("https://usechatting.com");
    mocks.claimDailyDigestDelivery.mockResolvedValue(true);
    mocks.getAnalyticsDatasetForOwnerUserId.mockResolvedValue({ conversations: [], replyEvents: [] });
    mocks.mapSummary.mockImplementation((row) => row);
    mocks.queryConversationSummaries.mockResolvedValue({ rows: [openConversation] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("sends a daily digest with today's metrics and open conversations", async () => {
    mocks.getAnalyticsDatasetForOwnerUserId.mockResolvedValue({
      conversations: [
        {
          id: "conv_1",
          createdAt: "2026-03-29T12:00:00.000Z",
          updatedAt: "2026-03-29T12:10:00.000Z",
          status: "open",
          pageUrl: "https://usechatting.com/pricing",
          referrer: null,
          rating: null,
          firstResponseSeconds: 120,
          resolutionSeconds: null,
          tags: []
        },
        {
          id: "conv_2",
          createdAt: "2026-03-30T02:00:00.000Z",
          updatedAt: "2026-03-30T02:30:00.000Z",
          status: "resolved",
          pageUrl: "https://usechatting.com/docs",
          referrer: null,
          rating: null,
          firstResponseSeconds: 1800,
          resolutionSeconds: 3600,
          tags: []
        }
      ],
      replyEvents: []
    });
    mocks.queryConversationSummaries.mockResolvedValue({ rows: [openConversation] });

    await expect(
      sendUserDailyDigest({
        userId: "user_1",
        ownerUserId: "owner_1",
        notificationEmail: "team@example.com",
        timeZone: "America/New_York",
        now: new Date("2026-03-30T13:15:00.000Z")
      })
    ).resolves.toBe("sent");

    expect(mocks.sendDailyDigestEmail).toHaveBeenCalledWith({
      to: "team@example.com",
      date: "March 29, 2026",
      metrics: [
        { value: "2", label: "new conversations" },
        { value: "16m", label: "avg first response" },
        { value: "50%", label: "replied within 15 min" }
      ],
      openConversations: [
        {
          title: "Alex from pricing page",
          preview: "Can I remove Chatting branding on Growth?",
          meta: "15 minutes ago • https://usechatting.com/pricing"
        }
      ],
      inboxUrl: "https://usechatting.com/dashboard/inbox"
    });
    expect(mocks.claimDailyDigestDelivery).toHaveBeenCalledWith("user_1", "owner_1", "2026-03-29");
  });

  it("skips already-sent and no-activity digests", async () => {
    mocks.claimDailyDigestDelivery.mockResolvedValueOnce(false);
    await expect(
      sendUserDailyDigest({
        userId: "user_1",
        ownerUserId: "owner_1",
        notificationEmail: "team@example.com",
        now: new Date("2026-03-30T13:15:00.000Z")
      })
    ).resolves.toBe("already-sent");

    mocks.getAnalyticsDatasetForOwnerUserId.mockResolvedValueOnce({ conversations: [], replyEvents: [] });
    mocks.queryConversationSummaries.mockResolvedValueOnce({ rows: [] });
    await expect(
      sendUserDailyDigest({
        userId: "user_2",
        ownerUserId: "owner_2",
        notificationEmail: "team@example.com",
        now: new Date("2026-03-30T13:15:00.000Z")
      })
    ).resolves.toBe("skipped");

    expect(mocks.sendDailyDigestEmail).not.toHaveBeenCalled();
    expect(mocks.releaseDailyDigestDelivery).not.toHaveBeenCalled();
  });

  it("uses each recipient's local send window instead of a global UTC gate", async () => {
    mocks.listDailyDigestRecipientRows.mockResolvedValue([
      { user_id: "user_1", owner_user_id: "owner_1", email: "owner@example.com", notification_email: null, timezone: "UTC" },
      { user_id: "user_2", owner_user_id: "owner_2", email: "member@example.com", notification_email: "team@example.com", timezone: "America/New_York" }
    ]);
    mocks.getAnalyticsDatasetForOwnerUserId.mockResolvedValue({ conversations: [], replyEvents: [] });
    mocks.queryConversationSummaries.mockResolvedValue({ rows: [openConversation] });

    expect(shouldRunDailyDigests(new Date("2026-03-30T08:59:00.000Z"))).toBe(false);
    expect(shouldRunDailyDigests(new Date("2026-03-30T12:59:00.000Z"), "America/New_York")).toBe(false);
    await expect(runScheduledDailyDigests(new Date("2026-03-30T08:59:00.000Z"))).resolves.toEqual({
      processedRecipients: 2,
      sent: 0,
      skipped: 2
    });

    expect(shouldRunDailyDigests(new Date("2026-03-30T13:00:00.000Z"), "America/New_York")).toBe(true);
    await expect(runScheduledDailyDigests(new Date("2026-03-30T13:15:00.000Z"))).resolves.toEqual({
      processedRecipients: 2,
      sent: 2,
      skipped: 0
    });
  });

  it("tracks deliveries per workspace for multi-team users", async () => {
    mocks.listDailyDigestRecipientRows.mockResolvedValue([
      { user_id: "user_1", owner_user_id: "owner_1", email: "alex@example.com", notification_email: null, timezone: "UTC" },
      { user_id: "user_1", owner_user_id: "owner_2", email: "alex@example.com", notification_email: null, timezone: "UTC" }
    ]);
    mocks.getAnalyticsDatasetForOwnerUserId.mockResolvedValue({ conversations: [], replyEvents: [] });
    mocks.queryConversationSummaries.mockResolvedValue({ rows: [openConversation] });

    await expect(runScheduledDailyDigests(new Date("2026-03-30T13:15:00.000Z"))).resolves.toEqual({
      processedRecipients: 2,
      sent: 2,
      skipped: 0
    });

    expect(mocks.claimDailyDigestDelivery).toHaveBeenNthCalledWith(1, "user_1", "owner_1", "2026-03-29");
    expect(mocks.claimDailyDigestDelivery).toHaveBeenNthCalledWith(2, "user_1", "owner_2", "2026-03-29");
  });
});
