const mocks = vi.hoisted(() => ({
  getWorkspaceAccess: vi.fn(),
  hasConversationAccess: vi.fn(),
  findConversationIdentityForActivity: vi.fn(),
  findSiteRowForOwner: vi.fn(),
  findVisitorNoteRow: vi.fn(),
  upsertVisitorNoteRow: vi.fn(),
  deleteVisitorNoteRow: vi.fn()
}));

vi.mock("@/lib/workspace-access", () => ({ getWorkspaceAccess: mocks.getWorkspaceAccess }));
vi.mock("@/lib/repositories/conversations-read-repository", () => ({
  findConversationIdentityForActivity: mocks.findConversationIdentityForActivity
}));
vi.mock("@/lib/data/shared", () => ({
  hasConversationAccess: mocks.hasConversationAccess
}));
vi.mock("@/lib/repositories/visitor-notes-repository", () => ({
  deleteVisitorNoteRow: mocks.deleteVisitorNoteRow,
  findSiteRowForOwner: mocks.findSiteRowForOwner,
  findVisitorNoteRow: mocks.findVisitorNoteRow,
  upsertVisitorNoteRow: mocks.upsertVisitorNoteRow
}));

import {
  getConversationVisitorNote,
  getSiteVisitorNote,
  updateConversationVisitorNote,
  updateSiteVisitorNote
} from "@/lib/data/visitor-notes";

describe("visitor notes edge cases", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getWorkspaceAccess.mockResolvedValue({ ownerUserId: "owner_123" });
    mocks.hasConversationAccess.mockResolvedValue(true);
    mocks.findSiteRowForOwner.mockResolvedValue({ id: "site_1" });
  });

  it("returns null when a conversation has no resolvable visitor identity", async () => {
    mocks.findConversationIdentityForActivity.mockResolvedValueOnce(null);
    await expect(getConversationVisitorNote("conv_1", "user_123")).resolves.toBeNull();
  });

  it("returns empty note data when a conversation identity exists but no note does", async () => {
    mocks.findConversationIdentityForActivity.mockResolvedValueOnce({
      site_id: "site_1",
      email: "ALEX@EXAMPLE.COM",
      session_id: "session_1"
    });
    mocks.findVisitorNoteRow.mockResolvedValueOnce(null);

    await expect(getConversationVisitorNote("conv_1", "user_123")).resolves.toEqual({
      note: null,
      updatedAt: null,
      mentions: []
    });
    expect(mocks.findVisitorNoteRow).toHaveBeenCalledWith("site_1", "email", "alex@example.com");
  });

  it("loads site notes using email identity when email is provided", async () => {
    mocks.findVisitorNoteRow.mockResolvedValueOnce({
      site_id: "site_1",
      identity_type: "email",
      identity_value: "alex@example.com",
      note: "VIP visitor",
      mentions_json: [],
      updated_at: "2026-03-29T10:00:00.000Z"
    });

    await expect(
      getSiteVisitorNote({
        siteId: "site_1",
        email: "ALEX@EXAMPLE.COM",
        userId: "user_123"
      })
    ).resolves.toEqual({
      note: "VIP visitor",
      updatedAt: "2026-03-29T10:00:00.000Z",
      mentions: []
    });
    expect(mocks.findVisitorNoteRow).toHaveBeenCalledWith("site_1", "email", "alex@example.com");
  });

  it("returns null when the user cannot edit site notes", async () => {
    mocks.findSiteRowForOwner.mockResolvedValueOnce(null);
    await expect(
      updateSiteVisitorNote({
        siteId: "site_1",
        sessionId: "session_1",
        note: "Follow up",
        mentions: [],
        userId: "user_123"
      })
    ).resolves.toBeNull();
  });

  it("deletes conversation notes when the trimmed body is blank", async () => {
    mocks.findConversationIdentityForActivity.mockResolvedValueOnce({
      site_id: "site_1",
      email: null,
      session_id: "session_1"
    });

    await expect(updateConversationVisitorNote("conv_1", "   ", [], "user_123")).resolves.toEqual({
      note: null,
      updatedAt: null,
      mentions: []
    });
    expect(mocks.deleteVisitorNoteRow).toHaveBeenCalledWith("site_1", "session", "session_1");
  });

  it("saves trimmed site notes with email identity", async () => {
    mocks.upsertVisitorNoteRow.mockResolvedValueOnce({
      site_id: "site_1",
      identity_type: "email",
      identity_value: "alex@example.com",
      note: "Needs enterprise pricing",
      mentions_json: [],
      updated_at: "2026-03-29T12:00:00.000Z"
    });

    await expect(
      updateSiteVisitorNote({
        siteId: "site_1",
        email: "alex@example.com",
        note: "  Needs enterprise pricing  ",
        mentions: [],
        userId: "user_123"
      })
    ).resolves.toEqual({
      note: "Needs enterprise pricing",
      updatedAt: "2026-03-29T12:00:00.000Z",
      mentions: []
    });
  });
});
