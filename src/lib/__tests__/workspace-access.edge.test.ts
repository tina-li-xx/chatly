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
const liveEventMocks = vi.hoisted(() => ({
  publishDashboardLive: vi.fn()
}));

vi.mock("@/lib/repositories/workspace-repository", () => workspaceRepoMocks);
vi.mock("@/lib/repositories/onboarding-repository", () => onboardingMocks);
vi.mock("@/lib/live-events", () => liveEventMocks);

import {
  acceptTeamInvite,
  getTeamInvitePreview,
  getWorkspaceAccess,
  validateTeamInvite
} from "@/lib/workspace-access";

function inviteRow(overrides: Record<string, unknown> = {}) {
  return {
    id: "invite_123",
    owner_user_id: "owner_123",
    email: "teammate@example.com",
    role: "member",
    status: "pending",
    message: "",
    created_at: "2026-03-29T00:00:00.000Z",
    updated_at: "2026-03-29T00:00:00.000Z",
    accepted_at: null,
    accepted_by_user_id: null,
    team_name: "Acme Team",
    team_domain: null,
    owner_email: "owner@example.com",
    owner_first_name: "Avery",
    owner_last_name: "Stone",
    ...overrides
  };
}

describe("workspace access edge cases", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-30T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("throws when the user has no workspace access row", async () => {
    workspaceRepoMocks.findWorkspaceAccessRow.mockResolvedValueOnce(null);
    await expect(getWorkspaceAccess("missing_user")).rejects.toThrow("USER_NOT_FOUND");
  });

  it("builds missing and terminal invite previews", async () => {
    workspaceRepoMocks.findTeamInviteAccessRow
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(inviteRow({ status: "revoked" }))
      .mockResolvedValueOnce(inviteRow({ status: "accepted" }));

    await expect(getTeamInvitePreview("invite_missing")).resolves.toMatchObject({
      teamName: "Workspace",
      inviterName: "Chatting",
      state: "missing"
    });
    await expect(getTeamInvitePreview("invite_revoked")).resolves.toMatchObject({ state: "revoked" });
    await expect(getTeamInvitePreview("invite_accepted")).resolves.toMatchObject({ state: "accepted" });
  });

  it.each([
    [null, "INVITE_NOT_FOUND"],
    [inviteRow({ status: "revoked" }), "INVITE_REVOKED"],
    [inviteRow({ status: "accepted" }), "INVITE_ALREADY_ACCEPTED"],
    [inviteRow({ updated_at: "2026-03-20T00:00:00.000Z" }), "INVITE_EXPIRED"]
  ])("rejects invalid invite rows with %s", async (row, errorMessage) => {
    workspaceRepoMocks.findTeamInviteAccessRow.mockResolvedValueOnce(row);
    await expect(validateTeamInvite("invite_123", "teammate@example.com")).rejects.toThrow(errorMessage);
  });

  it("accepts pending invites with case-insensitive email matching", async () => {
    workspaceRepoMocks.findTeamInviteAccessRow.mockResolvedValueOnce(inviteRow({ email: "TEAMMATE@EXAMPLE.COM" }));
    await expect(validateTeamInvite("invite_123", "teammate@example.com")).resolves.toMatchObject({
      id: "invite_123"
    });
  });

  it("marks onboarding complete when the same user already accepted the invite", async () => {
    workspaceRepoMocks.findTeamInviteAccessRow.mockResolvedValueOnce(
      inviteRow({ status: "accepted", accepted_by_user_id: "member_123" })
    );

    await expect(
      acceptTeamInvite({
        inviteId: "invite_123",
        userId: "member_123",
        email: "teammate@example.com"
      })
    ).resolves.toEqual({
      ownerUserId: "owner_123",
      alreadyAccepted: true
    });
    expect(onboardingMocks.updateUserOnboardingStep).toHaveBeenCalledWith("member_123", "done");
    expect(liveEventMocks.publishDashboardLive).not.toHaveBeenCalled();
    expect(workspaceRepoMocks.upsertActiveTeamMembership).not.toHaveBeenCalled();
  });

  it("blocks owners from accepting their own invite", async () => {
    workspaceRepoMocks.findTeamInviteAccessRow.mockResolvedValueOnce(inviteRow({ owner_user_id: "owner_123" }));

    await expect(
      acceptTeamInvite({
        inviteId: "invite_123",
        userId: "owner_123",
        email: "teammate@example.com"
      })
    ).rejects.toThrow("INVITE_OWNER_CONFLICT");
  });
});
