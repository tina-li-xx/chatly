import { renderToStaticMarkup } from "react-dom/server";
import type { DashboardBillingInvoice, DashboardBillingSummary } from "@/lib/data";
import { DashboardSettingsBillingHistoryCard } from "./dashboard-settings-billing-history-card";
import {
  DashboardSettingsBillingPlanModal,
  DashboardSettingsBillingUpdatePaymentModal
} from "./dashboard-settings-billing-modals";

const baseBilling = {
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
  nextBillingDate: "12 April 2026",
  trialEndsAt: null,
  subscriptionStatus: "active",
  customerId: "cus_123",
  portalAvailable: true,
  checkoutAvailable: true,
  features: { billedPerSeat: true, proactiveChat: true, removeBranding: true },
  paymentMethod: { brand: "visa", last4: "4242", expMonth: 4, expYear: 2030, holderName: "Tina", updatedAt: "2026-03-29T10:00:00.000Z" },
  invoices: [],
  referrals: { programs: [], attributedSignups: [], rewards: [], pendingRewardCount: 0, earnedRewardCount: 0, earnedFreeMonths: 0, earnedDiscountCents: 0, earnedCommissionCents: 0 }
} as DashboardBillingSummary;

function invoice(id: number): DashboardBillingInvoice {
  return {
    id: `inv_${id}`,
    planKey: "growth",
    billingInterval: "monthly",
    seatQuantity: 4,
    description: `Invoice ${id}`,
    amountCents: 2900 + id,
    currency: "usd",
    status: id % 2 ? "paid" : "open",
    hostedInvoiceUrl: `https://example.com/invoice/${id}`,
    invoicePdfUrl: `https://example.com/invoice/${id}.pdf`,
    issuedAt: `2026-03-${String(id).padStart(2, "0")}T10:00:00.000Z`,
    paidAt: null,
    periodStart: null,
    periodEnd: null
  };
}

describe("dashboard billing history and modals", () => {
  it("renders the empty billing history state", () => {
    const html = renderToStaticMarkup(<DashboardSettingsBillingHistoryCard invoices={[]} />);

    expect(html).toContain("No billing history yet");
    expect(html).toContain("first paid billing event");
  });

  it("renders paginated billing history rows with actions", () => {
    const html = renderToStaticMarkup(
      <DashboardSettingsBillingHistoryCard invoices={Array.from({ length: 11 }, (_, index) => invoice(index + 1))} />
    );

    expect(html).toContain("Billing history");
    expect(html).toContain("Showing 1-10 of 11 invoices");
    expect(html).toContain("Prev");
    expect(html).toContain("Next");
    expect(html).toContain("Invoice 11");
  });

  it("renders downgrade and upgrade modal branches", () => {
    const downgradeHtml = renderToStaticMarkup(
      <DashboardSettingsBillingPlanModal
        billing={baseBilling}
        intent={{ planKey: "starter", billingInterval: "monthly", mode: "downgrade" }}
        pending={false}
        onClose={() => {}}
        onConfirm={() => {}}
      />
    );
    const upgradeHtml = renderToStaticMarkup(
      <DashboardSettingsBillingPlanModal
        billing={{ ...baseBilling, planKey: "starter", billedSeats: null, usedSeats: 1 }}
        intent={{ planKey: "growth", billingInterval: "annual", mode: "upgrade" }}
        pending={false}
        onClose={() => {}}
        onConfirm={() => {}}
      />
    );

    expect(renderToStaticMarkup(
      <DashboardSettingsBillingPlanModal
        billing={baseBilling}
        intent={null}
        pending={false}
        onClose={() => {}}
        onConfirm={() => {}}
      />
    )).toBe("");
    expect(downgradeHtml).toContain("Cancel paid plan");
    expect(downgradeHtml).toContain("Proactive chat on high-intent pages");
    expect(downgradeHtml).toContain("Open Stripe to cancel");
    expect(upgradeHtml).toContain("Upgrade to Growth");
    expect(upgradeHtml).toContain("Trial starts now");
    expect(upgradeHtml).toContain("Confirm Growth");
  });

  it("renders the payment modal closed and open states", () => {
    expect(
      renderToStaticMarkup(
        <DashboardSettingsBillingUpdatePaymentModal
          billing={baseBilling}
          open={false}
          pending={false}
          onClose={() => {}}
          onConfirm={() => {}}
        />
      )
    ).toBe("");

    const html = renderToStaticMarkup(
      <DashboardSettingsBillingUpdatePaymentModal
        billing={baseBilling}
        open
        pending={false}
        onClose={() => {}}
        onConfirm={() => {}}
      />
    );

    expect(html).toContain("Update payment method");
    expect(html).toContain("VISA");
    expect(html).toContain("Open Stripe");
  });
});
