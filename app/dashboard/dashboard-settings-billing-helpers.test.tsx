import { renderToStaticMarkup } from "react-dom/server";
import type { DashboardBillingSummary } from "@/lib/data";
import type { DashboardReferralSummary } from "@/lib/referrals";
import { DashboardSettingsBillingBanners } from "./dashboard-settings-billing-banners";
import { SettingsReferralsSection } from "./dashboard-settings-referrals-section";

const referrals: DashboardReferralSummary = {
  programs: [],
  attributedSignups: [],
  rewards: [],
  pendingRewardCount: 0,
  earnedRewardCount: 0,
  earnedFreeMonths: 0,
  earnedDiscountCents: 0,
  earnedCommissionCents: 0
};

const baseBilling = {
  planKey: "growth",
  planName: "Growth",
  priceLabel: "$20/month",
  billingInterval: "monthly",
  usedSeats: 1,
  billedSeats: 1,
  seatLimit: null,
  siteCount: 1,
  conversationCount: 10,
  messageCount: 24,
  avgResponseSeconds: 18,
  conversationLimit: null,
  conversationUsagePercent: null,
  upgradePromptThreshold: 30,
  remainingConversations: null,
  showUpgradePrompt: false,
  limitReached: false,
  nextBillingDate: "12 April 2026",
  trialEndsAt: "12 April 2026",
  subscriptionStatus: "trialing",
  customerId: "cus_123",
  portalAvailable: true,
  checkoutAvailable: true,
  features: { billedPerSeat: true, proactiveChat: true, removeBranding: true },
  paymentMethod: null,
  invoices: [],
  referrals
} as DashboardBillingSummary;

describe("dashboard billing helper cards", () => {
  it("renders payment issue and trial banner states", () => {
    const paymentIssueHtml = renderToStaticMarkup(
      <DashboardSettingsBillingBanners
        billing={{ ...baseBilling, subscriptionStatus: "past_due" }}
        onOpenUpdatePayment={() => {}}
        onOpenBillingPortal={() => {}}
      />
    );
    const trialHtml = renderToStaticMarkup(
      <DashboardSettingsBillingBanners
        billing={{ ...baseBilling, subscriptionStatus: "trialing" }}
        onOpenUpdatePayment={() => {}}
        onOpenBillingPortal={() => {}}
      />
    );

    expect(paymentIssueHtml).toContain("Payment failed");
    expect(paymentIssueHtml).toContain("Update now");
    expect(trialHtml).toContain("left in your trial");
    expect(trialHtml).toContain("Add billing in Stripe by 12 April 2026 to avoid interruption.");
    expect(trialHtml).toContain("Open billing");
  });

  it("renders the referrals section wrapper copy around the billing referrals card", () => {
    const html = renderToStaticMarkup(
      <SettingsReferralsSection
        title="Referrals"
        subtitle="Track referral programs and earned rewards."
        referrals={referrals}
      />
    );

    expect(html).toContain("Referrals");
    expect(html).toContain("Track referral programs and earned rewards.");
    expect(html).toContain("No referred signups yet.");
  });
});
