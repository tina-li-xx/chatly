const mocks = vi.hoisted(() => ({
  getWorkspaceAccess: vi.fn(),
  listDashboardTeamMembers: vi.fn(),
  listTeamInvites: vi.fn()
}));

vi.mock("@/lib/workspace-access", () => ({ getWorkspaceAccess: mocks.getWorkspaceAccess }));
vi.mock("@/lib/data/dashboard-team-members", () => ({ listDashboardTeamMembers: mocks.listDashboardTeamMembers }));
vi.mock("@/lib/data/settings", () => ({ listTeamInvites: mocks.listTeamInvites }));

import { getDashboardTeamPageData } from "@/lib/data/team-page";

describe("team page data", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getWorkspaceAccess.mockResolvedValue({ ownerUserId: "owner_1" });
    mocks.listDashboardTeamMembers.mockResolvedValue([{ id: "member_1" }]);
    mocks.listTeamInvites.mockResolvedValue([{ id: "invite_1" }]);
  });

  it("loads members for the current user and invites for the workspace owner", async () => {
    await expect(getDashboardTeamPageData("user_1")).resolves.toEqual({
      teamMembers: [{ id: "member_1" }],
      teamInvites: [{ id: "invite_1" }]
    });

    expect(mocks.listDashboardTeamMembers).toHaveBeenCalledWith("user_1");
    expect(mocks.listTeamInvites).toHaveBeenCalledWith("owner_1");
  });
});
