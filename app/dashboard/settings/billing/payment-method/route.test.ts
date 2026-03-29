const mocks = vi.hoisted(() => ({
  createDashboardBillingPortalSession: vi.fn(),
  requireJsonRouteUser: vi.fn()
}));

vi.mock("@/lib/data", () => ({
  createDashboardBillingPortalSession: mocks.createDashboardBillingPortalSession
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

describe("billing payment-method route", () => {
  beforeEach(() => {
    mocks.requireJsonRouteUser.mockResolvedValue({
      user: {
        id: "user_123",
        email: "hello@chatly.example",
        createdAt: "2026-03-27T00:00:00.000Z",
        workspaceOwnerId: "owner_123",
        workspaceRole: "admin"
      }
    });
  });

  it("returns stripe portal urls", async () => {
    mocks.createDashboardBillingPortalSession.mockResolvedValueOnce("https://billing.stripe.com/session");

    const response = await POST();
    expect(await response.json()).toEqual({
      ok: true,
      redirectUrl: "https://billing.stripe.com/session"
    });
  });

  it("maps stripe config errors", async () => {
    mocks.createDashboardBillingPortalSession.mockRejectedValueOnce(new Error("STRIPE_NOT_CONFIGURED"));

    const response = await POST();
    expect(await response.json()).toEqual({
      ok: false,
      error: "stripe_not_configured"
    });
  });

  it("blocks members from opening the billing portal", async () => {
    mocks.requireJsonRouteUser.mockResolvedValueOnce({
      user: {
        id: "user_123",
        email: "hello@chatly.example",
        createdAt: "2026-03-27T00:00:00.000Z",
        workspaceOwnerId: "owner_123",
        workspaceRole: "member"
      }
    });

    const response = await POST();
    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ ok: false, error: "forbidden" });
  });
});
