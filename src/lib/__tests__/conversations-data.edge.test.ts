const mocks = vi.hoisted(() => ({
  clearConversationFaqHandoffState: vi.fn(),
  ensureConversation: vi.fn(),
  findConversationById: vi.fn(),
  findConversationFaqHandoffState: vi.fn(),
  findConversationNotificationContextRow: vi.fn(),
  findVisitorConversationEmailState: vi.fn(),
  getSiteByPublicId: vi.fn(),
  hasPreviousVisitorConversation: vi.fn(),
  insertMessage: vi.fn(),
  isHighIntentPage: vi.fn(),
  migrateVisitorNoteIdentity: vi.fn(),
  overlayConversationSummaryWithLivePresence: vi.fn(),
  previewIncomingMessage: vi.fn(),
  queryConversationSummaries: vi.fn(),
  recordVisitorPresence: vi.fn(),
  setConversationFaqHandoffState: vi.fn(),
  syncVisitorContact: vi.fn(),
  getWorkspaceAccess: vi.fn(),
  updateConversationEmailValue: vi.fn(),
  updateVisitorConversationEmailRecord: vi.fn(),
  upsertMetadata: vi.fn()
}));

vi.mock("@/lib/repositories/conversations-repository", () => ({
  clearConversationFaqHandoffState: mocks.clearConversationFaqHandoffState,
  findConversationById: mocks.findConversationById,
  findConversationFaqHandoffState: mocks.findConversationFaqHandoffState,
  findConversationNotificationContextRow: mocks.findConversationNotificationContextRow,
  setConversationFaqHandoffState: mocks.setConversationFaqHandoffState,
  findVisitorConversationEmailState: mocks.findVisitorConversationEmailState,
  updateVisitorConversationEmailRecord: mocks.updateVisitorConversationEmailRecord
}));
vi.mock("@/lib/notification-utils", () => ({
  isHighIntentPage: mocks.isHighIntentPage,
  previewIncomingMessage: mocks.previewIncomingMessage
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
  getPublicConversationAccess: vi.fn(),
  hasPreviousVisitorConversation: mocks.hasPreviousVisitorConversation,
  insertMessage: mocks.insertMessage,
  loadConversationMessages: vi.fn(),
  upsertMetadata: mocks.upsertMetadata
}));
vi.mock("@/lib/data/shared", () => ({
  hasConversationAccess: vi.fn(),
  mapAttachment: vi.fn(),
  mapMessage: vi.fn(),
  mapSummary: (row: Record<string, unknown>) => ({ id: row.id, pageUrl: row.page_url, city: row.city, region: row.region, country: row.country }),
  overlayConversationSummaryWithLivePresence: mocks.overlayConversationSummaryWithLivePresence,
  queryConversationSummaries: mocks.queryConversationSummaries,
  updateConversationEmailValue: mocks.updateConversationEmailValue
}));

import {
  addInboundReply,
  createUserMessage,
  saveVisitorConversationEmail
} from "@/lib/data/conversations";

describe("conversation data edge cases", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.previewIncomingMessage.mockReturnValue("Preview");
    mocks.ensureConversation.mockResolvedValue({ conversationId: "conv_1", createdConversation: false, emailCaptured: false });
    mocks.findConversationFaqHandoffState.mockResolvedValue(null);
    mocks.findConversationNotificationContextRow.mockResolvedValue(null);
    mocks.getWorkspaceAccess.mockResolvedValue({ ownerUserId: "owner_1" });
    mocks.overlayConversationSummaryWithLivePresence.mockImplementation(async (summary: unknown) => summary);
    mocks.insertMessage.mockResolvedValue({ id: "msg_1" });
    mocks.queryConversationSummaries.mockResolvedValue({ rowCount: 0, rows: [] });
  });

  it("throws when the site cannot be found", async () => {
    mocks.getSiteByPublicId.mockResolvedValueOnce(null);

    await expect(
      createUserMessage({
        siteId: "site_missing",
        sessionId: "session_1",
        email: "alex@example.com",
        content: "Hello",
        attachments: [],
        metadata: {}
      } as never)
    ).rejects.toThrow("SITE_NOT_FOUND");
  });

  it("uses metadata fallbacks when no summary exists and the requested conversation belongs to another site", async () => {
    mocks.getSiteByPublicId.mockResolvedValueOnce({ id: "site_1", userId: "owner_1", name: "Main site" });
    mocks.findConversationById.mockResolvedValueOnce({ site_id: "site_2", email: "before@example.com", session_id: "session_old" });
    mocks.hasPreviousVisitorConversation.mockResolvedValueOnce(true);
    mocks.isHighIntentPage.mockReturnValueOnce(false);

    await expect(
      createUserMessage({
        siteId: "site_1",
        conversationId: "conv_1",
        sessionId: "session_1",
        email: "alex@example.com",
        content: "Hello",
        attachments: [],
        metadata: { pageUrl: "https://example.com/docs" }
      } as never)
    ).resolves.toMatchObject({
      pageUrl: "https://example.com/docs",
      location: null,
      visitorLabel: "alex@example.com",
      isNewConversation: false,
      isNewVisitor: false,
      highIntent: false,
      welcomeEmailEligible: false
    });
    expect(mocks.migrateVisitorNoteIdentity).toHaveBeenCalledWith(
      expect.objectContaining({ previousEmail: null, nextEmail: "alex@example.com" })
    );
  });

  it("requires a visitor email before saving it and returns false when no matching row exists", async () => {
    await expect(
      saveVisitorConversationEmail({
        siteId: "site_1",
        sessionId: "session_1",
        conversationId: "conv_1",
        email: "   "
      })
    ).rejects.toThrow("EMAIL_REQUIRED");

    mocks.findVisitorConversationEmailState.mockResolvedValueOnce(null);
    await expect(
      saveVisitorConversationEmail({
        siteId: "site_1",
        sessionId: "session_1",
        conversationId: "conv_1",
        email: "alex@example.com"
      })
    ).resolves.toEqual({
      updated: false,
      welcomeEmailEligible: false,
      ownerUserId: null
    });
  });

  it("still writes inbound replies when no existing conversation row is found", async () => {
    mocks.findConversationById.mockResolvedValueOnce(null);

    await expect(
      addInboundReply("conv_1", null, "Reply", [
        {
          fileName: "brief.pdf",
          contentType: "application/pdf",
          sizeBytes: 5,
          content: Buffer.from("brief")
        }
      ])
    ).resolves.toEqual({ id: "msg_1" });
    expect(mocks.migrateVisitorNoteIdentity).not.toHaveBeenCalled();
    expect(mocks.updateConversationEmailValue).toHaveBeenCalledWith("conv_1", null, "merge");
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
});
