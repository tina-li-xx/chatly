const mocks = vi.hoisted(() => ({
  requireJsonRouteUser: vi.fn(),
  upsertUserTimeZone: vi.fn()
}));

vi.mock("@/lib/repositories/user-timezone-repository", () => ({
  upsertUserTimeZone: mocks.upsertUserTimeZone
}));

vi.mock("@/lib/route-helpers", () => ({
  jsonError: (error: string, status: number) =>
    Response.json({ ok: false, error }, { status }),
  jsonOk: (body: Record<string, unknown>, status = 200) =>
    Response.json({ ok: true, ...body }, { status }),
  requireJsonRouteUser: mocks.requireJsonRouteUser
}));

import { POST } from "./route";

describe("dashboard timezone sync route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireJsonRouteUser.mockResolvedValue({
      user: { id: "user_123", email: "hello@chatting.example", createdAt: "2026-03-27T00:00:00.000Z" }
    });
  });

  it("stores valid timezones for the signed-in user", async () => {
    const response = await POST(
      new Request("http://localhost/dashboard/settings/timezone", {
        method: "POST",
        body: JSON.stringify({ timezone: "Europe/London" })
      })
    );

    expect(mocks.upsertUserTimeZone).toHaveBeenCalledWith("user_123", "Europe/London");
    expect(await response.json()).toEqual({ ok: true, timezone: "Europe/London" });
  });

  it("rejects invalid timezone payloads", async () => {
    const response = await POST(
      new Request("http://localhost/dashboard/settings/timezone", {
        method: "POST",
        body: JSON.stringify({ timezone: "not-a-timezone" })
      })
    );

    expect(mocks.upsertUserTimeZone).not.toHaveBeenCalled();
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ ok: false, error: "invalid-timezone" });
  });
});
