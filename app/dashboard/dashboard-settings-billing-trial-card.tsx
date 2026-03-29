"use client";

import type { DashboardBillingSummary } from "@/lib/data";
import { classNames } from "@/lib/utils";
import { DASHBOARD_PRIMARY_BUTTON_CLASS } from "./dashboard-controls";
import { SettingsCard } from "./dashboard-settings-shared";

export function DashboardSettingsBillingTrialCard({
  billing,
  trialExtensionPending,
  onExtendTrial
}: {
  billing: DashboardBillingSummary;
  trialExtensionPending: boolean;
  onExtendTrial: () => void;
}) {
  if (!billing.trialExtensionEligible || !billing.trialEndsAt) {
    return null;
  }

  return (
    <SettingsCard className="border-blue-200 bg-[linear-gradient(135deg,#EFF6FF_0%,#FFFFFF_58%,#F8FAFC_100%)]">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-700">
            Trial support
          </span>
          <h3 className="mt-4 text-xl font-semibold text-slate-900">Need a little more time?</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Your workspace is active, so you can extend this trial by 7 days. We&apos;ll also send a personal outreach email so you can reply with rollout, pricing, or setup questions before the trial ends on {billing.trialEndsAt}.
          </p>
        </div>

        <button
          type="button"
          onClick={onExtendTrial}
          disabled={trialExtensionPending}
          className={classNames(DASHBOARD_PRIMARY_BUTTON_CLASS, "min-w-[220px] shadow-sm")}
        >
          {trialExtensionPending ? "Extending..." : "Extend trial by 7 days"}
        </button>
      </div>
    </SettingsCard>
  );
}
