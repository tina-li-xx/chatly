const mocks = vi.hoisted(() => ({ query: vi.fn() }));

vi.mock("@/lib/db", () => ({ query: mocks.query }));

import {
  findActiveConversationTyping,
  findConversationById,
  findConversationEmailById,
  findConversationEmailStateForUser,
  findConversationIdentityForActivity,
  findConversationNotificationContextRow,
  findConversationTag,
  findPublicAttachmentRecord,
  findVisitorConversationEmailState,
  hasPublicConversationAccessRecord,
  listConversationMessageRows
} from "@/lib/repositories/conversations-read-repository";
import { findConversationReplyDeliveryStateForUser } from "@/lib/repositories/conversation-reply-delivery-repository";
import { findNextRoundRobinAssigneeUserId } from "@/lib/repositories/conversation-assignment-repository";
import {
  incrementConversationUnreadSnapshots,
  syncAssignedConversationUnreadSnapshot,
  upsertConversationRead
} from "@/lib/repositories/conversation-unread-repository";
import {
  deleteConversationTag,
  insertAttachmentRecord,
  insertConversationRecord,
  insertConversationTag,
  touchConversationAfterMessage,
  upsertConversationFeedback,
  upsertConversationMetadataRecord
} from "@/lib/repositories/conversations-write-repository";

