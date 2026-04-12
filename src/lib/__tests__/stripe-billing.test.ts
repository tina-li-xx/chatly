const stripeMocks = vi.hoisted(() => ({
  assertStripeGrowthPriceConfigured: vi.fn(),
  billingPortalCreate: vi.fn(),
  checkoutCreate: vi.fn(),
  clearBillingPaymentMethodRow: vi.fn(),
  customersCreate: vi.fn(),
  customersRetrieve: vi.fn(),
  findBillingAccountRowByStripeCustomerId: vi.fn(),
  findBillingAccountRowByStripeSubscriptionId: vi.fn(),
  insertBillingInvoiceRow: vi.fn(),
  invoicesList: vi.fn(),
  isLocalGrowthTrialActive: vi.fn(),
  isStripeBillingReady: vi.fn(),
  isStripeConfigured: vi.fn(),
  pricesRetrieve: vi.fn(),
  subscriptionsList: vi.fn(),
  subscriptionsRetrieve: vi.fn(),
  subscriptionsUpdate: vi.fn(),
  syncReferralRewardsForUser: vi.fn(),
  upsertBillingAccountRow: vi.fn(),
  upsertBillingPaymentMethodRow: vi.fn()
}));

vi.mock("@/lib/billing-default-account", () => ({
  ensureOwnerGrowthTrialBillingAccount: vi.fn()
}));
vi.mock("@/lib/billing-trial-state", () => ({
  isLocalGrowthTrialActive: stripeMocks.isLocalGrowthTrialActive
}));
vi.mock("@/lib/env.server", () => ({
  getOptionalServerEnv: vi.fn(() => null)
}));
vi.mock("@/lib/referrals", () => ({
  syncReferralRewardsForUser: stripeMocks.syncReferralRewardsForUser
}));
vi.mock("@/lib/repositories/billing-repository", () => ({
  clearBillingPaymentMethodRow: stripeMocks.clearBillingPaymentMethodRow,
  findBillingAccountRowByStripeCustomerId: stripeMocks.findBillingAccountRowByStripeCustomerId,
  findBillingAccountRowByStripeSubscriptionId: stripeMocks.findBillingAccountRowByStripeSubscriptionId,
  insertBillingInvoiceRow: stripeMocks.insertBillingInvoiceRow,
  upsertBillingAccountRow: stripeMocks.upsertBillingAccountRow,
  upsertBillingPaymentMethodRow: stripeMocks.upsertBillingPaymentMethodRow
}));
vi.mock("@/lib/stripe", () => ({
  assertStripeGrowthPriceConfigured: stripeMocks.assertStripeGrowthPriceConfigured,
  getStripe: () => ({
    billingPortal: { sessions: { create: stripeMocks.billingPortalCreate } },
    checkout: { sessions: { create: stripeMocks.checkoutCreate } },
    customers: { create: stripeMocks.customersCreate, retrieve: stripeMocks.customersRetrieve },
    invoices: { list: stripeMocks.invoicesList },
    prices: { retrieve: stripeMocks.pricesRetrieve },
    subscriptions: {
      list: stripeMocks.subscriptionsList,
      retrieve: stripeMocks.subscriptionsRetrieve,
      update: stripeMocks.subscriptionsUpdate
    }
  }),
  getStripeAppUrl: () => "https://app.example",
  getStripePriceId: (_planKey: string, interval: string) =>
    interval === "annual" ? "price_growth_annual" : "price_growth_monthly",
  isStripeBillingReady: stripeMocks.isStripeBillingReady,
  isStripeConfigured: stripeMocks.isStripeConfigured
}));

import { ensureOwnerGrowthTrialBillingAccount } from "@/lib/billing-default-account";
import {
  createStripeBillingPortalSession,
  createStripeCheckoutSession,
  syncStripeBillingState,
  syncStripeBillingStateFromEvent
} from "@/lib/stripe-billing";
const ensureBillingAccount = vi.mocked(ensureOwnerGrowthTrialBillingAccount);

function growthPrice(priceId: string) {
  const annual = priceId === "price_growth_annual";
  return {
    id: priceId,
    active: true,
    billing_scheme: "tiered",
    currency: "usd",
    recurring: {
      interval: annual ? "year" : "month",
      interval_count: 1,
      usage_type: "licensed"
    },
    tiers_mode: "volume",
    type: "recurring",
    tiers: [
      { up_to: 3, flat_amount: annual ? 20_000 : 2_000, unit_amount: null },
      { up_to: 9, flat_amount: null, unit_amount: annual ? 6_000 : 600 },
      { up_to: 24, flat_amount: null, unit_amount: annual ? 5_000 : 500 },
      { up_to: 49, flat_amount: null, unit_amount: annual ? 4_000 : 400 },
      { up_to: "inf", flat_amount: null, unit_amount: annual ? 4_000 : 400 }
    ]
  };
}

