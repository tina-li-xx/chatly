import { renderToStaticMarkup } from "react-dom/server";
import type { DashboardBillingSummary } from "@/lib/data";
import { DashboardSettingsBillingUpgradeCard } from "./dashboard-settings-billing-upgrade-card";

const baseBilling = {
  planKey: "starter",
  planName: "Starter",
  priceLabel: "$0/month",
  billingInterval: null,
  usedSeats: 1,
  billedSeats: null,
  seatLimit: 5,
  siteCount: 1,
  conversationCount: 12,
  messageCount: 0,
  avgResponseSeconds: null,
  conversationLimit: 50,
  conversationUsagePercent: 24,
  upgradePromptThreshold: 30,
  remainingConversations: 38,
  showUpgradePrompt: false,
  limitReached: false,
  nextBillingDate: null,
  trialEndsAt: null,
  trialExtensionEligible: false,
  trialExtensionUsedAt: null,
  activityQualifiedForTrialExtension: false,
  subscriptionStatus: null,
  customerId: null,
  portalAvailable: false,
  checkoutAvailable: true,
  features: {
    billedPerSeat: false,
    proactiveChat: false,
    removeBranding: false,
    trialExtensions: false
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

function renderCard(overrides: Partial<DashboardBillingSummary> = {}) {
  return renderToStaticMarkup(
    <DashboardSettingsBillingUpgradeCard
      billing={{ ...baseBilling, ...overrides }}
      billingPlanPending={null}
      selectedInterval="monthly"
      onChangePlan={() => {}}
    />
  );
}

describe("dashboard settings billing upgrade card", () => {
  it("renders nothing before the starter threshold is reached", () => {
    expect(renderCard()).toBe("");
  });

  it("renders the early warning state at the 30/50 conversation trigger", () => {
    const html = renderCard({
      conversationCount: 30,
      conversationUsagePercent: 60,
      remainingConversations: 20,
      showUpgradePrompt: true
    });

    expect(html).toContain("Starter usage alert");
    expect(html).toContain("You&#x27;re at 30 of 50 conversations this month");
    expect(html).toContain("Only 20 conversations remain before the free monthly cap kicks in");
    expect(html).toContain("Upgrade to Growth");
    expect(html).toContain("30/50");
  });

  it("renders the cap-reached state once the monthly limit is full", () => {
    const html = renderCard({
      conversationCount: 50,
      conversationUsagePercent: 100,
      remainingConversations: 0,
      showUpgradePrompt: true,
      limitReached: true
    });

    expect(html).toContain("You&#x27;ve hit 50 of 50 conversations this month");
    expect(html).toContain("Upgrade to reopen");
  });
});
