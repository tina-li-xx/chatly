import { renderToStaticMarkup } from "react-dom/server";
import type { DashboardBillingSummary } from "@/lib/data";
import { createMockReactHooks } from "./test-react-hooks";

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
  portalAvailable: true,
  checkoutAvailable: true,
  features: { billedPerSeat: false, proactiveChat: false, removeBranding: false },
  paymentMethod: null,
  invoices: [],
  referrals: { programs: [], attributedSignups: [], rewards: [], pendingRewardCount: 0, earnedRewardCount: 0, earnedFreeMonths: 0, earnedDiscountCents: 0, earnedCommissionCents: 0 }
} as DashboardBillingSummary;

async function loadBillingSection() {
  vi.resetModules();
  const reactMocks = createMockReactHooks();
  const captures: Record<string, unknown> = {};
  vi.doMock("react", () => reactMocks.moduleFactory());
  vi.doMock("./dashboard-settings-shared", () => ({ SettingsSectionHeader: (props: unknown) => ((captures.header = props), <div>header</div>) }));
  vi.doMock("./dashboard-settings-billing-banners", () => ({ DashboardSettingsBillingBanners: (props: unknown) => ((captures.banners = props), <div>banners</div>) }));
  vi.doMock("./dashboard-settings-billing-hero-card", () => ({ DashboardSettingsBillingHeroCard: (props: unknown) => ((captures.hero = props), <div>hero</div>) }));
  vi.doMock("./dashboard-settings-billing-usage-overview-card", () => ({ DashboardSettingsBillingUsageOverviewCard: (props: unknown) => ((captures.usage = props), <div>usage</div>) }));
  vi.doMock("./dashboard-settings-billing-plan-grid", () => ({ DashboardSettingsBillingPlanGrid: (props: unknown) => ((captures.grid = props), <div>grid</div>) }));
  vi.doMock("./dashboard-settings-billing-history-card", () => ({ DashboardSettingsBillingHistoryCard: (props: unknown) => ((captures.history = props), <div>history</div>) }));
  vi.doMock("./dashboard-settings-billing-modals", () => ({
    DashboardSettingsBillingPlanModal: (props: unknown) => ((captures.planModal = props), <div>plan-modal</div>),
    DashboardSettingsBillingUpdatePaymentModal: (props: unknown) => ((captures.paymentModal = props), <div>payment-modal</div>)
  }));

  const module = await import("./dashboard-settings-billing-section");
  return { SettingsBillingSection: module.SettingsBillingSection, captures, reactMocks };
}

function renderSection(Component: (props: Record<string, unknown>) => JSX.Element, reactMocks: ReturnType<typeof createMockReactHooks>, billing: DashboardBillingSummary, handlers: Record<string, unknown>) {
  reactMocks.beginRender();
  renderToStaticMarkup(
    <Component
      title="Billing"
      subtitle="Manage workspace billing"
      billing={billing}
      billingPlanPending={null}
      selectedInterval="annual"
      billingPortalPending={false}
      billingSyncPending={false}
      {...handlers}
    />
  );
}

describe("settings billing section", () => {
  it("routes starter upgrades through the plan modal and checkout handler", async () => {
    const onChangePlan = vi.fn();
    const onOpenBillingPortal = vi.fn();
    const onSetSelectedInterval = vi.fn();
    const { SettingsBillingSection, captures, reactMocks } = await loadBillingSection();

    renderSection(SettingsBillingSection, reactMocks, baseBilling, { onOpenBillingPortal, onChangePlan, onSetSelectedInterval, onSyncBilling: vi.fn() });
    expect((captures.hero as { actionLabel: string }).actionLabel).toBe("Start Growth");
    (captures.grid as { onSetSelectedInterval: (value: string) => void }).onSetSelectedInterval("monthly");
    (captures.hero as { onAction: () => void }).onAction();
    renderSection(SettingsBillingSection, reactMocks, baseBilling, { onOpenBillingPortal, onChangePlan, onSetSelectedInterval, onSyncBilling: vi.fn() });
    (captures.planModal as { onConfirm: () => void; intent: { mode: string; planKey: string; billingInterval: string } }).onConfirm();

    expect(onSetSelectedInterval).toHaveBeenCalledWith("monthly");
    expect((captures.planModal as { intent: { mode: string; planKey: string; billingInterval: string } }).intent).toEqual({
      planKey: "growth",
      billingInterval: "annual",
      mode: "upgrade"
    });
    expect(onChangePlan).toHaveBeenCalledWith("growth", "annual");
    expect(onOpenBillingPortal).not.toHaveBeenCalled();
  });

  it("routes paid-plan management through the billing portal and payment modal", async () => {
    const onOpenBillingPortal = vi.fn();
    const growthBilling = { ...baseBilling, planKey: "growth", billingInterval: "monthly", priceLabel: "$20/month" } as DashboardBillingSummary;
    const { SettingsBillingSection, captures, reactMocks } = await loadBillingSection();

    renderSection(SettingsBillingSection, reactMocks, growthBilling, { onOpenBillingPortal, onChangePlan: vi.fn(), onSetSelectedInterval: vi.fn(), onSyncBilling: vi.fn() });
    (captures.hero as { onAction: () => void }).onAction();
    (captures.grid as { onSelectPlan: (plan: "starter", interval: "monthly") => void }).onSelectPlan("starter", "monthly");
    renderSection(SettingsBillingSection, reactMocks, growthBilling, { onOpenBillingPortal, onChangePlan: vi.fn(), onSetSelectedInterval: vi.fn(), onSyncBilling: vi.fn() });
    (captures.planModal as { onConfirm: () => void; intent: { mode: string } }).onConfirm();
    (captures.banners as { onOpenUpdatePayment: () => void }).onOpenUpdatePayment();
    renderSection(SettingsBillingSection, reactMocks, growthBilling, { onOpenBillingPortal, onChangePlan: vi.fn(), onSetSelectedInterval: vi.fn(), onSyncBilling: vi.fn() });
    (captures.paymentModal as { onConfirm: () => void; open: boolean }).onConfirm();

    expect((captures.planModal as { intent: { mode: string } }).intent.mode).toBe("downgrade");
    expect((captures.paymentModal as { open: boolean }).open).toBe(true);
    expect(onOpenBillingPortal).toHaveBeenCalledTimes(3);
  });
});
