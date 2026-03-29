import {
  formatBillingPriceLabel,
  formatSeatTotalLabel,
  getBillingDisplayPrice
} from "@/lib/billing-plans";

describe("billing plans", () => {
  it("describes growth pricing per seat", () => {
    expect(formatBillingPriceLabel("growth", "monthly")).toBe("$20/seat/month");
    expect(getBillingDisplayPrice("growth", "monthly")).toEqual({
      amount: "$20",
      cadence: "/seat/month",
      note: null
    });
  });

  it("calculates per-seat totals for paid plans", () => {
    expect(formatSeatTotalLabel("growth", "monthly", 1)).toBe("1 seat - $20/month");
    expect(formatSeatTotalLabel("growth", "monthly", 5)).toBe("5 seats - $100/month");
    expect(formatSeatTotalLabel("growth", "monthly", 7)).toBe("7 seats - $140/month");
    expect(formatSeatTotalLabel("growth", "annual", 6)).toBe("6 seats - $1200/year");
    expect(formatSeatTotalLabel("pro", "annual", 6)).toBe("6 seats - $2400/year");
  });
});
