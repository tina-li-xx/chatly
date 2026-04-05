"use client";

import { useEffect, useState, type ReactNode } from "react";
import type { BillingInterval, BillingPlanKey, DashboardBillingSummary } from "@/lib/data/billing-types";
import { CHATTING_GROWTH_CONTACT_TEAM_SIZE } from "@/lib/pricing";
import { DashboardSettingsBillingBanners } from "./dashboard-settings-billing-banners";
import { DashboardSettingsBillingHeroCard } from "./dashboard-settings-billing-hero-card";
import { DashboardSettingsBillingHistoryCard } from "./dashboard-settings-billing-history-card";
import {
  type BillingPlanIntent,
  DashboardSettingsBillingPlanModal,
  DashboardSettingsBillingUpdatePaymentModal
} from "./dashboard-settings-billing-modals";
import { DashboardSettingsBillingPlanGrid } from "./dashboard-settings-billing-plan-grid";
import { DashboardSettingsBillingUsageOverviewCard } from "./dashboard-settings-billing-usage-overview-card";
import { SettingsSectionHeader } from "./dashboard-settings-shared";

function normalizeBillingPreviewSeatCount(value: number) {
  return Math.min(Math.max(Math.floor(value || 1), 1), CHATTING_GROWTH_CONTACT_TEAM_SIZE);
}

export function SettingsBillingSection({
  title,
  subtitle,
  headerActions,
  billing,
  billingPlanPending,
  selectedInterval,
  billingPortalPending,
  billingSyncPending: _billingSyncPending,
  onOpenBillingPortal,
  onChangePlan,
  onSetSelectedInterval,
  onSyncBilling: _onSyncBilling
}: {
  title: string;
  subtitle: string;
  headerActions?: ReactNode;
  billing: DashboardBillingSummary;
  billingPlanPending: string | null;
  selectedInterval: BillingInterval;
  billingPortalPending: boolean;
  billingSyncPending: boolean;
  onOpenBillingPortal: () => void;
  onChangePlan: (planKey: BillingPlanKey, billingInterval: BillingInterval, seatQuantity?: number) => void;
  onSetSelectedInterval: (value: BillingInterval) => void;
  onSyncBilling: () => void;
}) {
  const [planIntent, setPlanIntent] = useState<BillingPlanIntent>(null);
  const [updatePaymentOpen, setUpdatePaymentOpen] = useState(false);
  const [memberCount, setMemberCount] = useState(() => normalizeBillingPreviewSeatCount(billing.usedSeats));

  useEffect(() => {
    setMemberCount(normalizeBillingPreviewSeatCount(billing.usedSeats));
  }, [billing.usedSeats]);

  const heroAction =
    billing.planKey === "starter"
      ? {
          label: "Start Growth",
          pending: Boolean(billingPlanPending),
          onClick: () => handleSelectPlan("growth", selectedInterval, memberCount)
        }
      : {
          label: "Manage",
          pending: false,
          onClick: onOpenBillingPortal
        };

  function handleSelectPlan(planKey: BillingPlanKey, billingInterval: BillingInterval, seatQuantity?: number) {
    if (billing.planKey === planKey && (planKey === "starter" || billing.billingInterval === billingInterval)) {
      return;
    }

    setPlanIntent({
      planKey,
      billingInterval,
      mode:
        planKey === "starter"
          ? "downgrade"
          : billing.planKey === "starter"
            ? "upgrade"
            : "switch",
      seatQuantity:
        planKey === "growth" && billing.planKey === "starter"
          ? normalizeBillingPreviewSeatCount(seatQuantity ?? memberCount)
          : undefined
    });
  }

  function confirmPlanIntent() {
    if (!planIntent) {
      return;
    }

    if (planIntent.mode === "upgrade") {
      void onChangePlan(planIntent.planKey, planIntent.billingInterval, planIntent.seatQuantity ?? memberCount);
    } else {
      void onOpenBillingPortal();
    }
  }

  return (
    <div className="space-y-6">
      <SettingsSectionHeader title={title} subtitle={subtitle} actions={headerActions} />

      <DashboardSettingsBillingBanners
        billing={billing}
        onOpenUpdatePayment={() => setUpdatePaymentOpen(true)}
        onOpenBillingPortal={onOpenBillingPortal}
      />

      <DashboardSettingsBillingHeroCard
        billing={billing}
        actionLabel={heroAction.label}
        actionPending={heroAction.pending}
        onAction={heroAction.onClick}
      />

      <DashboardSettingsBillingUsageOverviewCard billing={billing} />

      <DashboardSettingsBillingPlanGrid
        billing={billing}
        billingPlanPending={billingPlanPending}
        memberCount={memberCount}
        selectedInterval={selectedInterval}
        onMemberCountChange={(value) => setMemberCount(normalizeBillingPreviewSeatCount(value))}
        onSetSelectedInterval={onSetSelectedInterval}
        onSelectPlan={handleSelectPlan}
      />

      <DashboardSettingsBillingHistoryCard invoices={billing.invoices} />

      <DashboardSettingsBillingPlanModal
        billing={billing}
        intent={planIntent}
        pending={Boolean(billingPlanPending) || billingPortalPending}
        onClose={() => setPlanIntent(null)}
        onConfirm={confirmPlanIntent}
      />
      <DashboardSettingsBillingUpdatePaymentModal
        billing={billing}
        open={updatePaymentOpen}
        pending={billingPortalPending}
        onClose={() => setUpdatePaymentOpen(false)}
        onConfirm={onOpenBillingPortal}
      />
    </div>
  );
}
