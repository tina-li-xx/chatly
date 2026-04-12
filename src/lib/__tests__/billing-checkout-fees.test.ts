import {
  getCheckoutChargeTotalCents,
  getStripeProcessingFeeCents
} from "@/lib/billing-checkout-fees";

describe("billing checkout fees", () => {
  it("grosses up a starter-to-growth monthly subtotal so the fee is covered", () => {
    expect(getStripeProcessingFeeCents(2000)).toBe(91);
    expect(getCheckoutChargeTotalCents(2000)).toBe(2091);
  });

  it("returns zero when there is no subtotal", () => {
    expect(getStripeProcessingFeeCents(0)).toBe(0);
    expect(getCheckoutChargeTotalCents(0)).toBe(0);
  });
});
