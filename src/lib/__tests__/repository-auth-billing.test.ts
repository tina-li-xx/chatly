const mocks = vi.hoisted(() => ({ query: vi.fn() }));

vi.mock("@/lib/db", () => ({ query: mocks.query }));

import {
  deleteAuthSessionByTokenHash,
  findAuthUserByEmail,
  findAuthUserById,
  findCurrentUserByTokenHash,
  findExistingUserIdByEmail,
  insertAuthSession,
  insertAuthUser,
  updateAuthUserEmail,
  updateAuthUserPassword
} from "@/lib/repositories/auth-repository";
import {
  findBillingAccountRow,
  findBillingAccountRowByStripeCustomerId,
  findBillingAccountRowByStripeSubscriptionId,
  insertBillingInvoiceRow,
  findBillingPaymentMethodRow,
  findBillingUsageRow,
  listBillingInvoiceRows,
  upsertBillingAccountRow,
  upsertBillingPaymentMethodRow
} from "@/lib/repositories/billing-repository";

describe("auth and billing repositories", () => {
  beforeEach(() => vi.clearAllMocks());

  it("reads and writes auth users and sessions", async () => {
    mocks.query.mockResolvedValue({ rows: [], rowCount: 0 });
    mocks.query
      .mockResolvedValueOnce({ rows: [{ id: "user_1", email: "hello@example.com" }] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ id: "user_2" }] })
      .mockResolvedValueOnce({ rows: [{ id: "user_1", email: "hello@example.com" }] });

    await expect(findAuthUserById("user_1")).resolves.toEqual({ id: "user_1", email: "hello@example.com" });
    await expect(findAuthUserByEmail("missing@example.com")).resolves.toBeNull();
    await expect(findExistingUserIdByEmail("hello@example.com")).resolves.toBe("user_2");
    await insertAuthUser({ userId: "user_3", email: "new@example.com", passwordHash: "hash", onboardingStep: "customize" });
    await updateAuthUserEmail("user_3", "updated@example.com");
    await updateAuthUserPassword("user_3", "next-hash");
    await insertAuthSession({ sessionId: "session_1", userId: "user_3", tokenHash: "token-hash" });
    await deleteAuthSessionByTokenHash("token-hash");
    mocks.query.mockResolvedValueOnce({ rows: [{ id: "user_1", email: "hello@example.com" }], rowCount: 1 });
    await expect(findCurrentUserByTokenHash("token-hash")).resolves.toEqual({ id: "user_1", email: "hello@example.com" });

    expect(mocks.query.mock.calls[0]?.[0]).toContain("FROM users");
    expect(mocks.query.mock.calls[3]?.[0]).toContain("INSERT INTO users");
    expect(mocks.query.mock.calls[6]?.[0]).toContain("INSERT INTO auth_sessions");
    expect(mocks.query.mock.calls[8]?.[0]).toContain("FROM auth_sessions s");
  });

  it("reads usage, accounts, invoices, and upserts billing rows", async () => {
    mocks.query.mockResolvedValue({ rows: [], rowCount: 0 });
    mocks.query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ user_id: "user_1", plan_key: "growth" }] })
      .mockResolvedValueOnce({ rows: [{ user_id: "user_1", plan_key: "growth" }] })
      .mockResolvedValueOnce({ rows: [{ user_id: "user_1", plan_key: "growth" }] })
      .mockResolvedValueOnce({ rows: [{ user_id: "user_1", brand: "visa" }] })
      .mockResolvedValueOnce({ rows: [{ id: "invoice_1" }] });

    await expect(findBillingUsageRow("user_1")).resolves.toEqual({ conversation_count: "0", site_count: "0" });
    await expect(findBillingAccountRow("user_1")).resolves.toEqual({ user_id: "user_1", plan_key: "growth" });
    await expect(findBillingAccountRowByStripeCustomerId("cus_123")).resolves.toEqual({ user_id: "user_1", plan_key: "growth" });
    await expect(findBillingAccountRowByStripeSubscriptionId("sub_123")).resolves.toEqual({ user_id: "user_1", plan_key: "growth" });
    await expect(findBillingPaymentMethodRow("user_1")).resolves.toEqual({ user_id: "user_1", brand: "visa" });
    await expect(listBillingInvoiceRows("user_1")).resolves.toEqual([{ id: "invoice_1" }]);

    await upsertBillingAccountRow({ userId: "user_1", planKey: "growth", billingInterval: "monthly", seatQuantity: 3, nextBillingDate: null, stripeCustomerId: "cus_123", stripeSubscriptionId: "sub_123", stripePriceId: "price_123", stripeStatus: "trialing", stripeCurrentPeriodEnd: "2026-04-01T00:00:00.000Z" });
    await upsertBillingPaymentMethodRow({ userId: "user_1", stripePaymentMethodId: "pm_123", brand: "visa", last4: "4242", expMonth: 4, expYear: 2028, holderName: "Tina Bauer" });
    await insertBillingInvoiceRow({ id: "invoice_1", userId: "user_1", stripeInvoiceId: "in_123", planKey: "growth", billingInterval: "monthly", seatQuantity: 3, description: "Growth", amountCents: 2000, currency: "usd", status: "paid", hostedInvoiceUrl: null, invoicePdfUrl: null, issuedAt: "2026-03-29T10:00:00.000Z", paidAt: "2026-03-29T10:01:00.000Z", periodStart: null, periodEnd: null });

    expect(mocks.query.mock.calls[0]?.[0]).toContain("COUNT(DISTINCT s.id)");
    expect(mocks.query.mock.calls[6]?.[0]).toContain("INSERT INTO billing_accounts");
    expect(mocks.query.mock.calls[7]?.[0]).toContain("INSERT INTO billing_payment_methods");
    expect(mocks.query.mock.calls[8]?.[0]).toContain("INSERT INTO billing_invoices");
  });
});
