const mocks = vi.hoisted(() => ({
  createTeamInvite: vi.fn(),
  resendTeamInvite: vi.fn(),
  revokeTeamInvite: vi.fn(),
  updateTeamInviteRole: vi.fn(),
  requireJsonRouteUser: vi.fn()
}));

vi.mock("@/lib/data", () => ({
  createTeamInvite: mocks.createTeamInvite,
  resendTeamInvite: mocks.resendTeamInvite,
  revokeTeamInvite: mocks.revokeTeamInvite,
  updateTeamInviteRole: mocks.updateTeamInviteRole
}));

vi.mock("@/lib/route-helpers", () => ({
  jsonError: (error: string, status: number) =>
    Response.json({ ok: false, error }, { status }),
  jsonOk: (body: Record<string, unknown>, status = 200) =>
    Response.json({ ok: true, ...body }, { status }),
  requireJsonRouteUser: mocks.requireJsonRouteUser
}));

import { POST } from "./route";

describe("dashboard team route", () => {
  beforeEach(() => {
    mocks.requireJsonRouteUser.mockResolvedValue({
      user: {
        id: "user_123",
        email: "hello@chatting.example",
        createdAt: "2026-03-27T00:00:00.000Z",
        workspaceOwnerId: "owner_123",
        workspaceRole: "admin"
      }
    });
  });

  it("creates invites", async () => {
    mocks.createTeamInvite.mockResolvedValueOnce([{ id: "invite_1" }]);

    const response = await POST(
      new Request("http://localhost/dashboard/settings/team", {
        method: "POST",
        body: JSON.stringify({
          action: "invite",
          email: "new@chatting.example",
          role: "admin",
          message: "Welcome"
        })
      })
    );

    expect(mocks.createTeamInvite).toHaveBeenCalledWith({
      ownerUserId: "owner_123",
      email: "new@chatting.example",
      role: "admin",
      message: "Welcome"
    });
    expect(await response.json()).toEqual({ ok: true, invites: [{ id: "invite_1" }] });
  });

  it("rejects invite actions without an invite id", async () => {
    const response = await POST(
      new Request("http://localhost/dashboard/settings/team", {
        method: "POST",
        body: JSON.stringify({ action: "remove" })
      })
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ ok: false, error: "invite-id-missing" });
  });

  it("routes resend, remove, and role updates to the right service calls", async () => {
    mocks.resendTeamInvite.mockResolvedValueOnce([{ id: "invite_resend" }]);
    let response = await POST(
      new Request("http://localhost/dashboard/settings/team", {
        method: "POST",
        body: JSON.stringify({ action: "resend", inviteId: "invite_1" })
      })
    );
    expect(mocks.resendTeamInvite).toHaveBeenCalledWith("owner_123", "invite_1");
    expect((await response.json()).invites).toEqual([{ id: "invite_resend" }]);

    mocks.revokeTeamInvite.mockResolvedValueOnce([{ id: "invite_remove" }]);
    response = await POST(
      new Request("http://localhost/dashboard/settings/team", {
        method: "POST",
        body: JSON.stringify({ action: "remove", inviteId: "invite_1" })
      })
    );
    expect(mocks.revokeTeamInvite).toHaveBeenCalledWith("owner_123", "invite_1");
    expect((await response.json()).invites).toEqual([{ id: "invite_remove" }]);

    mocks.updateTeamInviteRole.mockResolvedValueOnce([{ id: "invite_role" }]);
    response = await POST(
      new Request("http://localhost/dashboard/settings/team", {
        method: "POST",
        body: JSON.stringify({ action: "role", inviteId: "invite_1", role: "admin" })
      })
    );
    expect(mocks.updateTeamInviteRole).toHaveBeenCalledWith("owner_123", "invite_1", "admin");
    expect((await response.json()).invites).toEqual([{ id: "invite_role" }]);
  });

  it("blocks members from managing invites", async () => {
    mocks.requireJsonRouteUser.mockResolvedValueOnce({
      user: {
        id: "user_123",
        email: "hello@chatting.example",
        createdAt: "2026-03-27T00:00:00.000Z",
        workspaceOwnerId: "owner_123",
        workspaceRole: "member"
      }
    });

    const response = await POST(
      new Request("http://localhost/dashboard/settings/team", {
        method: "POST",
        body: JSON.stringify({ action: "invite", email: "new@chatting.example" })
      })
    );

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ ok: false, error: "forbidden" });
  });

  it("maps missing-email errors cleanly", async () => {
    mocks.createTeamInvite.mockRejectedValueOnce(new Error("MISSING_EMAIL"));

    const response = await POST(
      new Request("http://localhost/dashboard/settings/team", {
        method: "POST",
        body: JSON.stringify({ action: "invite" })
      })
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ ok: false, error: "missing-email" });
  });
});
