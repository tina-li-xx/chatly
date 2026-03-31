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

vi.mock("@/lib/billing-default-account", () => ({ ensureOwnerGrowthTrialBillingAccount: vi.fn() }));
vi.mock("@/lib/billing-trial-state", () => ({ isLocalGrowthTrialActive: stripeMocks.isLocalGrowthTrialActive }));
vi.mock("@/lib/referrals", () => ({ syncReferralRewardsForUser: stripeMocks.syncReferralRewardsForUser }));
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
    subscriptions: { list: stripeMocks.subscriptionsList, retrieve: stripeMocks.subscriptionsRetrieve, update: stripeMocks.subscriptionsUpdate }
  }),
  getStripeAppUrl: () => "https://app.example",
  getStripePriceId: (_planKey: string, interval: string) => (interval === "annual" ? "price_growth_annual" : "price_growth_monthly"),
  isStripeBillingReady: stripeMocks.isStripeBillingReady,
  isStripeConfigured: stripeMocks.isStripeConfigured
}));

import { ensureOwnerGrowthTrialBillingAccount } from "@/lib/billing-default-account";
import { createStripeBillingPortalSession, createStripeCheckoutSession, syncStripeBillingState, syncStripeBillingStateFromEvent } from "@/lib/stripe-billing";
const ensureBillingAccount = vi.mocked(ensureOwnerGrowthTrialBillingAccount);

