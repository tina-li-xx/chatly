const mocks = vi.hoisted(() => ({
  countActiveTeamMembershipRows: vi.fn(),
  findEmailTemplateSettingsRow: vi.fn(),
  insertTeamInviteRecord: vi.fn(),
  listPendingTeamInviteRows: vi.fn(),
  listSitesForUser: vi.fn(),
  maybeSendTeamExpansionEmail: vi.fn(),
  revokePendingTeamInvite: vi.fn(),
  sendTeamInvitationEmail: vi.fn(),
  touchPendingTeamInvite: vi.fn(),
  updatePendingTeamInviteRole: vi.fn()
}));

vi.mock("node:crypto", async () => {
  const actual = await vi.importActual<typeof import("node:crypto")>("node:crypto");
  return { ...actual, randomUUID: () => "invite_123" };
});
vi.mock("@/lib/chatting-transactional-email-senders", () => ({ sendTeamInvitationEmail: mocks.sendTeamInvitationEmail }));
vi.mock("@/lib/env", () => ({ getPublicAppUrl: () => "https://app.example" }));
vi.mock("@/lib/growth-outreach", () => ({ maybeSendTeamExpansionEmail: mocks.maybeSendTeamExpansionEmail }));
vi.mock("@/lib/repositories/settings-repository", () => ({
  findEmailTemplateSettingsRow: mocks.findEmailTemplateSettingsRow,
  insertTeamInviteRecord: mocks.insertTeamInviteRecord,
  listPendingTeamInviteRows: mocks.listPendingTeamInviteRows,
  revokePendingTeamInvite: mocks.revokePendingTeamInvite,
  touchPendingTeamInvite: mocks.touchPendingTeamInvite,
  updatePendingTeamInviteRole: mocks.updatePendingTeamInviteRole
}));
vi.mock("@/lib/repositories/workspace-repository", () => ({
  countActiveTeamMembershipRows: mocks.countActiveTeamMembershipRows
}));
vi.mock("@/lib/data/sites", () => ({ listSitesForUser: mocks.listSitesForUser }));

import {
  createTeamInvite,
  listTeamInvites,
  resendTeamInvite,
  revokeTeamInvite,
  updateTeamInviteRole
} from "@/lib/data/settings";

const inviteRows = [
  {
    id: "invite_123",
    email: "alex@example.com",
    role: "member",
    status: "pending",
    message: "Join us",
    created_at: "2026-03-29T10:00:00.000Z",
    updated_at: "2026-03-29T10:05:00.000Z"
  }
];

describe("settings data team invites", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.listPendingTeamInviteRows.mockResolvedValue(inviteRows);
    mocks.findEmailTemplateSettingsRow.mockResolvedValue({
      email: "owner@usechatting.com",
      first_name: "Tina",
      last_name: "Bauer"
    });
    mocks.listSitesForUser.mockResolvedValue([{ name: "Main site", domain: "https://usechatting.com" }]);
    mocks.countActiveTeamMembershipRows.mockResolvedValue(2);
    mocks.sendTeamInvitationEmail.mockResolvedValue(undefined);
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("creates a normalized invite, queues growth outreach, and sends the invite email", async () => {
    const invites = await createTeamInvite({
      ownerUserId: "owner_1",
      email: " Alex@example.com ",
      role: "member",
      message: " Join us "
    });

    expect(mocks.insertTeamInviteRecord).toHaveBeenCalledWith({
      inviteId: "invite_123",
      ownerUserId: "owner_1",
      email: "alex@example.com",
      role: "member",
      message: "Join us"
    });
    expect(mocks.maybeSendTeamExpansionEmail).toHaveBeenCalledWith("owner_1");
    expect(mocks.sendTeamInvitationEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "alex@example.com",
        inviterName: "Tina Bauer",
        teamName: "Main site",
        memberCount: 3,
        inviteUrl: "https://app.example/invite?invite=invite_123&email=alex%40example.com"
      })
    );
    expect(invites).toEqual([
      {
        id: "invite_123",
        email: "alex@example.com",
        role: "member",
        status: "pending",
        message: "Join us",
        createdAt: "2026-03-29T10:00:00.000Z",
        updatedAt: "2026-03-29T10:05:00.000Z"
      }
    ]);
  });

  it("throws when the invite email is missing", async () => {
    await expect(createTeamInvite({ ownerUserId: "owner_1", email: "   ", role: "admin" })).rejects.toThrow("MISSING_EMAIL");
  });

  it("resends invites and swallows email delivery failures after logging", async () => {
    mocks.sendTeamInvitationEmail.mockRejectedValueOnce(new Error("smtp down"));

    await expect(resendTeamInvite("owner_1", "invite_123")).resolves.toHaveLength(1);

    expect(mocks.touchPendingTeamInvite).toHaveBeenCalledWith("owner_1", "invite_123");
    expect(console.error).toHaveBeenCalledWith("team invite resend email failed", expect.any(Error));
  });

  it("lists, updates, and revokes pending team invites", async () => {
    await expect(listTeamInvites("owner_1")).resolves.toHaveLength(1);
    await expect(updateTeamInviteRole("owner_1", "invite_123", "admin")).resolves.toEqual(
      expect.arrayContaining([expect.objectContaining({ role: "member" })])
    );
    await expect(revokeTeamInvite("owner_1", "invite_123")).resolves.toEqual(
      expect.arrayContaining([expect.objectContaining({ id: "invite_123" })])
    );

    expect(mocks.updatePendingTeamInviteRole).toHaveBeenCalledWith("owner_1", "invite_123", "admin");
    expect(mocks.revokePendingTeamInvite).toHaveBeenCalledWith("owner_1", "invite_123");
  });

  it("skips email sending when the owner profile cannot be loaded", async () => {
    mocks.findEmailTemplateSettingsRow.mockResolvedValueOnce(null);
    await expect(createTeamInvite({ ownerUserId: "owner_1", email: "alex@example.com", role: "member" })).resolves.toHaveLength(1);
    expect(mocks.sendTeamInvitationEmail).not.toHaveBeenCalled();
  });

  it("uses email-based fallbacks and ignores resend requests for missing invites", async () => {
    mocks.findEmailTemplateSettingsRow.mockResolvedValueOnce({
      email: "owner.person@example.com",
      first_name: "",
      last_name: ""
    });
    mocks.listSitesForUser.mockResolvedValueOnce([]);

    await createTeamInvite({ ownerUserId: "owner_1", email: "alex@example.com", role: "member" });
    expect(mocks.sendTeamInvitationEmail).toHaveBeenCalledWith(expect.objectContaining({
      inviterName: "Owner Person",
      teamName: "Owner Person Team",
      teamWebsite: null
    }));

    await resendTeamInvite("owner_1", "invite_missing");
    expect(mocks.sendTeamInvitationEmail).toHaveBeenCalledTimes(1);
  });
});
