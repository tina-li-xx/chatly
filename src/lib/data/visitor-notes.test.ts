const mocks = vi.hoisted(() => ({
  getWorkspaceAccess: vi.fn(),
  hasConversationAccess: vi.fn(),
  findConversationIdentityForActivity: vi.fn(),
  findSiteRowForOwner: vi.fn(),
  findVisitorNoteRow: vi.fn(),
  upsertVisitorNoteRow: vi.fn(),
  deleteVisitorNoteRow: vi.fn()
}));

vi.mock("@/lib/workspace-access", () => ({
  getWorkspaceAccess: mocks.getWorkspaceAccess
}));

vi.mock("@/lib/repositories/conversations-read-repository", () => ({
  findConversationIdentityForActivity: mocks.findConversationIdentityForActivity
}));

vi.mock("./shared", () => ({
  hasConversationAccess: mocks.hasConversationAccess
}));

vi.mock("@/lib/repositories/visitor-notes-repository", () => ({
  findSiteRowForOwner: mocks.findSiteRowForOwner,
  findVisitorNoteRow: mocks.findVisitorNoteRow,
  upsertVisitorNoteRow: mocks.upsertVisitorNoteRow,
  deleteVisitorNoteRow: mocks.deleteVisitorNoteRow
}));

import {
  getConversationVisitorNote,
  getSiteVisitorNote,
  updateConversationVisitorNote,
  migrateVisitorNoteIdentity,
  updateSiteVisitorNote
} from "./visitor-notes";

describe("visitor notes data", () => {
  beforeEach(() => {
    mocks.getWorkspaceAccess.mockResolvedValue({ ownerUserId: "owner_123" });
    mocks.hasConversationAccess.mockResolvedValue(true);
    mocks.findSiteRowForOwner.mockResolvedValue({ id: "site_1" });
    mocks.findVisitorNoteRow.mockReset();
    mocks.upsertVisitorNoteRow.mockReset();
    mocks.deleteVisitorNoteRow.mockReset();
  });

  it("loads conversation notes using email identity when email exists", async () => {
    mocks.findConversationIdentityForActivity.mockResolvedValueOnce({
      site_id: "site_1",
      email: "alex@example.com",
      session_id: "session_1"
    });
    mocks.findVisitorNoteRow.mockResolvedValueOnce({
      site_id: "site_1",
      identity_type: "email",
      identity_value: "alex@example.com",
      note: "Decision maker.",
      mentions_json: [],
      updated_at: "2026-03-29T10:00:00.000Z"
    });

    const result = await getConversationVisitorNote("conv_1", "user_123");

    expect(mocks.findVisitorNoteRow).toHaveBeenCalledWith("site_1", "email", "alex@example.com");
    expect(result).toEqual({
      note: "Decision maker.",
      updatedAt: "2026-03-29T10:00:00.000Z",
      mentions: []
    });
  });

  it("clears a site note when the saved text is blank", async () => {
    const result = await updateSiteVisitorNote({
      siteId: "site_1",
      sessionId: "session_1",
      note: "   ",
      mentions: [],
      userId: "user_123"
    });

    expect(mocks.deleteVisitorNoteRow).toHaveBeenCalledWith("site_1", "session", "session_1");
    expect(result).toEqual({ note: null, updatedAt: null, mentions: [] });
  });

  it("handles site lookups without access or identity", async () => {
    mocks.findSiteRowForOwner.mockResolvedValueOnce(null).mockResolvedValueOnce({ id: "site_1" });

    await expect(
      getSiteVisitorNote({
        siteId: "site_1",
        sessionId: "session_1",
        userId: "user_123"
      })
    ).resolves.toBeNull();

    await expect(
      getSiteVisitorNote({
        siteId: "site_1",
        sessionId: "   ",
        email: "",
        userId: "user_123"
      })
    ).resolves.toEqual({ note: null, updatedAt: null, mentions: [] });
  });

  it("updates conversation notes when an identity exists and returns null when it does not", async () => {
    mocks.findConversationIdentityForActivity
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        site_id: "site_1",
        email: null,
        session_id: "session_1"
      });
    mocks.upsertVisitorNoteRow.mockResolvedValueOnce({
      site_id: "site_1",
      identity_type: "session",
      identity_value: "session_1",
      note: "Needs pricing follow-up",
      mentions_json: [],
      updated_at: "2026-03-29T10:30:00.000Z"
    });

    await expect(updateConversationVisitorNote("conv_missing", "hello", [], "user_123")).resolves.toBeNull();
    await expect(updateConversationVisitorNote("conv_1", "Needs pricing follow-up", [], "user_123")).resolves.toEqual({
      note: "Needs pricing follow-up",
      updatedAt: "2026-03-29T10:30:00.000Z",
      mentions: []
    });
  });

  it("promotes an anonymous session note to email identity", async () => {
    mocks.findVisitorNoteRow
      .mockResolvedValueOnce({
        site_id: "site_1",
        identity_type: "session",
        identity_value: "session_1",
        note: "Asked about SOC 2.",
        mentions_json: [],
        updated_at: "2026-03-29T10:00:00.000Z"
      })
      .mockResolvedValueOnce(null);

    await migrateVisitorNoteIdentity({
      siteId: "site_1",
      sessionId: "session_1",
      nextEmail: "alex@example.com",
      updatedByUserId: "user_123"
    });

    expect(mocks.upsertVisitorNoteRow).toHaveBeenCalledWith({
      siteId: "site_1",
      identityType: "email",
      identityValue: "alex@example.com",
      note: "Asked about SOC 2.",
      mentions: [],
      updatedByUserId: "user_123"
    });
    expect(mocks.deleteVisitorNoteRow).toHaveBeenCalledWith("site_1", "session", "session_1");
  });

  it("keeps an existing email note when migrating from session identity", async () => {
    mocks.findVisitorNoteRow
      .mockResolvedValueOnce({
        site_id: "site_1",
        identity_type: "session",
        identity_value: "session_1",
        note: "Anonymous note.",
        mentions_json: [],
        updated_at: "2026-03-29T10:00:00.000Z"
      })
      .mockResolvedValueOnce({
        site_id: "site_1",
        identity_type: "email",
        identity_value: "alex@example.com",
        note: "Existing email note.",
        mentions_json: [],
        updated_at: "2026-03-29T11:00:00.000Z"
      });

    await migrateVisitorNoteIdentity({
      siteId: "site_1",
      sessionId: "session_1",
      nextEmail: "alex@example.com"
    });

    expect(mocks.upsertVisitorNoteRow).not.toHaveBeenCalled();
    expect(mocks.deleteVisitorNoteRow).toHaveBeenCalledWith("site_1", "session", "session_1");
  });

  it("returns early when there is nothing meaningful to migrate", async () => {
    await migrateVisitorNoteIdentity({
      siteId: "site_1",
      sessionId: "session_1",
      previousEmail: "alex@example.com",
      nextEmail: "alex@example.com"
    });
    await migrateVisitorNoteIdentity({
      siteId: "site_1",
      sessionId: "session_1"
    });

    mocks.findVisitorNoteRow.mockResolvedValueOnce(null);
    await migrateVisitorNoteIdentity({
      siteId: "site_1",
      sessionId: "session_1",
      nextEmail: "alex@example.com"
    });

    expect(mocks.upsertVisitorNoteRow).not.toHaveBeenCalled();
    expect(mocks.deleteVisitorNoteRow).not.toHaveBeenCalled();
  });
});
