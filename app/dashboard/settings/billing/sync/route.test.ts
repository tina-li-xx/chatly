const mocks = vi.hoisted(() => ({
  syncDashboardBillingSummary: vi.fn(),
  requireJsonRouteUser: vi.fn()
}));

vi.mock("@/lib/data", () => ({
  syncDashboardBillingSummary: mocks.syncDashboardBillingSummary
}));

vi.mock("@/lib/route-helpers", async () => {
  return {
    jsonError: (error: string, status: number) =>
      Response.json({ ok: false, error }, { status }),
    jsonOk: (body: Record<string, unknown>, status = 200) =>
      Response.json({ ok: true, ...body }, { status }),
    requireJsonRouteUser: mocks.requireJsonRouteUser
  };
});

import { POST } from "./route";

describe("billing sync route", () => {
  beforeEach(() => {
    mocks.requireJsonRouteUser.mockResolvedValue({
      user: {
        id: "user_123",
        email: "hello@chatly.example",
        createdAt: "2026-03-27T00:00:00.000Z"
      }
    });
  });

  it("returns refreshed billing summaries", async () => {
    mocks.syncDashboardBillingSummary.mockResolvedValueOnce({
      planKey: "pro"
    });

    const response = await POST();
    expect(await response.json()).toEqual({
      ok: true,
      billing: {
        planKey: "pro"
      }
    });
  });

  it("maps stripe not configured errors", async () => {
    mocks.syncDashboardBillingSummary.mockRejectedValueOnce(new Error("STRIPE_NOT_CONFIGURED"));

    const response = await POST();
    expect(await response.json()).toEqual({
      ok: false,
      error: "stripe_not_configured"
    });
  });
});