function accountRow(overrides: Record<string, unknown> = {}) {
  return {
    plan_key: "growth",
    billing_interval: "annual",
    seat_quantity: 2,
    next_billing_date: "2026-04-12T00:00:00.000Z",
    stripe_customer_id: "cus_123",
    stripe_subscription_id: null,
    stripe_price_id: null,
    stripe_status: null,
    stripe_current_period_end: null,
    trial_started_at: "2026-03-29T00:00:00.000Z",
    trial_ends_at: "2026-04-12T00:00:00.000Z",
    trial_extension_used_at: null,
    ...overrides
  };
}

describe("stripe billing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    stripeMocks.assertStripeGrowthPriceConfigured.mockImplementation(
      (_planKey: string, interval: string) =>
        Promise.resolve(interval === "annual" ? "price_growth_annual" : "price_growth_monthly")
    );
    stripeMocks.isStripeBillingReady.mockReturnValue(true);
    stripeMocks.isStripeConfigured.mockReturnValue(true);
    stripeMocks.isLocalGrowthTrialActive.mockReturnValue(true);
    stripeMocks.pricesRetrieve.mockImplementation((priceId: string) => Promise.resolve(growthPrice(priceId)));
    ensureBillingAccount.mockResolvedValue(accountRow());
  });

  it("creates checkout sessions for paid plans and creates a stripe customer when needed", async () => {
    ensureBillingAccount.mockResolvedValueOnce(accountRow({ stripe_customer_id: null }));
    stripeMocks.customersCreate.mockResolvedValueOnce({ id: "cus_new" });
    stripeMocks.checkoutCreate.mockResolvedValueOnce({ url: "https://checkout.example" });
    await expect(
      createStripeCheckoutSession("user_1", "owner@example.com", {
        planKey: "growth",
        billingInterval: "annual",
        seatQuantity: 4
      })
    ).resolves.toBe("https://checkout.example");

    expect(stripeMocks.customersCreate).toHaveBeenCalledWith({ email: "owner@example.com", metadata: { userId: "user_1" } });
    expect(stripeMocks.checkoutCreate.mock.calls[0]?.[0]).toMatchObject({
      customer: "cus_new",
      success_url: "https://app.example/dashboard/settings?section=billing&billing=checkout-success",
      metadata: { userId: "user_1", planKey: "growth", billingInterval: "annual", seatQuantity: "4" },
      line_items: [
        { price: "price_growth_annual", quantity: 4 },
        {
          price_data: {
            currency: "usd",
            product_data: { name: "Stripe processing fee" },
            unit_amount: 748
          },
          quantity: 1
        }
      ]
    });
    expect(stripeMocks.checkoutCreate.mock.calls[0]?.[0]?.subscription_data).not.toHaveProperty("trial_period_days");
  });

  it("creates portal sessions for the existing customer", async () => {
    stripeMocks.billingPortalCreate.mockResolvedValueOnce({ url: "https://portal.example" });
    await expect(createStripeBillingPortalSession("user_1", "owner@example.com")).resolves.toBe("https://portal.example");
    expect(stripeMocks.customersCreate).not.toHaveBeenCalled();
    expect(stripeMocks.billingPortalCreate).toHaveBeenCalledWith({ customer: "cus_123", return_url: "https://app.example/dashboard/settings?section=billing&billing=portal-return" });
  });

  it("preserves local growth trials when stripe has no subscription yet", async () => {
    stripeMocks.customersRetrieve.mockResolvedValueOnce({ deleted: false, email: "owner@example.com", name: "Tina Bauer", invoice_settings: { default_payment_method: null } });
    stripeMocks.subscriptionsList.mockResolvedValueOnce({ data: [] });
    stripeMocks.invoicesList.mockResolvedValueOnce({ data: [] });
    const result = await syncStripeBillingState("user_1");
    expect(result).toEqual({ customerId: "cus_123", subscriptionId: null });
    expect(stripeMocks.upsertBillingAccountRow).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user_1",
        planKey: "growth",
        billingInterval: "annual",
        stripeSubscriptionId: null,
        trialStartedAt: "2026-03-29T00:00:00.000Z",
        trialEndsAt: "2026-04-12T00:00:00.000Z"
      })
    );
    expect(stripeMocks.clearBillingPaymentMethodRow).toHaveBeenCalledWith("user_1");
  });

  it("syncs billing state from webhook identifiers and refreshes referral rewards", async () => {
    stripeMocks.findBillingAccountRowByStripeCustomerId.mockResolvedValueOnce({ user_id: "user_1" });
    stripeMocks.customersRetrieve.mockResolvedValueOnce({ deleted: false, email: "owner@example.com", name: "Tina Bauer", invoice_settings: { default_payment_method: null } });
    stripeMocks.subscriptionsList.mockResolvedValueOnce({ data: [] });
    stripeMocks.invoicesList.mockResolvedValueOnce({ data: [] });
    await syncStripeBillingStateFromEvent({ customerId: "cus_123" });
    expect(stripeMocks.upsertBillingAccountRow).toHaveBeenCalledWith(expect.objectContaining({ userId: "user_1", stripeCustomerId: "cus_123" }));
    expect(stripeMocks.syncReferralRewardsForUser).toHaveBeenCalledWith("user_1");
  });
});
