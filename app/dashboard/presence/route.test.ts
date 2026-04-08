const mocks = vi.hoisted(() => ({
  recordUserPresence: vi.fn(),
  requireJsonRouteUser: vi.fn()
}));

vi.mock("@/lib/data", () => ({
  recordUserPresence: mocks.recordUserPresence
}));

vi.mock("@/lib/route-helpers", () => ({
  jsonOk: (body: Record<string, unknown>, status = 200) =>
    Response.json({ ok: true, ...body }, { status }),
  requireJsonRouteUser: mocks.requireJsonRouteUser
}));

import { POST } from "./route";

describe("dashboard presence route", () => {
  beforeEach(() => {
    mocks.requireJsonRouteUser.mockResolvedValue({
      user: { id: "user_123", email: "hello@chatting.example", createdAt: "2026-03-27T00:00:00.000Z" }
    });
  });

  it("returns auth responses directly", async () => {
    mocks.requireJsonRouteUser.mockResolvedValueOnce({
      response: Response.json({ ok: false, error: "auth" }, { status: 401 })
    });

    const response = await POST();
    expect(response.status).toBe(401);
  });

  it("records presence for the current user", async () => {
    const response = await POST();

    expect(mocks.recordUserPresence).toHaveBeenCalledWith("user_123");
    expect(await response.json()).toEqual({ ok: true, recorded: true });
  });
});
