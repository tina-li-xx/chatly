const mocks = vi.hoisted(() => ({
  createDashboardBillingCheckoutSession: vi.fn(),
  createDashboardBillingPortalSession: vi.fn(),
  requireJsonRouteUser: vi.fn()
}));

vi.mock("@/lib/data", () => ({
  createDashboardBillingCheckoutSession: mocks.createDashboardBillingCheckoutSession,
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

describe("billing plan route", () => {
  beforeEach(() => {
    mocks.requireJsonRouteUser.mockResolvedValue({
      user: {
        id: "user_123",
        email: "hello@chatly.example",
        createdAt: "2026-03-27T00:00:00.000Z"
      }
    });
  });

  it("returns auth responses directly when unauthenticated", async () => {
    mocks.requireJsonRouteUser.mockResolvedValueOnce({
      response: Response.json({ ok: false, error: "auth" }, { status: 401 })
    });

    const response = await POST(
      new Request("http://localhost/dashboard/settings/billing/plan", {
        method: "POST",
        body: JSON.stringify({ plan: "pro" })
      })
    );

    expect(response.status).toBe(401);
  });

  it("opens stripe checkout for pro upgrades", async () => {
    mocks.createDashboardBillingCheckoutSession.mockResolvedValueOnce("https://checkout.stripe.com/session");

    const response = await POST(
      new Request("http://localhost/dashboard/settings/billing/plan", {
        method: "POST",
        body: JSON.stringify({ plan: "pro" })
      })
    );

    expect(await response.json()).toEqual({
      ok: true,
      redirectUrl: "https://checkout.stripe.com/session"
    });
  });

  it("opens the billing portal for starter downgrade flow", async () => {
    mocks.createDashboardBillingPortalSession.mockResolvedValueOnce("https://billing.stripe.com/session");

    const response = await POST(
      new Request("http://localhost/dashboard/settings/billing/plan", {
        method: "POST",
        body: JSON.stringify({ plan: "starter" })
      })
    );

    expect(await response.json()).toEqual({
      ok: true,
      redirectUrl: "https://billing.stripe.com/session"
    });
  });

  it("maps stripe-specific failures", async () => {
    mocks.createDashboardBillingCheckoutSession.mockRejectedValueOnce(new Error("STRIPE_NOT_CONFIGURED"));
    let response = await POST(
      new Request("http://localhost/dashboard/settings/billing/plan", {
        method: "POST",
        body: JSON.stringify({ plan: "pro" })
      })
    );
    expect(await response.json()).toEqual({
      ok: false,
      error: "stripe_not_configured"
    });

    mocks.createDashboardBillingCheckoutSession.mockRejectedValueOnce(
      new Error("STRIPE_CHECKOUT_UNAVAILABLE")
    );
    response = await POST(
      new Request("http://localhost/dashboard/settings/billing/plan", {
        method: "POST",
        body: JSON.stringify({ plan: "pro" })
      })
    );
    expect(await response.json()).toEqual({
      ok: false,
      error: "stripe_checkout_unavailable"
    });
  });
});
