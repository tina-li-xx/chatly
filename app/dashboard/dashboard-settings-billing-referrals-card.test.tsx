import { renderToStaticMarkup } from "react-dom/server";
import { DashboardSettingsBillingReferralsCard } from "./dashboard-settings-billing-referrals-card";

describe("dashboard settings billing referrals card", () => {
  it("shows affiliate commissions as rate-based ledger entries instead of zero-dollar placeholders", () => {
    const html = renderToStaticMarkup(
      <DashboardSettingsBillingReferralsCard
        referrals={{
          programs: [
            {
              id: "program_affiliate",
              code: "AFF-ABC123",
              label: "Affiliate program",
              programType: "affiliate",
              incentiveLabel: "25% recurring commission",
              description: "Earn recurring commissions on paid invoices.",
              shareUrl: "https://chatly.example/signup?ref=AFF-ABC123"
            }
          ],
          attributedSignups: [],
          rewards: [
            {
              id: "reward_pending",
              programLabel: "Affiliate program",
              programType: "affiliate",
              rewardRole: "referrer",
              rewardKind: "commission",
              status: "pending",
              description: "Pending affiliate commission until the first paid invoice lands at 25% recurring commission.",
              rewardMonths: 0,
              rewardCents: 0,
              commissionBps: 2500,
              sourceInvoiceId: null,
              sourceInvoiceAmountCents: null,
              createdAt: "2026-03-29T11:00:00.000Z",
              earnedAt: null
            },
            {
              id: "reward_earned",
              programLabel: "Affiliate program",
              programType: "affiliate",
              rewardRole: "referrer",
              rewardKind: "commission",
              status: "earned",
              description: "Affiliate commission earned on the first paid invoice at 25% recurring commission.",
              rewardMonths: 0,
              rewardCents: 1975,
              commissionBps: 2500,
              sourceInvoiceId: "in_1",
              sourceInvoiceAmountCents: 7900,
              createdAt: "2026-03-29T11:00:00.000Z",
              earnedAt: "2026-03-29T13:00:00.000Z"
            }
          ],
          pendingRewardCount: 1,
          earnedRewardCount: 1,
          earnedFreeMonths: 0,
          earnedDiscountCents: 0,
          earnedCommissionCents: 1975
        }}
      />
    );

    expect(html).toContain("25% recurring");
    expect(html).toContain("Tracked from a US$79.00 paid invoice");
    expect(html).toContain("US$19.75");
    expect(html).not.toContain("$0.00");
  });
});
