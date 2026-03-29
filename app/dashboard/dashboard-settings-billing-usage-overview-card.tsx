"use client";

import type { DashboardBillingSummary } from "@/lib/data";
import { billingPeriodLabel, formatResponseTime } from "./dashboard-billing-utils";
import { SettingsCard } from "./dashboard-settings-shared";

export function DashboardSettingsBillingUsageOverviewCard({
  billing
}: {
  billing: DashboardBillingSummary;
}) {
  const stats = [
    [String(billing.conversationCount), "conversations"],
    [String(billing.messageCount ?? 0), "messages sent"],
    [String(billing.usedSeats), "team members"],
    [formatResponseTime(billing.avgResponseSeconds), "avg response time"]
  ] as const;

  return (
    <SettingsCard
      title="Usage this billing period"
      description={billingPeriodLabel()}
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(([value, label]) => (
          <div key={label} className="rounded-xl bg-slate-50 px-4 py-5 text-center">
            <p className="text-3xl font-semibold tracking-tight text-slate-900">{value}</p>
            <p className="mt-1 text-sm text-slate-500">{label}</p>
          </div>
        ))}
      </div>
    </SettingsCard>
  );
}
