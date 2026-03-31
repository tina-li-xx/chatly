const mocks = vi.hoisted(() => ({ query: vi.fn() }));

vi.mock("@/lib/db", () => ({ query: mocks.query }));

import {
  clearBillingPaymentMethodRow,
  findBillingAccountRow,
  findBillingPaymentMethodRow,
  findBillingUsageRow,
  insertBillingInvoiceRow,
  listBillingInvoiceRows,
  upsertBillingAccountRow,
  upsertBillingPaymentMethodRow
} from "@/lib/repositories/billing-repository";

describe("billing repository more", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns nullish defaults for empty billing lookups", async () => {
    mocks.query.mockResolvedValue({ rows: [] });

    await expect(findBillingUsageRow("user_1")).resolves.toEqual({ conversation_count: "0", site_count: "0" });
    await expect(findBillingAccountRow("user_1")).resolves.toBeNull();
    await expect(findBillingPaymentMethodRow("user_1")).resolves.toBeNull();
    await expect(listBillingInvoiceRows("user_1", 3)).resolves.toEqual([]);
    expect(mocks.query.mock.calls[3]?.[1]).toEqual(["user_1", 3]);
  });

  it("writes billing rows with null defaults and clears payment methods", async () => {
    mocks.query.mockResolvedValue({ rows: [] });

    await upsertBillingAccountRow({
      userId: "user_1",
      planKey: "growth",
      billingInterval: "monthly",
      seatQuantity: 3,
      nextBillingDate: null
    });
    await upsertBillingPaymentMethodRow({
      userId: "user_1",
      brand: "visa",
      last4: "4242",
      expMonth: 4,
      expYear: 2028,
      holderName: "Tina Bauer"
    });
    await insertBillingInvoiceRow({
      id: "invoice_1",
      userId: "user_1",
      planKey: "growth",
      description: "Growth",
      amountCents: 2000,
      currency: "usd",
      status: "open",
      issuedAt: "2026-03-29T10:00:00.000Z",
      paidAt: null,
      periodStart: null,
      periodEnd: null
    });
    await clearBillingPaymentMethodRow("user_1");

    expect(mocks.query.mock.calls[0]?.[1]).toEqual([
      "user_1",
      "growth",
      "monthly",
      3,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null
    ]);
    expect(mocks.query.mock.calls[1]?.[1]).toEqual(["user_1", null, "visa", "4242", 4, 2028, "Tina Bauer"]);
    expect(mocks.query.mock.calls[2]?.[1]).toEqual([
      "invoice_1",
      "user_1",
      null,
      "growth",
      null,
      null,
      "Growth",
      2000,
      "usd",
      "open",
      null,
      null,
      "2026-03-29T10:00:00.000Z",
      null,
      null,
      null
    ]);
    expect(mocks.query.mock.calls[3]?.[0]).toContain("DELETE FROM billing_payment_methods");
  });
});
