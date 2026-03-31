import { renderToStaticMarkup } from "react-dom/server";
import type { DashboardBillingSummary } from "@/lib/data";
import { DashboardSettingsBillingHeroCard } from "./dashboard-settings-billing-hero-card";

const baseBilling = {
  planKey: "growth",
  planName: "Growth",
  priceLabel: "$20/month",
  billingInterval: "monthly",
  usedSeats: 1,
  billedSeats: 1,
  seatLimit: null,
  siteCount: 1,
  conversationCount: 12,
  messageCount: 0,
  avgResponseSeconds: null,
  conversationLimit: null,
  conversationUsagePercent: null,
  upgradePromptThreshold: 30,
  remainingConversations: null,
  showUpgradePrompt: false,
  limitReached: false,
  nextBillingDate: null,
  trialEndsAt: "12 April 2026",
  subscriptionStatus: "trialing",
  customerId: null,
  portalAvailable: true,
  checkoutAvailable: true,
  features: {
    billedPerSeat: true,
    proactiveChat: true,
    removeBranding: true
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
    <DashboardSettingsBillingHeroCard
      billing={{ ...baseBilling, ...overrides }}
      actionLabel="Open billing"
      actionPending={false}
      onAction={() => {}}
    />
  );
}

describe("dashboard settings billing hero card", () => {
  it("hides billed seat copy while growth is within the included 1-3 member cap", () => {
    const html = renderCard();

    expect(html).not.toContain("billed seat");
  });

  it("shows billed seat copy once growth is above the included cap", () => {
    const html = renderCard({
      usedSeats: 4,
      billedSeats: 4
    });

    expect(html).toContain("4 billed seats");
  });
});
