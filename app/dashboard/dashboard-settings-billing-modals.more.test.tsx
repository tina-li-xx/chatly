import { renderToStaticMarkup } from "react-dom/server";
import type { DashboardBillingSummary } from "@/lib/data";
import {
  DashboardSettingsBillingPlanModal,
  DashboardSettingsBillingUpdatePaymentModal
} from "./dashboard-settings-billing-modals";

const billing = {
  planKey: "growth",
  planName: "Growth",
  priceLabel: "$20/month",
  billingInterval: "monthly",
  usedSeats: 4,
  billedSeats: 4,
  seatLimit: null,
  siteCount: 2,
  conversationCount: 18,
  messageCount: 48,
  avgResponseSeconds: 22,
  conversationLimit: null,
  conversationUsagePercent: null,
  upgradePromptThreshold: 30,
  remainingConversations: null,
  showUpgradePrompt: false,
  limitReached: false,
  nextBillingDate: null,
  trialEndsAt: null,
  subscriptionStatus: "active",
  customerId: "cus_123",
  portalAvailable: true,
  checkoutAvailable: true,
  features: { billedPerSeat: true, proactiveChat: true, removeBranding: true },
  paymentMethod: null,
  invoices: [],
  referrals: { programs: [], attributedSignups: [], rewards: [], pendingRewardCount: 0, earnedRewardCount: 0, earnedFreeMonths: 0, earnedDiscountCents: 0, earnedCommissionCents: 0 }
} as DashboardBillingSummary;

describe("dashboard settings billing modal edge states", () => {
  it("renders the switch flow for custom-quote teams", () => {
    const html = renderToStaticMarkup(
      <DashboardSettingsBillingPlanModal
        billing={{ ...billing, billedSeats: 55, usedSeats: 55 }}
        intent={{ planKey: "growth", billingInterval: "annual", mode: "switch" }}
        pending={false}
        onClose={() => {}}
        onConfirm={() => {}}
      />
    );

    expect(html).toContain("Change to Growth");
    expect(html).toContain("Stripe will calculate proration");
    expect(html).toContain("Teams with 50 or more members need a custom quote before billing can continue.");
    expect(html).toContain("Custom quote required");
  });

  it("renders the downgrade flow without an access-until callout when no renewal date exists", () => {
    const html = renderToStaticMarkup(
      <DashboardSettingsBillingPlanModal
        billing={billing}
        intent={{ planKey: "starter", billingInterval: "monthly", mode: "downgrade" }}
        pending
        onClose={() => {}}
        onConfirm={() => {}}
      />
    );

    expect(html).toContain("You&#x27;re moving back to Starter");
    expect(html).toContain("Opening...");
    expect(html).not.toContain("You&#x27;ll keep access until");
  });

  it("renders the payment modal fallback when no card is on file", () => {
    const html = renderToStaticMarkup(
      <DashboardSettingsBillingUpdatePaymentModal
        billing={billing}
        open
        pending
        onClose={() => {}}
        onConfirm={() => {}}
      />
    );

    expect(html).toContain("No payment method on file");
    expect(html).toContain("Opening...");
  });
});
