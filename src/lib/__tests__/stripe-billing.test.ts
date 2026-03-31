const stripeMocks = vi.hoisted(() => ({
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
  getStripe: () => ({
    billingPortal: { sessions: { create: stripeMocks.billingPortalCreate } },
    checkout: { sessions: { create: stripeMocks.checkoutCreate } },
    customers: { create: stripeMocks.customersCreate, retrieve: stripeMocks.customersRetrieve },
    invoices: { list: stripeMocks.invoicesList },
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
    stripeMocks.isStripeBillingReady.mockReturnValue(true);
    stripeMocks.isStripeConfigured.mockReturnValue(true);
    stripeMocks.isLocalGrowthTrialActive.mockReturnValue(true);
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
      metadata: { userId: "user_1", planKey: "growth", billingInterval: "annual", seatQuantity: "4" }
    });
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
