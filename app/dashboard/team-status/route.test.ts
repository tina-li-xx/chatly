const mocks = vi.hoisted(() => ({
  getDashboardHomeTeamStatusData: vi.fn(),
  requireJsonRouteUser: vi.fn()
}));

vi.mock("@/lib/data/dashboard-home", () => ({
  getDashboardHomeTeamStatusData: mocks.getDashboardHomeTeamStatusData
}));

vi.mock("@/lib/route-helpers", () => ({
  jsonOk: (body: Record<string, unknown>, status = 200) =>
    Response.json({ ok: true, ...body }, { status }),
  requireJsonRouteUser: mocks.requireJsonRouteUser
}));

import { GET } from "./route";

describe("dashboard team status route", () => {
  it("returns auth responses directly", async () => {
    mocks.requireJsonRouteUser.mockResolvedValueOnce({
      response: Response.json({ ok: false, error: "auth" }, { status: 401 })
    });

    const response = await GET();
    expect(response.status).toBe(401);
  });

  it("loads team status for the current workspace", async () => {
    mocks.requireJsonRouteUser.mockResolvedValueOnce({
      user: { id: "user_123", workspaceOwnerId: "owner_123" }
    });
    mocks.getDashboardHomeTeamStatusData.mockResolvedValueOnce({
      teamMembers: [{ id: "member_1" }],
      pendingInviteCount: 2
    });

    const response = await GET();

    expect(mocks.getDashboardHomeTeamStatusData).toHaveBeenCalledWith("user_123", "owner_123");
    expect(await response.json()).toEqual({
      ok: true,
      teamMembers: [{ id: "member_1" }],
      pendingInviteCount: 2
    });
  });
});
