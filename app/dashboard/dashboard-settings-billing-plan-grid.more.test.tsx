import { renderToStaticMarkup } from "react-dom/server";
import type { DashboardBillingSummary } from "@/lib/data";
import { DashboardSettingsBillingPlanGrid } from "./dashboard-settings-billing-plan-grid";

const baseBilling = {
  planKey: "starter",
  planName: "Starter Plan",
  priceLabel: "$0/month",
  billingInterval: "monthly",
  usedSeats: 2,
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
  features: { billedPerSeat: false, proactiveChat: false, removeBranding: false },
  paymentMethod: null,
  invoices: [],
  referrals: { programs: [], attributedSignups: [], rewards: [], pendingRewardCount: 0, earnedRewardCount: 0, earnedFreeMonths: 0, earnedDiscountCents: 0, earnedCommissionCents: 0 }
} as DashboardBillingSummary;

describe("dashboard settings billing plan grid more", () => {
  it("updates the growth price when the selected interval and member count change", () => {
    const html = renderToStaticMarkup(
      <DashboardSettingsBillingPlanGrid
        billing={baseBilling}
        billingPlanPending={null}
        memberCount={9}
        selectedInterval="annual"
        onMemberCountChange={() => {}}
        onSetSelectedInterval={() => {}}
        onSelectPlan={() => {}}
      />
    );

    expect(html).toContain("$540");
    expect(html).toContain("/year");
    expect(html).toContain("volume pricing from $60/member/year");
  });

  it("shows current starter and processing states", () => {
    const starterHtml = renderToStaticMarkup(
      <DashboardSettingsBillingPlanGrid
        billing={baseBilling}
        billingPlanPending={null}
        memberCount={2}
        selectedInterval="monthly"
        onMemberCountChange={() => {}}
        onSetSelectedInterval={() => {}}
        onSelectPlan={() => {}}
      />
    );
    const processingHtml = renderToStaticMarkup(
      <DashboardSettingsBillingPlanGrid
        billing={baseBilling}
        billingPlanPending="starter:monthly"
        memberCount={2}
        selectedInterval="monthly"
        onMemberCountChange={() => {}}
        onSetSelectedInterval={() => {}}
        onSelectPlan={() => {}}
      />
    );

    expect(starterHtml).toContain("Current plan");
    expect(processingHtml).toContain("Processing...");
  });

  it("shows current growth and switch interval states", () => {
    const currentHtml = renderToStaticMarkup(
      <DashboardSettingsBillingPlanGrid
        billing={{ ...baseBilling, planKey: "growth", billingInterval: "annual" }}
        billingPlanPending={null}
        memberCount={2}
        selectedInterval="annual"
        onMemberCountChange={() => {}}
        onSetSelectedInterval={() => {}}
        onSelectPlan={() => {}}
      />
    );
    const switchHtml = renderToStaticMarkup(
      <DashboardSettingsBillingPlanGrid
        billing={{ ...baseBilling, planKey: "growth", billingInterval: "monthly" }}
        billingPlanPending={null}
        memberCount={2}
        selectedInterval="annual"
        onMemberCountChange={() => {}}
        onSetSelectedInterval={() => {}}
        onSelectPlan={() => {}}
      />
    );

    expect(currentHtml).toContain("Current plan");
    expect(switchHtml).toContain("Switch to Yearly");
  });
});
