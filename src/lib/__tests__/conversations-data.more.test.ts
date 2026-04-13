const mocks = vi.hoisted(() => ({
  findNextRoundRobinAssigneeUserId: vi.fn(),
  deleteConversationTag: vi.fn(),
  deleteConversationTypingRecord: vi.fn(),
  deleteVisitorTypingRecord: vi.fn(),
  ensureConversation: vi.fn(),
  findActiveConversationTyping: vi.fn(),
  findConversationById: vi.fn(),
  findConversationEmailById: vi.fn(),
  findConversationEmailStateForUser: vi.fn(),
  findConversationFaqHandoffState: vi.fn(),
  findConversationIdentityForActivity: vi.fn(),
  findConversationNotificationContextRow: vi.fn(),
  findConversationTag: vi.fn(),
  findPublicAttachmentRecord: vi.fn(),
  findVisitorConversationEmailState: vi.fn(),
  updateVisitorPresenceSessionEmail: vi.fn(),
  getConversationVisitorActivity: vi.fn(),
  getPublicConversationAccess: vi.fn(),
  getSiteByPublicId: vi.fn(),
  hasConversationAccess: vi.fn(),
  insertConversationTag: vi.fn(),
  insertMessage: vi.fn(),
  loadConversationMessages: vi.fn(),
  migrateVisitorNoteIdentity: vi.fn(),
  queryConversationSummaries: vi.fn(),
  recordVisitorPresence: vi.fn(),
  syncVisitorContact: vi.fn(),
  updateConversationAssignmentRecord: vi.fn(),
  updateConversationEmailValue: vi.fn(),
  updateConversationStatusRecord: vi.fn(),
  upsertConversationFeedback: vi.fn(),
  upsertConversationRead: vi.fn(),
  upsertConversationTypingRecord: vi.fn(),
  upsertVisitorTypingRecord: vi.fn(),
  getWorkspaceAccess: vi.fn()
}));

vi.mock("@/lib/repositories/conversations-repository", () => ({
  findNextRoundRobinAssigneeUserId: mocks.findNextRoundRobinAssigneeUserId,
  deleteConversationTag: mocks.deleteConversationTag,
  deleteConversationTypingRecord: mocks.deleteConversationTypingRecord,
  findActiveConversationTyping: mocks.findActiveConversationTyping,
  findConversationById: mocks.findConversationById,
  findConversationEmailById: mocks.findConversationEmailById,
  findConversationEmailStateForUser: mocks.findConversationEmailStateForUser,
  findConversationFaqHandoffState: mocks.findConversationFaqHandoffState,
  findConversationIdentityForActivity: mocks.findConversationIdentityForActivity,
  findConversationNotificationContextRow: mocks.findConversationNotificationContextRow,
  findConversationTag: mocks.findConversationTag,
  findPublicAttachmentRecord: mocks.findPublicAttachmentRecord,
  insertConversationTag: mocks.insertConversationTag,
  updateConversationAssignmentRecord: mocks.updateConversationAssignmentRecord,
  updateConversationStatusRecord: mocks.updateConversationStatusRecord,
  upsertConversationFeedback: mocks.upsertConversationFeedback,
  upsertConversationRead: mocks.upsertConversationRead,
  upsertConversationTypingRecord: mocks.upsertConversationTypingRecord,
  upsertVisitorTypingRecord: mocks.upsertVisitorTypingRecord,
  deleteVisitorTypingRecord: mocks.deleteVisitorTypingRecord
}));
vi.mock("@/lib/repositories/workspace-repository", () => ({
  listActiveTeamMemberRows: vi.fn().mockResolvedValue([])
}));
vi.mock("@/lib/repositories/visitor-presence-repository", () => ({
  updateVisitorPresenceSessionEmail: mocks.updateVisitorPresenceSessionEmail
}));
vi.mock("@/lib/workspace-access", () => ({ getWorkspaceAccess: mocks.getWorkspaceAccess }));
vi.mock("@/lib/data/sites", () => ({ getSiteByPublicId: mocks.getSiteByPublicId }));
vi.mock("@/lib/data/visitor-notes", () => ({ migrateVisitorNoteIdentity: mocks.migrateVisitorNoteIdentity }));
vi.mock("@/lib/data/visitors", () => ({
  recordVisitorPresence: mocks.recordVisitorPresence,
  syncVisitorContact: mocks.syncVisitorContact
}));
vi.mock("@/lib/data/conversations-internals", () => ({
  ensureConversation: mocks.ensureConversation,
  getConversationVisitorActivity: mocks.getConversationVisitorActivity,
  getPublicConversationAccess: mocks.getPublicConversationAccess,
  hasPreviousVisitorConversation: vi.fn(),
  insertMessage: mocks.insertMessage,
  loadConversationMessages: mocks.loadConversationMessages,
  upsertMetadata: vi.fn()
}));
vi.mock("@/lib/data/shared", () => ({
  hasConversationAccess: mocks.hasConversationAccess,
  mapAttachment: vi.fn(),
  mapMessage: vi.fn(),
  mapSummary: (row: Record<string, unknown>) => ({ id: row.id, email: row.email ?? null, pageUrl: row.page_url ?? null }),
  queryConversationSummaries: mocks.queryConversationSummaries,
  updateConversationEmailValue: mocks.updateConversationEmailValue
}));

