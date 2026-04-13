const mocks = vi.hoisted(() => ({
  clearUserSession: vi.fn(),
  getWorkspaceAccess: vi.fn(),
  issueUserSessionToken: vi.fn(),
  jsonError: vi.fn((error: string, status: number) => Response.json({ ok: false, error }, { status })),
  jsonOk: vi.fn((body: Record<string, unknown>, status = 200) => Response.json({ ok: true, ...body }, { status })),
  persistPreferredTimeZoneForUser: vi.fn(),
  requireJsonRouteUser: vi.fn(),
  signInUser: vi.fn()
}));

vi.mock("@/lib/auth", () => ({
  clearUserSession: mocks.clearUserSession,
  issueUserSessionToken: mocks.issueUserSessionToken,
  signInUser: mocks.signInUser
}));

vi.mock("@/lib/route-helpers", () => ({
  jsonError: mocks.jsonError,
  jsonOk: mocks.jsonOk,
  requireJsonRouteUser: mocks.requireJsonRouteUser
}));

vi.mock("@/lib/user-timezone-preference", () => ({
  persistPreferredTimeZoneForUser: mocks.persistPreferredTimeZoneForUser
}));

vi.mock("@/lib/workspace-access", () => ({
  getWorkspaceAccess: mocks.getWorkspaceAccess
}));

import { DELETE, GET, POST } from "./route";

describe("mobile session route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("requires email and password for login", async () => {
    const response = await POST(
      new Request("http://localhost/api/mobile/session", {
        method: "POST",
        body: JSON.stringify({ email: "owner@example.com" })
      })
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ ok: false, error: "missing-fields" });
  });

  it("returns a mobile token and user payload after login", async () => {
    mocks.signInUser.mockResolvedValueOnce({
      id: "user_1",
      email: "owner@example.com",
      createdAt: "2026-04-10T00:00:00.000Z"
    });
    mocks.issueUserSessionToken.mockResolvedValueOnce("mobile-token");
    mocks.getWorkspaceAccess.mockResolvedValueOnce({
      ownerUserId: "owner_1",
      role: "owner"
    });

    const response = await POST(
      new Request("http://localhost/api/mobile/session", {
        method: "POST",
        body: JSON.stringify({
          email: "owner@example.com",
          password: "password123",
          timeZone: "Europe/London"
        })
      })
    );

    expect(mocks.persistPreferredTimeZoneForUser).toHaveBeenCalledWith("user_1", "Europe/London");
    expect(await response.json()).toEqual({
      ok: true,
      token: "mobile-token",
      expiresInSeconds: 2592000,
      user: {
        id: "user_1",
        email: "owner@example.com",
        createdAt: "2026-04-10T00:00:00.000Z",
        workspaceOwnerId: "owner_1",
        workspaceRole: "owner"
      }
    });
  });

  it("surfaces email verification requirements during login", async () => {
    mocks.signInUser.mockRejectedValueOnce(new Error("EMAIL_NOT_VERIFIED"));

    const response = await POST(
      new Request("http://localhost/api/mobile/session", {
        method: "POST",
        body: JSON.stringify({
          email: "owner@example.com",
          password: "password123"
        })
      })
    );

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ ok: false, error: "email-not-verified" });
  });

  it("returns the current user for session lookups", async () => {
    mocks.requireJsonRouteUser.mockResolvedValueOnce({
      user: {
        id: "user_1",
        email: "owner@example.com",
        createdAt: "2026-04-10T00:00:00.000Z",
        workspaceOwnerId: "owner_1",
        workspaceRole: "owner"
      }
    });

    const response = await GET();

    expect(await response.json()).toEqual({
      ok: true,
      expiresInSeconds: 2592000,
      user: {
        id: "user_1",
        email: "owner@example.com",
        createdAt: "2026-04-10T00:00:00.000Z",
        workspaceOwnerId: "owner_1",
        workspaceRole: "owner"
      }
    });
  });

  it("revokes the current session on delete", async () => {
    mocks.requireJsonRouteUser.mockResolvedValueOnce({
      user: {
        id: "user_1",
        email: "owner@example.com",
        createdAt: "2026-04-10T00:00:00.000Z",
        workspaceOwnerId: "owner_1",
        workspaceRole: "owner"
      }
    });

    const response = await DELETE();

    expect(mocks.clearUserSession).toHaveBeenCalledTimes(1);
    expect(await response.json()).toEqual({ ok: true, revoked: true });
  });
});