describe("conversation read and write repositories", () => {
  beforeEach(() => vi.clearAllMocks());

  it("reads conversation records, access checks, tags, and attachments", async () => {
    mocks.query
      .mockResolvedValueOnce({ rows: [{ id: "conv_1", site_id: "site_1", email: "hello@example.com", session_id: "session_1" }] })
      .mockResolvedValueOnce({ rowCount: 1, rows: [{ id: "conv_1" }] })
      .mockResolvedValueOnce({ rows: [{ site_id: "site_1", email: "hello@example.com", session_id: "session_1" }] })
      .mockResolvedValueOnce({ rows: [{ id: "msg_1" }] })
      .mockResolvedValueOnce({ rows: [{ typing: true }] })
      .mockResolvedValueOnce({ rows: [{ email: "hello@example.com", user_id: "user_1" }] })
      .mockResolvedValueOnce({ rows: [{ user_id: "user_1", owner_user_id: "user_1", site_name: "Marketing site" }] })
      .mockResolvedValueOnce({ rowCount: 1, rows: [{ conversation_id: "conv_1" }] })
      .mockResolvedValueOnce({ rows: [{ email: "hello@example.com", site_id: "site_1", site_name: "Marketing site", status: "open" }] })
      .mockResolvedValueOnce({ rows: [{ email: "hello@example.com", visitor_is_live: true }] })
      .mockResolvedValueOnce({ rows: [{ email: "hello@example.com" }] })
      .mockResolvedValueOnce({ rows: [{ id: "attachment_1", file_name: "doc.pdf" }] });

    await expect(findConversationById("conv_1")).resolves.toEqual({ id: "conv_1", site_id: "site_1", email: "hello@example.com", session_id: "session_1" });
    await expect(hasPublicConversationAccessRecord({ conversationId: "conv_1", siteId: "site_1", sessionId: "session_1" })).resolves.toBe(true);
    await expect(findConversationIdentityForActivity("conv_1", "user_1")).resolves.toEqual({ site_id: "site_1", email: "hello@example.com", session_id: "session_1" });
    await expect(listConversationMessageRows("conv_1")).resolves.toEqual([{ id: "msg_1" }]);
    await expect(findActiveConversationTyping("conv_1")).resolves.toBe(true);
    await expect(findVisitorConversationEmailState({ conversationId: "conv_1", siteId: "site_1", sessionId: "session_1" })).resolves.toEqual({ email: "hello@example.com", user_id: "user_1" });
    await expect(findConversationNotificationContextRow("conv_1")).resolves.toEqual({
      user_id: "user_1",
      owner_user_id: "user_1",
      site_name: "Marketing site"
    });
    await expect(findConversationTag("conv_1", "vip")).resolves.toBe(true);
    await expect(findConversationEmailStateForUser("conv_1", "user_1")).resolves.toEqual({ email: "hello@example.com", site_id: "site_1", site_name: "Marketing site", status: "open" });
    await expect(findConversationReplyDeliveryStateForUser("conv_1", "user_1")).resolves.toEqual({
      email: "hello@example.com",
      visitor_is_live: true
    });
    await expect(findConversationEmailById("conv_1")).resolves.toBe("hello@example.com");
    await expect(findPublicAttachmentRecord("attachment_1", "conv_1")).resolves.toEqual({ id: "attachment_1", file_name: "doc.pdf" });

    expect(mocks.query.mock.calls[1]?.[0]).toContain("AND session_id = $3");
    expect(mocks.query.mock.calls[4]?.[0]).toContain("FROM conversation_typing");
    expect(mocks.query.mock.calls[9]?.[0]).toContain("FROM visitor_presence_sessions vps");
    expect(mocks.query.mock.calls[11]?.[0]).toContain("FROM message_attachments");
    expect(mocks.query.mock.calls[6]?.[0]).toContain("COALESCE(c.assigned_user_id, s.user_id)");
  });

  it("writes conversation records, metadata, attachments, tags, feedback, and reads", async () => {
    await insertConversationRecord({ conversationId: "conv_1", siteId: "site_1", email: "hello@example.com", sessionId: "session_1" });
    await upsertConversationMetadataRecord({ conversationId: "conv_1", pageUrl: "/pricing", referrer: "https://google.com", userAgent: "Mozilla", country: "GB", region: "England", city: "London", timezone: "Europe/London", locale: "en-GB" });
    await touchConversationAfterMessage("conv_1", true, {
      createdAt: "2026-03-29T10:05:00.000Z",
      preview: "Happy to help"
    });
    await insertAttachmentRecord({ attachmentId: "attachment_1", messageId: "msg_1", fileName: "doc.pdf", contentType: "application/pdf", sizeBytes: 12, content: Buffer.from("hello") });
    await deleteConversationTag("conv_1", "vip");
    await insertConversationTag("conv_1", "vip");
    await upsertConversationFeedback("conv_1", 5);
    await incrementConversationUnreadSnapshots("conv_1");
    await upsertConversationRead("user_1", "conv_1");
    await syncAssignedConversationUnreadSnapshot({
      conversationId: "conv_1",
      ownerUserId: "owner_1",
      assignedUserId: "member_1"
    });

    expect(mocks.query).toHaveBeenCalledTimes(11);
    expect(mocks.query.mock.calls[0]?.[0]).toContain("INSERT INTO conversations");
    expect(mocks.query.mock.calls[1]?.[0]).toContain("INSERT INTO conversation_metadata");
    expect(mocks.query.mock.calls[1]?.[0]).toContain("page_url = COALESCE(conversation_metadata.page_url, EXCLUDED.page_url)");
    expect(mocks.query.mock.calls[2]?.[0]).toContain("recorded_page_url = COALESCE(recorded_page_url, $2)");
    expect(mocks.query.mock.calls[3]?.[0]).toContain("last_message_at = $2");
    expect(mocks.query.mock.calls[3]?.[0]).toContain("last_message_preview = $3");
    expect(mocks.query.mock.calls[4]?.[0]).toContain("INSERT INTO message_attachments");
    expect(mocks.query.mock.calls[6]?.[0]).toContain("ON CONFLICT (conversation_id, tag) DO NOTHING");
    expect(mocks.query.mock.calls[8]?.[0]).toContain("tm.role = 'admin'");
    expect(mocks.query.mock.calls[8]?.[0]).toContain("unread_count = conversation_reads.unread_count + 1");
    expect(mocks.query.mock.calls[9]?.[0]).toContain("unread_count = 0");
    expect(mocks.query.mock.calls[10]?.[0]).toContain("LEFT JOIN LATERAL");
  });

  it("skips assigned unread sync when no assignee is provided", async () => {
    await syncAssignedConversationUnreadSnapshot({
      conversationId: "conv_1",
      ownerUserId: "owner_1",
      assignedUserId: null
    });

    expect(mocks.query).not.toHaveBeenCalled();
  });

  it("selects the least recently assigned teammate for round robin routing", async () => {
    mocks.query.mockResolvedValueOnce({ rows: [{ user_id: "member_1" }] });

    await expect(findNextRoundRobinAssigneeUserId("owner_1")).resolves.toBe("member_1");
    expect(mocks.query.mock.calls[0]?.[0]).toContain("WITH candidates AS");
    expect(mocks.query.mock.calls[0]?.[0]).toContain("MAX(c.created_at) AS last_assigned_at");
  });
});
