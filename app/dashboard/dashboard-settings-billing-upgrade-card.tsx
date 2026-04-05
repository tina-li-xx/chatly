"use client";

import type { BillingInterval, BillingPlanKey, DashboardBillingSummary } from "@/lib/data/billing-types";
import { FormButton } from "../ui/form-controls";
import { SettingsCard } from "./dashboard-settings-shared";
import { WarningIcon } from "./dashboard-ui";

export function DashboardSettingsBillingUpgradeCard({
  billing,
  billingPlanPending,
  selectedInterval,
  onChangePlan
}: {
  billing: DashboardBillingSummary;
  billingPlanPending: string | null;
  selectedInterval: BillingInterval;
  onChangePlan: (planKey: BillingPlanKey, billingInterval: BillingInterval, seatQuantity?: number) => void;
}) {
  if (
    billing.planKey !== "starter" ||
    !billing.showUpgradePrompt ||
    !billing.conversationLimit ||
    billing.remainingConversations === null
  ) {
    return null;
  }

  const headline = billing.limitReached
    ? `You've hit ${billing.conversationCount} of ${billing.conversationLimit} conversations this month`
    : `You're at ${billing.conversationCount} of ${billing.conversationLimit} conversations this month`;
  const body = billing.limitReached
    ? "Your free monthly conversation cap is full. Upgrade to Growth to keep new chats flowing without interruptions."
    : billing.remainingConversations === 1
      ? "You only have 1 conversation left before the free monthly cap kicks in. Upgrade now to stay ahead of it."
      : `Only ${billing.remainingConversations} conversations remain before the free monthly cap kicks in. Upgrade now to stay ahead of it.`;
  const usagePercent = Math.max(12, Math.min(100, billing.conversationUsagePercent ?? 0));
  const pendingKey = `growth:${selectedInterval}`;

  return (
    <SettingsCard className="border-amber-200 bg-[linear-gradient(135deg,#FFF7ED_0%,#FFFFFF_58%,#EFF6FF_100%)]">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-800">
            <WarningIcon className="h-3.5 w-3.5" />
            Starter usage alert
          </span>
          <h3 className="mt-4 text-xl font-semibold text-slate-900">{headline}</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{body}</p>
        </div>

        <FormButton
          type="button"
          onClick={() => onChangePlan("growth", selectedInterval)}
          disabled={Boolean(billingPlanPending)}
          className="min-w-[180px] shadow-sm"
        >
          {billingPlanPending === pendingKey
            ? "Processing..."
            : billing.limitReached
              ? "Upgrade to reopen"
              : "Upgrade to Growth"}
        </FormButton>
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
          <span>This month</span>
          <span>
            {billing.conversationCount}/{billing.conversationLimit}
          </span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-white shadow-inner">
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,#F59E0B_0%,#F97316_52%,#2563EB_100%)]"
            style={{ width: `${usagePercent}%` }}
          />
        </div>
      </div>
    </SettingsCard>
  );
}
