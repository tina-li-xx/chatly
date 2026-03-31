const mocks = vi.hoisted(() => ({
  createDashboardBillingCheckoutSession: vi.fn(),
  createDashboardBillingPortalSession: vi.fn(),
  getDashboardBillingSummary: vi.fn(),
  requireJsonRouteUser: vi.fn()
}));

vi.mock("@/lib/data", () => ({
  createDashboardBillingCheckoutSession: mocks.createDashboardBillingCheckoutSession,
  createDashboardBillingPortalSession: mocks.createDashboardBillingPortalSession,
  getDashboardBillingSummary: mocks.getDashboardBillingSummary
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
    vi.clearAllMocks();
    mocks.requireJsonRouteUser.mockResolvedValue({
      user: {
        id: "user_123",
        email: "hello@chatly.example",
        createdAt: "2026-03-27T00:00:00.000Z",
        workspaceOwnerId: "owner_123",
        workspaceRole: "admin"
      }
    });
    mocks.getDashboardBillingSummary.mockResolvedValue({
      planKey: "starter",
      usedSeats: 3
    });
  });

  it("returns auth responses directly when unauthenticated", async () => {
    mocks.requireJsonRouteUser.mockResolvedValueOnce({
      response: Response.json({ ok: false, error: "auth" }, { status: 401 })
    });

    const response = await POST(
      new Request("http://localhost/dashboard/settings/billing/plan", {
        method: "POST",
        body: JSON.stringify({ plan: "growth" })
      })
    );

    expect(response.status).toBe(401);
  });

  it("opens stripe checkout for growth upgrades", async () => {
    mocks.createDashboardBillingCheckoutSession.mockResolvedValueOnce("https://checkout.stripe.com/session");

    const response = await POST(
      new Request("http://localhost/dashboard/settings/billing/plan", {
        method: "POST",
        body: JSON.stringify({ plan: "growth" })
      })
    );

    expect(await response.json()).toEqual({
      ok: true,
      redirectUrl: "https://checkout.stripe.com/session"
    });
    expect(mocks.createDashboardBillingCheckoutSession).toHaveBeenCalledWith("user_123", "hello@chatly.example", {
      planKey: "growth",
      billingInterval: "monthly",
      seatQuantity: 3
    });
  });

  it("blocks members from changing billing", async () => {
    mocks.requireJsonRouteUser.mockResolvedValueOnce({
      user: {
        id: "user_123",
        email: "hello@chatly.example",
        createdAt: "2026-03-27T00:00:00.000Z",
        workspaceOwnerId: "owner_123",
        workspaceRole: "member"
      }
    });

    const response = await POST(
      new Request("http://localhost/dashboard/settings/billing/plan", {
        method: "POST",
        body: JSON.stringify({ plan: "growth" })
      })
    );

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ ok: false, error: "forbidden" });
  });

  it("passes annual growth upgrades through checkout with seat counts", async () => {
    mocks.createDashboardBillingCheckoutSession.mockResolvedValueOnce("https://checkout.stripe.com/growth");

    const response = await POST(
      new Request("http://localhost/dashboard/settings/billing/plan", {
        method: "POST",
        body: JSON.stringify({ plan: "growth", interval: "annual" })
      })
    );

    expect(await response.json()).toEqual({
      ok: true,
      redirectUrl: "https://checkout.stripe.com/growth"
    });
    expect(mocks.createDashboardBillingCheckoutSession).toHaveBeenCalledWith("user_123", "hello@chatly.example", {
      planKey: "growth",
      billingInterval: "annual",
      seatQuantity: 3
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

  it("sends paid workspaces to the billing portal for interval changes", async () => {
    mocks.getDashboardBillingSummary.mockResolvedValueOnce({
      planKey: "growth",
      usedSeats: 4
    });
    mocks.createDashboardBillingPortalSession.mockResolvedValueOnce("https://billing.stripe.com/manage");

    const response = await POST(
      new Request("http://localhost/dashboard/settings/billing/plan", {
        method: "POST",
        body: JSON.stringify({ plan: "growth", interval: "annual" })
      })
    );

    expect(await response.json()).toEqual({
      ok: true,
      redirectUrl: "https://billing.stripe.com/manage"
    });
    expect(mocks.createDashboardBillingPortalSession).toHaveBeenCalledWith("user_123", "hello@chatly.example");
  });

  it("blocks automatic checkout for 50-plus teams", async () => {
    mocks.getDashboardBillingSummary.mockResolvedValueOnce({
      planKey: "starter",
      usedSeats: 50
    });

    const response = await POST(
      new Request("http://localhost/dashboard/settings/billing/plan", {
        method: "POST",
        body: JSON.stringify({ plan: "growth" })
      })
    );

    expect(response.status).toBe(409);
    expect(await response.json()).toEqual({
      ok: false,
      error: "contact_sales_required"
    });
    expect(mocks.createDashboardBillingCheckoutSession).not.toHaveBeenCalled();
  });

  it("maps stripe-specific failures", async () => {
    mocks.createDashboardBillingCheckoutSession.mockRejectedValueOnce(new Error("STRIPE_NOT_CONFIGURED"));
    let response = await POST(
      new Request("http://localhost/dashboard/settings/billing/plan", {
        method: "POST",
        body: JSON.stringify({ plan: "growth" })
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
        body: JSON.stringify({ plan: "growth" })
      })
    );
    expect(await response.json()).toEqual({
      ok: false,
      error: "stripe_checkout_unavailable"
    });

    mocks.createDashboardBillingCheckoutSession.mockRejectedValueOnce(
      new Error("STRIPE_PRICE_CONFIG_INVALID")
    );
    response = await POST(
      new Request("http://localhost/dashboard/settings/billing/plan", {
        method: "POST",
        body: JSON.stringify({ plan: "growth" })
      })
    );
    expect(await response.json()).toEqual({
      ok: false,
      error: "stripe_price_config_invalid"
    });
  });
});
