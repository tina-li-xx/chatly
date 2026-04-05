import { renderToStaticMarkup } from "react-dom/server";
import type { DashboardBillingSummary } from "@/lib/data";
import { DashboardSettingsBillingPlanGrid } from "./dashboard-settings-billing-plan-grid";

const baseBilling = {
  planKey: "starter",
  planName: "Starter Plan",
  priceLabel: "$0/month",
  billingInterval: null,
  usedSeats: 25,
  billedSeats: null,
  seatLimit: 5,
  siteCount: 1,
  conversationCount: 12,
  messageCount: 34,
  avgResponseSeconds: 72,
  conversationLimit: 50,
  conversationUsagePercent: 24,
  upgradePromptThreshold: 30,
  remainingConversations: 38,
  showUpgradePrompt: false,
  limitReached: false,
  nextBillingDate: null,
  trialEndsAt: null,
  subscriptionStatus: null,
  customerId: null,
  portalAvailable: false,
  checkoutAvailable: true,
  features: {
    billedPerSeat: false,
    proactiveChat: false,
    removeBranding: false
  },
  paymentMethod: null,
  invoices: [],
  referrals: {
    programs: [],
    attributedSignups: [],
    rewards: [],
    pendingRewardCount: 0,
    earnedRewardCount: 0,
    earnedFreeMonths: 0,
    earnedDiscountCents: 0,
    earnedCommissionCents: 0
  }
} as DashboardBillingSummary;

describe("dashboard settings billing plan grid", () => {
  it("shows the live growth preview total without a duplicate preview footer", () => {
    const html = renderToStaticMarkup(
      <DashboardSettingsBillingPlanGrid
        billing={baseBilling}
        billingPlanPending={null}
        memberCount={25}
        selectedInterval="monthly"
        onMemberCountChange={() => {}}
        onSetSelectedInterval={() => {}}
        onSelectPlan={() => {}}
      />
    );

    expect(html).toContain("Growth");
    expect(html).toContain("$100");
    expect(html).toContain("/month");
    expect(html).toContain("volume pricing from $6/member/month");
    expect(html).not.toContain("Preview:");
  });
});
