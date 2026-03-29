import { buildActivation, buildHealth } from "@/lib/data/dashboard-growth-activation-health";
import { buildExpansion } from "@/lib/data/dashboard-growth-expansion";
import type { DashboardBillingSummary } from "@/lib/data/billing";

function createBillingSummary(overrides: Partial<DashboardBillingSummary> = {}): DashboardBillingSummary {
  return {
    planKey: "starter",
    planName: "Starter Plan",
    priceLabel: "$0/month",
    usedSeats: 1,
    seatLimit: 5,
    siteCount: 1,
    conversationCount: 0,
    nextBillingDate: null,
    subscriptionStatus: null,
    customerId: null,
    portalAvailable: false,
    checkoutAvailable: false,
    paymentMethod: null,
    invoices: [],
    ...overrides
  } as DashboardBillingSummary;
}

describe("dashboard growth helpers", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-29T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("keeps activation in countdown while the first-day window is still open", () => {
    const activation = buildActivation(
      "2026-03-29T02:00:00.000Z",
      true,
      0,
      null,
      new Date("2026-03-29T12:00:00.000Z")
    );

    expect(activation.status).toBe("countdown");
    expect(activation.title).toContain("Now push for the first conversation");
  });

  it("marks health as at risk when usage and responsiveness both slip", () => {
    const health = buildHealth(14, 1, 8, 7200, 0, "2026-03-10T12:00:00.000Z");

    expect(health.status).toBe("at-risk");
    expect(health.score).toBeLessThan(60);
    expect(health.action.href).toBe("/dashboard/team");
  });

  it("surfaces team, conversation, and analytics expansion prompts for busy starter workspaces", () => {
    const expansion = buildExpansion(
      createBillingSummary({
        usedSeats: 5,
        conversationCount: 42
      })
    );

    expect(expansion.prompts.map((prompt) => prompt.id)).toEqual(["team", "conversations", "analytics"]);
  });
});