function accountRow(overrides: Record<string, unknown> = {}) {
  return {
    plan_key: "growth",
    billing_interval: "monthly",
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

describe("stripe billing more", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    stripeMocks.isStripeBillingReady.mockReturnValue(true);
    stripeMocks.isStripeConfigured.mockReturnValue(true);
    stripeMocks.isLocalGrowthTrialActive.mockReturnValue(true);
    ensureBillingAccount.mockResolvedValue(accountRow());
  });

  it("rejects unavailable checkout and portal paths", async () => {
    stripeMocks.isStripeBillingReady.mockReturnValue(false);
    await expect(createStripeCheckoutSession("user_1", "owner@example.com", { planKey: "growth", billingInterval: "monthly", seatQuantity: 1 })).rejects.toThrow("STRIPE_NOT_CONFIGURED");
    await expect(createStripeBillingPortalSession("user_1", "owner@example.com")).rejects.toThrow("STRIPE_NOT_CONFIGURED");

    stripeMocks.isStripeBillingReady.mockReturnValue(true);
    await expect(createStripeCheckoutSession("user_1", "owner@example.com", { planKey: "starter", billingInterval: "monthly", seatQuantity: 1 })).rejects.toThrow("STRIPE_CHECKOUT_UNAVAILABLE");
    stripeMocks.checkoutCreate.mockResolvedValueOnce({ url: null });
    ensureBillingAccount.mockResolvedValueOnce(accountRow({ stripe_customer_id: null }));
    stripeMocks.customersCreate.mockResolvedValueOnce({ id: "cus_new" });
    await expect(createStripeCheckoutSession("user_1", "owner@example.com", { planKey: "growth", billingInterval: "monthly", seatQuantity: 0 })).rejects.toThrow("STRIPE_CHECKOUT_UNAVAILABLE");
  });

  it("returns null sync states when billing is unavailable or the customer record is unusable", async () => {
    stripeMocks.isStripeConfigured.mockReturnValue(false);
    await expect(syncStripeBillingState("user_1")).resolves.toBeNull();

    stripeMocks.isStripeConfigured.mockReturnValue(true);
    ensureBillingAccount.mockResolvedValueOnce(accountRow({ stripe_customer_id: null }));
    await expect(syncStripeBillingState("user_1")).resolves.toBeNull();

    stripeMocks.customersRetrieve.mockResolvedValueOnce({ deleted: true });
    stripeMocks.subscriptionsList.mockResolvedValueOnce({ data: [] });
    stripeMocks.invoicesList.mockResolvedValueOnce({ data: [] });
    await expect(syncStripeBillingState("user_1")).resolves.toBeNull();
  });

  it("syncs active subscriptions, payment methods, seat updates, and imported invoices", async () => {
    stripeMocks.customersRetrieve.mockResolvedValueOnce({
      deleted: false,
      name: null,
      email: "owner@example.com",
      invoice_settings: {
        default_payment_method: {
          id: "pm_123",
          type: "card",
          card: { brand: "visa", last4: "4242", exp_month: 1, exp_year: 2027 },
          billing_details: { name: null }
        }
      }
    });
    stripeMocks.subscriptionsList.mockResolvedValueOnce({
      data: [
        { id: "sub_old", status: "canceled", created: 1, metadata: {}, items: { data: [{ id: "si_old", quantity: 1, price: { id: "price_growth_monthly" } }] }, current_period_end: 1713484800, trial_start: null, trial_end: null },
        { id: "sub_live", status: "active", created: 2, metadata: { trialExtensionUsedAt: " 2026-03-30T00:00:00.000Z " }, items: { data: [{ id: "si_live", quantity: 2, price: { id: "price_growth_monthly" } }] }, current_period_end: 1713484800, trial_start: 1711670400, trial_end: null }
      ]
    });
    stripeMocks.subscriptionsUpdate.mockResolvedValueOnce({
      id: "sub_live",
      status: "active",
      created: 2,
      customer: "cus_123",
      metadata: { trialExtensionUsedAt: "2026-03-30T00:00:00.000Z" },
      items: { data: [{ id: "si_live", quantity: 4, price: { id: "price_growth_monthly" } }] },
      current_period_end: 1713484800,
      trial_start: 1711670400,
      trial_end: null
    });
    stripeMocks.invoicesList.mockResolvedValueOnce({
      data: [
        {
          id: "in_123",
          description: "",
          amount_paid: 0,
          amount_due: 2900,
          currency: "usd",
          status: "open",
          hosted_invoice_url: "https://stripe.example/invoice",
          invoice_pdf: "https://stripe.example/invoice.pdf",
          created: 1711670400,
          period_start: 1711670400,
          period_end: 1713484800,
          status_transitions: { paid_at: null },
          lines: { data: [{ quantity: 4, description: "Growth", pricing: { price_details: { price: "price_growth_monthly" } } }] }
        }
      ]
    });

    await expect(syncStripeBillingState("user_1", "owner@example.com", 4)).resolves.toEqual({ customerId: "cus_123", subscriptionId: "sub_live" });
    expect(stripeMocks.subscriptionsUpdate).toHaveBeenCalledWith("sub_live", expect.objectContaining({ proration_behavior: "create_prorations" }));
    expect(stripeMocks.upsertBillingPaymentMethodRow).toHaveBeenCalledWith(expect.objectContaining({ holderName: "owner@example.com", last4: "4242" }));
    expect(stripeMocks.insertBillingInvoiceRow).toHaveBeenCalledWith(expect.objectContaining({ status: "open", currency: "USD", seatQuantity: 4 }));
  });

  it("syncs webhook events through subscription lookups", async () => {
    stripeMocks.findBillingAccountRowByStripeSubscriptionId.mockResolvedValueOnce({ user_id: "user_1" });
    stripeMocks.customersRetrieve.mockResolvedValueOnce({ deleted: false, email: "owner@example.com", name: null, invoice_settings: { default_payment_method: null } });
    stripeMocks.subscriptionsList.mockResolvedValueOnce({ data: [] });
    stripeMocks.invoicesList.mockResolvedValueOnce({ data: [] });
    await syncStripeBillingStateFromEvent({ subscriptionId: "sub_123" });
    expect(stripeMocks.findBillingAccountRowByStripeSubscriptionId).toHaveBeenCalledWith("sub_123");
    expect(stripeMocks.syncReferralRewardsForUser).toHaveBeenCalledWith("user_1");

    stripeMocks.findBillingAccountRowByStripeSubscriptionId.mockResolvedValueOnce(null);
    await syncStripeBillingStateFromEvent({ subscriptionId: "sub_missing" });
    expect(stripeMocks.syncReferralRewardsForUser).toHaveBeenCalledTimes(1);
  });
});
