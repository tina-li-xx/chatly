"use client";

import type { DashboardBillingSummary } from "@/lib/data/billing-types";
import { FormButton } from "../ui/form-controls";
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
  onOpenUpdatePayment,
  onOpenBillingPortal
}: {
  billing: DashboardBillingSummary;
  onOpenUpdatePayment: () => void;
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
          <FormButton
            type="button"
            onClick={onOpenUpdatePayment}
            className="bg-red-600 hover:bg-red-700"
          >
            Update now
          </FormButton>
        </div>
      ) : null}

      {billing.subscriptionStatus === "trialing" && billing.trialEndsAt ? (
        <div
          className="flex flex-col gap-4 rounded-xl px-6 py-5 text-white sm:flex-row sm:items-center sm:justify-between"
          style={{ backgroundColor: "#f59e0b", backgroundImage: "none" }}
        >
          <div className="flex items-start gap-3">
            <WarningIcon className="mt-0.5 h-6 w-6 shrink-0" />
            <div>
              <p className="text-base font-semibold">
                {trialDaysLeft == null ? "Trial active" : `${trialDaysLeft} day${trialDaysLeft === 1 ? "" : "s"} left in your trial`}
              </p>
              <p className="mt-1 text-sm text-white/85">
                {`Add billing in Stripe by ${billing.trialEndsAt} to avoid interruption.`}
              </p>
            </div>
          </div>
          <FormButton
            type="button"
            onClick={onOpenBillingPortal}
            variant="secondary"
            className="border-white bg-white text-amber-600 hover:border-amber-100 hover:bg-amber-50 hover:text-amber-600"
          >
            Open billing
          </FormButton>
        </div>
      ) : null}
    </>
  );
}
