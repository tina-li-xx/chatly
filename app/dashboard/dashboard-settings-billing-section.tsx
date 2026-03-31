"use client";

import { useState } from "react";
import type { BillingInterval, BillingPlanKey, DashboardBillingSummary } from "@/lib/data/billing-types";
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

export function SettingsBillingSection({
  title,
  subtitle,
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
  billing: DashboardBillingSummary;
  billingPlanPending: string | null;
  selectedInterval: BillingInterval;
  billingPortalPending: boolean;
  billingSyncPending: boolean;
  onOpenBillingPortal: () => void;
  onChangePlan: (planKey: BillingPlanKey, billingInterval: BillingInterval) => void;
  onSetSelectedInterval: (value: BillingInterval) => void;
  onSyncBilling: () => void;
}) {
  const [planIntent, setPlanIntent] = useState<BillingPlanIntent>(null);
  const [updatePaymentOpen, setUpdatePaymentOpen] = useState(false);
  const heroAction =
    billing.planKey === "starter"
      ? {
          label: "Start Growth",
          pending: Boolean(billingPlanPending),
          onClick: () => handleSelectPlan("growth", selectedInterval)
        }
      : {
          label: "Manage",
          pending: false,
          onClick: onOpenBillingPortal
        };

  function handleSelectPlan(planKey: BillingPlanKey, billingInterval: BillingInterval) {
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
            : "switch"
    });
  }

  function confirmPlanIntent() {
    if (!planIntent) {
      return;
    }

    if (planIntent.mode === "upgrade") {
      void onChangePlan(planIntent.planKey, planIntent.billingInterval);
    } else {
      void onOpenBillingPortal();
    }
  }

  return (
    <div className="space-y-6">
      <SettingsSectionHeader title={title} subtitle={subtitle} />

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
        selectedInterval={selectedInterval}
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
