"use client";

import {
  getBillingDisplayPrice,
  getBillingPlanDefinition,
  getBillingSeatPriceCents,
  type BillingInterval,
  type BillingPlanKey
} from "@/lib/billing-plans";
import type { DashboardBillingSummary } from "@/lib/data";
import { DashboardModal } from "./dashboard-modal";
import { billingLostFeatures } from "./dashboard-billing-utils";
import { DASHBOARD_PRIMARY_BUTTON_CLASS, DASHBOARD_SECONDARY_BUTTON_CLASS } from "./dashboard-controls";
import { formatMoney } from "./dashboard-settings-shared";
import { CalendarIcon, CheckIcon, WarningIcon, XIcon } from "./dashboard-ui";

export type BillingPlanIntent = { planKey: BillingPlanKey; billingInterval: BillingInterval; mode: "upgrade" | "switch" | "downgrade" } | null;

export function DashboardSettingsBillingPlanModal({
  billing,
  intent,
  pending,
  onClose,
  onConfirm
}: { billing: DashboardBillingSummary; intent: BillingPlanIntent; pending: boolean; onClose: () => void; onConfirm: () => void }) {
  if (!intent) {
    return null;
  }

  const plan = getBillingPlanDefinition(intent.planKey);
  const displayPrice = getBillingDisplayPrice(intent.planKey, intent.billingInterval);
  const subtotal = billing.usedSeats * (getBillingSeatPriceCents(intent.planKey, intent.billingInterval) ?? 0);

  if (intent.mode === "downgrade") {
    return (
      <DashboardModal title="Cancel paid plan" description="Changes are confirmed in Stripe so invoices and proration stay in sync." onClose={onClose}>
        <div className="space-y-5 px-6 py-6">
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-4">
            <div className="flex items-start gap-3">
              <WarningIcon className="mt-0.5 h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm font-semibold text-red-700">You&apos;re moving back to Starter</p>
                <p className="mt-1 text-sm text-red-600">You&apos;ll lose access to these paid-plan capabilities after Stripe confirms the change.</p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            {billingLostFeatures(billing).map((feature) => (
              <div key={feature} className="flex items-center gap-3 text-sm text-slate-600">
                <XIcon className="h-4 w-4 text-red-500" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
          {billing.nextBillingDate ? (
            <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              <CalendarIcon className="h-4 w-4" />
              <span>You&apos;ll keep access until {billing.nextBillingDate}</span>
            </div>
          ) : null}
          <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-5">
            <button type="button" onClick={onClose} className={DASHBOARD_SECONDARY_BUTTON_CLASS}>Keep plan</button>
            <button type="button" onClick={onConfirm} className="inline-flex h-10 items-center justify-center rounded-lg bg-red-600 px-5 text-sm font-medium text-white transition hover:bg-red-700" disabled={pending}>
              {pending ? "Opening..." : "Open Stripe to cancel"}
            </button>
          </div>
        </div>
      </DashboardModal>
    );
  }

  return (
    <DashboardModal title={intent.mode === "upgrade" ? `Upgrade to ${plan.name}` : `Change to ${plan.name}`} description="Review the seat count and billing summary before continuing." onClose={onClose}>
      <div className="space-y-5 px-6 py-6">
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-4">
          <p className="text-lg font-semibold text-slate-900">{plan.name}</p>
          <p className="mt-1 text-sm text-slate-600">
            {displayPrice.amount}
            {displayPrice.cadence} · {billing.usedSeats} seat{billing.usedSeats === 1 ? "" : "s"}
          </p>
          <div className="mt-4 space-y-2">
            {plan.marketingFeatures.slice(0, 4).map((feature) => (
              <div key={feature} className="flex items-center gap-2 text-sm text-slate-700">
                <CheckIcon className="h-4 w-4 text-green-500" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4">
          <div className="flex items-start gap-3">
            <WarningIcon className="mt-0.5 h-4 w-4 text-amber-600" />
            <div>
              <p className="text-sm font-semibold text-amber-800">
                {intent.mode === "upgrade" ? "Trial starts now" : "Stripe will calculate proration"}
              </p>
              <p className="mt-1 text-sm text-amber-700">
                {intent.mode === "upgrade"
                  ? `Your ${plan.trialDays}-day trial starts immediately.`
                  : "Any credits for unused time, immediate charges, and the next invoice total will be confirmed in Stripe before you approve the change."}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 px-4 py-4">
          <div className="flex items-center justify-between text-sm text-slate-600">
            <span>{plan.name} price</span>
            <span>
              {displayPrice.amount}
              {displayPrice.cadence}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
            <span>Seat count</span>
            <span>{billing.usedSeats}</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
            <span>Billing cadence</span>
            <span className="capitalize">{intent.billingInterval}</span>
          </div>
          <div className="mt-3 border-t border-slate-200 pt-3">
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>Seat subtotal</span>
              <span>{formatMoney(subtotal, "USD")}</span>
            </div>
            <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
              <span>{intent.mode === "upgrade" ? "Trial credit" : "Proration"}</span>
              <span>{intent.mode === "upgrade" ? formatMoney(subtotal, "USD") : "Calculated in Stripe"}</span>
            </div>
            <div className="flex items-center justify-between text-sm font-medium text-slate-900">
              <span>Due today</span>
              <span>
                {intent.mode === "upgrade" ? "$0.00" : "Calculated in Stripe"}
              </span>
            </div>
            {intent.mode === "switch" ? (
              <p className="mt-2 text-sm text-slate-500">
                Stripe will calculate any credits, charges, and renewal timing before you confirm the plan change.
              </p>
            ) : null}
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-5">
          <button type="button" onClick={onClose} className={DASHBOARD_SECONDARY_BUTTON_CLASS}>Cancel</button>
          <button type="button" onClick={onConfirm} className={DASHBOARD_PRIMARY_BUTTON_CLASS} disabled={pending}>
            {pending ? "Processing..." : billing.planKey === "starter" ? `Confirm ${plan.name}` : "Continue in Stripe"}
          </button>
        </div>
      </div>
    </DashboardModal>
  );
}

export function DashboardSettingsBillingUpdatePaymentModal({
  billing,
  open,
  pending,
  onClose,
  onConfirm
}: { billing: DashboardBillingSummary; open: boolean; pending: boolean; onClose: () => void; onConfirm: () => void }) {
  if (!open) {
    return null;
  }

  return (
    <DashboardModal title="Update payment method" description="Payment details are securely managed in Stripe." onClose={onClose} widthClass="max-w-[480px]">
      <div className="space-y-5 px-6 py-6">
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
          {billing.paymentMethod ? (
            <>
              <p className="text-sm font-medium text-slate-900">{billing.paymentMethod.brand.toUpperCase()} •••• {billing.paymentMethod.last4}</p>
              <p className="mt-1 text-sm text-slate-500">Expires {String(billing.paymentMethod.expMonth).padStart(2, "0")}/{String(billing.paymentMethod.expYear).slice(-2)}</p>
            </>
          ) : (
            <>
              <p className="text-sm font-medium text-slate-900">No payment method on file</p>
              <p className="mt-1 text-sm text-slate-500">Stripe will let you add or replace a card before confirming any charge.</p>
            </>
          )}
        </div>
        <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-5">
          <button type="button" onClick={onClose} className={DASHBOARD_SECONDARY_BUTTON_CLASS}>Cancel</button>
          <button type="button" onClick={onConfirm} className={DASHBOARD_PRIMARY_BUTTON_CLASS} disabled={pending}>
            {pending ? "Opening..." : "Open Stripe"}
          </button>
        </div>
      </div>
    </DashboardModal>
  );
}