import {
  addTeamReply,
  addInboundReply,
  getAttachmentForPublic,
  getAttachmentForUser,
  getConversationEmail,
  getConversationNotificationContext,
  getConversationSummaryById,
  getPublicConversationMessages,
  getPublicConversationState,
  getPublicConversationTypingStatus,
  listConversationSummaries,
  markConversationRead,
  recordFeedback,
  toggleTag,
  updateConversationEmail,
  updateConversationStatus,
  updateConversationTyping,
  updateVisitorTyping
} from "@/lib/data/conversations";

describe("conversation data more", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getWorkspaceAccess.mockResolvedValue({ ownerUserId: "owner_1" });
    mocks.hasConversationAccess.mockResolvedValue(true);
    mocks.getPublicConversationAccess.mockResolvedValue(true);
    mocks.findConversationFaqHandoffState.mockResolvedValue(null);
    mocks.queryConversationSummaries.mockResolvedValue({ rowCount: 1, rows: [{ id: "conv_1", page_url: "https://example.com" }] });
    mocks.getConversationVisitorActivity.mockResolvedValue({ matchType: "email" });
  });

  it("guards public reads and attachments when access is missing", async () => {
    mocks.getPublicConversationAccess.mockResolvedValue(false);

    await expect(getPublicConversationMessages({ siteId: "site_1", sessionId: "session_1", conversationId: "conv_1" })).resolves.toBeNull();
    await expect(getPublicConversationTypingStatus({ siteId: "site_1", sessionId: "session_1", conversationId: "conv_1" })).resolves.toBeNull();
    await expect(getAttachmentForPublic({ attachmentId: "file_1", conversationId: "conv_1", siteId: "site_1", sessionId: "session_1" })).resolves.toBeNull();
    await expect(updateVisitorTyping({ siteId: "site_1", sessionId: "session_1", conversationId: "conv_1", typing: true })).resolves.toBe(false);
  });

  it("loads public messages, typing status, and public attachments when access is granted", async () => {
    mocks.loadConversationMessages.mockImplementation(async (_id: string, toUrl: (attachmentId: string) => string) => [{ href: toUrl("file_1") }]);
    mocks.findActiveConversationTyping.mockResolvedValue("user_1");
    mocks.findPublicAttachmentRecord.mockResolvedValue({ id: "file_1" });
    mocks.findConversationFaqHandoffState.mockResolvedValue({
      pending: true,
      preview: "Need pricing help",
      attachmentsCount: 0,
      isNewVisitor: true,
      highIntent: true,
      suggestions: {
        fallbackMessage: "None of these help? A team member will be with you shortly.",
        items: [
          {
            id: "faq_1",
            question: "What are your pricing plans?",
            answer: "We offer Free, Growth, and Business plans.",
            link: "https://example.com/pricing"
          }
        ]
      }
    });

    await expect(getPublicConversationMessages({ siteId: "site_1", sessionId: "session_1", conversationId: "conv_1" })).resolves.toEqual([
      { href: "/api/files/file_1?conversationId=conv_1&siteId=site_1&sessionId=session_1" }
    ]);
    await expect(getPublicConversationState({ siteId: "site_1", sessionId: "session_1", conversationId: "conv_1" })).resolves.toEqual({
      messages: [{ href: "/api/files/file_1?conversationId=conv_1&siteId=site_1&sessionId=session_1" }],
      faqSuggestions: {
        fallbackMessage: "None of these help? A team member will be with you shortly.",
        items: [
          {
            id: "faq_1",
            question: "What are your pricing plans?",
            answer: "We offer Free, Growth, and Business plans.",
            link: "https://example.com/pricing"
          }
        ]
      }
    });
    await expect(getPublicConversationTypingStatus({ siteId: "site_1", sessionId: "session_1", conversationId: "conv_1" })).resolves.toEqual({ teamTyping: "user_1" });
    await expect(getAttachmentForPublic({ attachmentId: "file_1", conversationId: "conv_1", siteId: "site_1", sessionId: "session_1" })).resolves.toEqual({ id: "file_1" });
  });

  it("handles team replies, inbound replies, and notification context branches", async () => {
    mocks.hasConversationAccess.mockResolvedValueOnce(false).mockResolvedValueOnce(true);
    mocks.insertMessage.mockResolvedValue({ id: "msg_1" });
    mocks.findConversationById.mockResolvedValueOnce({ site_id: "site_1", session_id: "session_1", email: "before@example.com" }).mockResolvedValueOnce(null);
    mocks.findConversationNotificationContextRow.mockResolvedValueOnce(null).mockResolvedValueOnce({ user_id: "owner_1", site_name: "Main site" });

    await expect(addTeamReply("conv_1", "Hello", "user_1")).resolves.toBe(false);
    await expect(addTeamReply("conv_1", "Hello", "user_1", [{ id: "file_1" }] as never)).resolves.toEqual({ id: "msg_1" });
    await addInboundReply("conv_1", "alex@example.com", "Reply", [
      {
        fileName: "brief.pdf",
        contentType: "application/pdf",
        sizeBytes: 5,
        content: Buffer.from("brief")
      }
    ]);
    await addInboundReply("conv_1", null, "Reply");
    await expect(getConversationNotificationContext("conv_1")).resolves.toBeNull();
    await expect(getConversationNotificationContext("conv_1")).resolves.toEqual({
      userId: "owner_1",
      siteName: "Main site",
      summary: { id: "conv_1", email: null, pageUrl: "https://example.com" }
    });
    expect(mocks.migrateVisitorNoteIdentity).toHaveBeenCalledWith(expect.objectContaining({ previousEmail: "before@example.com", nextEmail: "alex@example.com" }));
    expect(mocks.syncVisitorContact).toHaveBeenCalledWith({
      siteId: "site_1",
      sessionId: "session_1",
      conversationId: "conv_1",
      email: "alex@example.com"
    });
    expect(mocks.updateVisitorPresenceSessionEmail).toHaveBeenCalledWith({
      siteId: "site_1",
      sessionId: "session_1",
      email: "alex@example.com"
    });
    expect(mocks.updateConversationEmailValue).toHaveBeenCalledWith("conv_1", "alex@example.com", "merge");
    expect(mocks.insertMessage).toHaveBeenCalledWith(
      "conv_1",
      "user",
      "Reply",
      [
        {
          fileName: "brief.pdf",
          contentType: "application/pdf",
          sizeBytes: 5,
          content: Buffer.from("brief")
        }
      ],
      { reopenConversation: true }
    );
  });

  it("covers summary, tagging, email, read, status, attachment, and typing mutations", async () => {
    mocks.queryConversationSummaries.mockResolvedValueOnce({ rowCount: 1, rows: [{ id: "conv_1", page_url: "https://example.com", email: "alex@example.com" }] }).mockResolvedValueOnce({ rowCount: 0, rows: [] });
    mocks.findConversationTag.mockResolvedValueOnce("vip").mockResolvedValueOnce(null);
    mocks.findConversationEmailById.mockResolvedValueOnce(null).mockResolvedValueOnce("alex@example.com");
    mocks.findConversationIdentityForActivity.mockResolvedValueOnce({ site_id: "site_1", session_id: "session_1" }).mockResolvedValueOnce(null);
    mocks.findConversationEmailStateForUser.mockResolvedValue({ email: "alex@example.com" });
    mocks.findPublicAttachmentRecord.mockResolvedValue({ id: "file_1" });
    mocks.hasConversationAccess
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(true);

    await expect(listConversationSummaries("user_1")).resolves.toEqual([{ id: "conv_1", email: "alex@example.com", pageUrl: "https://example.com" }]);
    await expect(getConversationSummaryById("missing", "user_1")).resolves.toBeNull();
    await expect(toggleTag("conv_1", " VIP ", "user_1")).resolves.toBe(false);
    await expect(toggleTag("conv_1", " VIP ", "user_1")).resolves.toBe(true);
    await expect(toggleTag("conv_1", " New ", "user_1")).resolves.toBe(true);
    await recordFeedback("conv_1", "good");
    await expect(updateConversationEmail("conv_1", "alex@example.com", "user_1")).resolves.toEqual({ updated: false, welcomeEmailEligible: false });
    await expect(updateConversationEmail("conv_1", "alex@example.com", "user_1")).resolves.toEqual({ updated: true, welcomeEmailEligible: true });
    await expect(updateConversationEmail("conv_1", "alex@example.com", "user_1")).resolves.toEqual({ updated: true, welcomeEmailEligible: false });
    await expect(getConversationEmail("conv_1", "user_1")).resolves.toEqual({ email: "alex@example.com" });
    await expect(markConversationRead("conv_1", "user_1")).resolves.toBe(false);
    await expect(markConversationRead("conv_1", "user_1")).resolves.toBe(true);
    await expect(updateConversationStatus("conv_1", "resolved", "user_1")).resolves.toBeUndefined();
    await expect(getAttachmentForUser({ attachmentId: "file_1", conversationId: "conv_1", userId: "user_1" })).resolves.toBeNull();
    await expect(getAttachmentForUser({ attachmentId: "file_1", conversationId: "conv_1", userId: "user_1" })).resolves.toEqual({ id: "file_1" });
    await expect(updateConversationTyping({ conversationId: "conv_1", userId: "user_1", typing: false })).resolves.toBe(false);
    await expect(updateConversationTyping({ conversationId: "conv_1", userId: "user_1", typing: false })).resolves.toBe(true);
    await expect(updateConversationTyping({ conversationId: "conv_1", userId: "user_1", typing: true })).resolves.toBe(true);
    expect(mocks.deleteConversationTag).toHaveBeenCalledWith("conv_1", "vip");
    expect(mocks.insertConversationTag).toHaveBeenCalledWith("conv_1", "new");
    expect(mocks.upsertConversationFeedback).toHaveBeenCalledWith("conv_1", "good");
    expect(mocks.migrateVisitorNoteIdentity).toHaveBeenCalledWith(expect.objectContaining({ updatedByUserId: "user_1" }));
    expect(mocks.syncVisitorContact).toHaveBeenCalledWith({
      siteId: "site_1",
      sessionId: "session_1",
      conversationId: "conv_1",
      email: "alex@example.com"
    });
    expect(mocks.updateVisitorPresenceSessionEmail).toHaveBeenCalledWith({
      siteId: "site_1",
      sessionId: "session_1",
      email: "alex@example.com"
    });
    expect(mocks.upsertConversationRead).toHaveBeenCalledWith("user_1", "conv_1");
    expect(mocks.deleteConversationTypingRecord).toHaveBeenCalledWith("user_1", "conv_1");
    expect(mocks.upsertConversationTypingRecord).toHaveBeenCalledWith("user_1", "conv_1");
  });
});
