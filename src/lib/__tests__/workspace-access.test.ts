const workspaceRepoMocks = vi.hoisted(() => ({
  acceptTeamInviteRecord: vi.fn(),
  findTeamInviteAccessRow: vi.fn(),
  findWorkspaceAccessRow: vi.fn(),
  listWorkspaceAccessRows: vi.fn(),
  upsertActiveTeamMembership: vi.fn()
}));

const onboardingMocks = vi.hoisted(() => ({
  updateUserOnboardingStep: vi.fn()
}));

vi.mock("@/lib/repositories/workspace-repository", () => workspaceRepoMocks);
vi.mock("@/lib/repositories/onboarding-repository", () => onboardingMocks);

import {
  acceptTeamInvite,
  getTeamInvitePreview,
  getWorkspaceAccess,
  listUserWorkspaces,
  validateTeamInvite
} from "../workspace-access";

describe("workspace access", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-30T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("maps current users to their workspace owner context", async () => {
    workspaceRepoMocks.findWorkspaceAccessRow.mockResolvedValueOnce({
      owner_user_id: "owner_123",
      role: "admin",
      owner_email: "owner@chatly.example",
      owner_created_at: "2026-03-27T00:00:00.000Z",
      team_name: "Acme Support",
      team_domain: "acme.example"
    });

    await expect(getWorkspaceAccess("member_123")).resolves.toEqual({
      ownerUserId: "owner_123",
      role: "admin",
      ownerEmail: "owner@chatly.example",
      ownerCreatedAt: "2026-03-27T00:00:00.000Z",
      teamName: "Acme Support",
      teamDomain: "acme.example"
    });
  });

  it("lists accessible workspaces and marks the current one active", async () => {
    workspaceRepoMocks.findWorkspaceAccessRow.mockResolvedValueOnce({
      owner_user_id: "owner_123",
      role: "admin",
      owner_email: "owner@chatly.example",
      owner_created_at: "2026-03-27T00:00:00.000Z",
      team_name: "Acme Support",
      team_domain: "acme.example"
    });
    workspaceRepoMocks.listWorkspaceAccessRows.mockResolvedValueOnce([
      {
        owner_user_id: "owner_123",
        role: "admin",
        owner_email: "owner@chatly.example",
        owner_created_at: "2026-03-27T00:00:00.000Z",
        team_name: "Acme Support",
        team_domain: "acme.example"
      },
      {
        owner_user_id: "owner_999",
        role: "member",
        owner_email: "other@chatly.example",
        owner_created_at: "2026-03-26T00:00:00.000Z",
        team_name: "Beta Team",
        team_domain: null
      }
    ]);

    await expect(listUserWorkspaces("member_456")).resolves.toEqual([
      expect.objectContaining({ ownerUserId: "owner_123", isActive: true }),
      expect.objectContaining({ ownerUserId: "owner_999", isActive: false })
    ]);
  });

  it("surfaces expired invite previews after seven days", async () => {
    workspaceRepoMocks.findTeamInviteAccessRow.mockResolvedValueOnce({
      id: "invite_123",
      owner_user_id: "owner_123",
      email: "teammate@chatly.example",
      role: "member",
      status: "pending",
      message: "Join us",
      created_at: "2026-03-01T00:00:00.000Z",
      updated_at: "2026-03-01T00:00:00.000Z",
      accepted_at: null,
      accepted_by_user_id: null,
      team_name: "Acme Support",
      team_domain: "acme.example",
      owner_email: "owner@chatly.example",
      owner_first_name: "Avery",
      owner_last_name: "Stone"
    });

    const preview = await getTeamInvitePreview("invite_123");
    expect(preview.state).toBe("expired");
    expect(preview.teamName).toBe("Acme Support");
    expect(preview.inviterName).toBe("Avery Stone");
  });

  it("validates invited emails before acceptance", async () => {
    workspaceRepoMocks.findTeamInviteAccessRow.mockResolvedValueOnce({
      id: "invite_123",
      owner_user_id: "owner_123",
      email: "teammate@chatly.example",
      role: "member",
      status: "pending",
      message: "",
      created_at: "2026-03-28T00:00:00.000Z",
      updated_at: "2026-03-28T00:00:00.000Z",
      accepted_at: null,
      accepted_by_user_id: null,
      team_name: "Acme Support",
      team_domain: null,
      owner_email: "owner@chatly.example",
      owner_first_name: null,
      owner_last_name: null
    });

    await expect(validateTeamInvite("invite_123", "other@chatly.example")).rejects.toThrow(
      "INVITE_EMAIL_MISMATCH"
    );
  });

  it("accepts pending invites by creating memberships and finishing onboarding", async () => {
    workspaceRepoMocks.findTeamInviteAccessRow.mockResolvedValueOnce({
      id: "invite_123",
      owner_user_id: "owner_123",
      email: "teammate@chatly.example",
      role: "admin",
      status: "pending",
      message: "Join us",
      created_at: "2026-03-28T00:00:00.000Z",
      updated_at: "2026-03-28T00:00:00.000Z",
      accepted_at: null,
      accepted_by_user_id: null,
      team_name: "Acme Support",
      team_domain: "acme.example",
      owner_email: "owner@chatly.example",
      owner_first_name: "Avery",
      owner_last_name: "Stone"
    });

    const result = await acceptTeamInvite({
      inviteId: "invite_123",
      userId: "member_123",
      email: "teammate@chatly.example"
    });

    expect(result).toEqual({
      ownerUserId: "owner_123",
      alreadyAccepted: false
    });
    expect(workspaceRepoMocks.upsertActiveTeamMembership).toHaveBeenCalledWith({
      ownerUserId: "owner_123",
      memberUserId: "member_123",
      role: "admin"
    });
    expect(workspaceRepoMocks.acceptTeamInviteRecord).toHaveBeenCalledWith("invite_123", "member_123");
    expect(onboardingMocks.updateUserOnboardingStep).toHaveBeenCalledWith("member_123", "done");
  });

});
