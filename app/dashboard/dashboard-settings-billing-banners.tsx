"use client";

import type { DashboardBillingSummary } from "@/lib/data";
import { billingHasPaymentIssue } from "./dashboard-billing-utils";
import { WarningIcon } from "./dashboard-ui";

function daysUntil(dateLabel: string) {
  const value = Date.parse(dateLabel);
  if (Number.isNaN(value)) {
    return null;
  }

  return Math.max(0, Math.ceil((value - Date.now()) / (1000 * 60 * 60 * 24)));
}

export function DashboardSettingsBillingBanners({
  billing,
  trialExtensionPending,
  onOpenUpdatePayment,
  onExtendTrial,
  onOpenBillingPortal
}: {
  billing: DashboardBillingSummary;
  trialExtensionPending: boolean;
  onOpenUpdatePayment: () => void;
  onExtendTrial: () => void;
  onOpenBillingPortal: () => void;
}) {
  const trialDaysLeft = billing.trialEndsAt ? daysUntil(billing.trialEndsAt) : null;

  return (
    <>
      {billingHasPaymentIssue(billing.subscriptionStatus) ? (
        <div className="flex flex-col gap-4 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-red-700 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <WarningIcon className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="text-sm font-semibold">Payment failed</p>
              <p className="mt-1 text-sm text-red-600">
                Update your payment details in Stripe to keep your workspace on the current plan.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenUpdatePayment}
            className="inline-flex h-10 items-center justify-center rounded-lg bg-red-600 px-4 text-sm font-medium text-white transition hover:bg-red-700"
          >
            Update now
          </button>
        </div>
      ) : null}

      {billing.subscriptionStatus === "trialing" && billing.trialEndsAt ? (
        <div className="flex flex-col gap-4 rounded-xl bg-[linear-gradient(135deg,#F59E0B_0%,#F97316_100%)] px-6 py-5 text-white sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <WarningIcon className="mt-0.5 h-6 w-6 shrink-0" />
            <div>
              <p className="text-base font-semibold">
                {trialDaysLeft == null ? "Trial active" : `${trialDaysLeft} day${trialDaysLeft === 1 ? "" : "s"} left in your trial`}
              </p>
              <p className="mt-1 text-sm text-white/85">
                {billing.trialExtensionEligible
                  ? `Your workspace is active, so you can extend the trial by 7 days before it ends on ${billing.trialEndsAt}.`
                  : `Add billing in Stripe before ${billing.trialEndsAt} to keep the current workspace running without interruption.`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={billing.trialExtensionEligible ? onExtendTrial : onOpenBillingPortal}
            disabled={trialExtensionPending}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-white px-5 text-sm font-medium text-amber-600 transition hover:bg-amber-50 disabled:opacity-60"
          >
            {billing.trialExtensionEligible
              ? trialExtensionPending
                ? "Extending..."
                : "Extend trial"
              : "Open billing"}
          </button>
        </div>
      ) : null}
    </>
  );
}
