"use client";

import {
  BILLING_PLAN_ORDER,
  formatSeatTotalLabel,
  getBillingPlanDefinition,
  isPaidPlan,
  type BillingInterval,
  type BillingPlanKey
} from "@/lib/billing-plans";
import { CHATLY_ANNUAL_SAVINGS_LABEL, CHATLY_PAID_PLANS_COPY } from "@/lib/pricing";
import type { DashboardBillingSummary } from "@/lib/data";
import { classNames } from "@/lib/utils";
import { PricingPlanCard } from "../pricing-plan-card";
import { SettingsCard } from "./dashboard-settings-shared";

function IntervalButton({
  active,
  onClick,
  label
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={classNames(
        "rounded-full px-4 py-2 text-sm font-medium transition",
        active ? "bg-blue-600 text-white shadow-sm" : "text-slate-600"
      )}
    >
      {label}
    </button>
  );
}

export function DashboardSettingsBillingPlanGrid({
  billing,
  billingPlanPending,
  selectedInterval,
  onSetSelectedInterval,
  onSelectPlan
}: {
  billing: DashboardBillingSummary;
  billingPlanPending: string | null;
  selectedInterval: BillingInterval;
  onSetSelectedInterval: (value: BillingInterval) => void;
  onSelectPlan: (planKey: BillingPlanKey, billingInterval: BillingInterval) => void;
}) {
  const intervalToggle = (
    <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 p-1">
      <IntervalButton active={selectedInterval === "monthly"} onClick={() => onSetSelectedInterval("monthly")} label="Monthly" />
      <IntervalButton active={selectedInterval === "annual"} onClick={() => onSetSelectedInterval("annual")} label="Annual" />
    </div>
  );
  const comparablePlans = BILLING_PLAN_ORDER.filter((planKey) => planKey !== billing.planKey);

  return (
    <SettingsCard
      title="Compare plans"
      description={`${CHATLY_PAID_PLANS_COPY} Annual saves ${CHATLY_ANNUAL_SAVINGS_LABEL.toLowerCase()}.`}
      actions={intervalToggle}
    >
      <div className="grid gap-4 md:grid-cols-2">
        {comparablePlans.map((planKey) => {
          const plan = getBillingPlanDefinition(planKey);
          const pendingKey = `${planKey}:${selectedInterval}`;
          const actionLabel =
            planKey === "starter"
              ? "Downgrade"
              : billing.planKey === "starter"
                ? `Upgrade to ${plan.name}`
                : `Change to ${plan.name}`;

          return (
            <PricingPlanCard
              key={planKey}
              planKey={planKey}
              interval={selectedInterval}
              featuredLabel={plan.featured ? "Recommended" : null}
              priceNote={isPaidPlan(planKey) ? plan.savingsLabel : undefined}
              footerLabel={
                isPaidPlan(planKey)
                  ? formatSeatTotalLabel(planKey, selectedInterval, billing.usedSeats)
                  : null
              }
              action={
                <button
                  type="button"
                  onClick={() => onSelectPlan(planKey, selectedInterval)}
                  disabled={Boolean(billingPlanPending)}
                  className={classNames(
                    "inline-flex w-full items-center justify-center rounded-2xl px-5 py-4 text-base font-semibold transition disabled:opacity-60",
                    plan.featured
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:text-slate-900"
                  )}
                >
                  {billingPlanPending === pendingKey ? "Processing..." : actionLabel}
                </button>
              }
            />
          );
        })}
      </div>

    </SettingsCard>
  );
}
