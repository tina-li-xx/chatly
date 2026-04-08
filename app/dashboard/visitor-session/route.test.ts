const mocks = vi.hoisted(() => ({
  getVisitorPresenceSession: vi.fn(),
  requireJsonRouteUser: vi.fn()
}));

vi.mock("@/lib/data", () => ({
  getVisitorPresenceSession: mocks.getVisitorPresenceSession
}));

vi.mock("@/lib/route-helpers", () => ({
  jsonError: (error: string, status: number) =>
    Response.json({ ok: false, error }, { status }),
  jsonOk: (body: Record<string, unknown>, status = 200) =>
    Response.json({ ok: true, ...body }, { status }),
  requireJsonRouteUser: mocks.requireJsonRouteUser
}));

import { GET } from "./route";

describe("dashboard visitor session route", () => {
  beforeEach(() => {
    mocks.requireJsonRouteUser.mockResolvedValue({
      user: { id: "user_123", email: "hello@chatting.example", createdAt: "2026-03-27T00:00:00.000Z" }
    });
  });

  it("returns auth responses directly", async () => {
    mocks.requireJsonRouteUser.mockResolvedValueOnce({
      response: Response.json({ ok: false, error: "auth" }, { status: 401 })
    });

    const response = await GET(new Request("http://localhost/dashboard/visitor-session?siteId=site_1&sessionId=session_1"));

    expect(response.status).toBe(401);
  });

  it("rejects missing fields", async () => {
    const response = await GET(new Request("http://localhost/dashboard/visitor-session?siteId=site_1"));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ ok: false, error: "missing-fields" });
  });

  it("returns not found when the session does not exist", async () => {
    mocks.getVisitorPresenceSession.mockResolvedValueOnce(null);

    const response = await GET(new Request("http://localhost/dashboard/visitor-session?siteId=site_1&sessionId=session_404"));

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ ok: false, error: "not-found" });
  });

  it("returns the requested visitor session", async () => {
    mocks.getVisitorPresenceSession.mockResolvedValueOnce({ siteId: "site_1", sessionId: "session_1" });

    const response = await GET(new Request("http://localhost/dashboard/visitor-session?siteId=site_1&sessionId=session_1"));

    expect(mocks.getVisitorPresenceSession).toHaveBeenCalledWith({
      userId: "user_123",
      siteId: "site_1",
      sessionId: "session_1"
    });
    expect(await response.json()).toEqual({
      ok: true,
      session: { siteId: "site_1", sessionId: "session_1" }
    });
  });
});
