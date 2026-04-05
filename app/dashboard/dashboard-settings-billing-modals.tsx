"use client";

import {
  getBillingPlanDefinition,
  getBillingPreviewDisplayPrice,
  getBillingTotalCents,
  type BillingInterval,
  type BillingPlanKey
} from "@/lib/billing-plans";
import type { DashboardBillingSummary } from "@/lib/data/billing-types";
import { FormButton, FormButtonLink } from "../ui/form-controls";
import { DashboardModal } from "./dashboard-modal";
import { billingLostFeatures } from "./dashboard-billing-utils";
import { formatMoney } from "./dashboard-settings-shared";
import { CalendarIcon, CheckIcon, WarningIcon, XIcon } from "./dashboard-ui";

export type BillingPlanIntent = {
  planKey: BillingPlanKey;
  billingInterval: BillingInterval;
  mode: "upgrade" | "switch" | "downgrade";
  seatQuantity?: number;
} | null;

const CUSTOM_QUOTE_EMAIL = "tina@usechatting.com";

function buildCustomQuoteHref(seatCount: number, planName: string) {
  const params = new URLSearchParams({
    subject: `Chatting custom quote request for ${seatCount} members`,
    body: `Hi Tina,\n\nWe'd like a custom quote for ${seatCount} members on the ${planName} plan.\n\nThanks!`
  });

  return `mailto:${CUSTOM_QUOTE_EMAIL}?${params.toString()}`;
}

function resolveSeatCount(intent: Exclude<BillingPlanIntent, null>, billing: DashboardBillingSummary) {
  if (intent.mode === "upgrade") {
    return Math.max(1, Math.floor(intent.seatQuantity ?? billing.usedSeats ?? 1));
  }

  return billing.billedSeats ?? billing.usedSeats;
}

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
  const seatCount = resolveSeatCount(intent, billing);
  const displayPrice = getBillingPreviewDisplayPrice(intent.planKey, intent.billingInterval, seatCount);
  const subtotal = getBillingTotalCents(intent.planKey, intent.billingInterval, seatCount);
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
            <FormButton type="button" onClick={onClose} variant="secondary" size="md">
              Keep plan
            </FormButton>
            <FormButton type="button" onClick={onConfirm} size="md" className="bg-red-600 hover:bg-red-700" disabled={pending}>
              {pending ? "Opening..." : "Open Stripe to cancel"}
            </FormButton>
          </div>
        </div>
      </DashboardModal>
    );
  }

  return (
    <DashboardModal title={intent.mode === "upgrade" ? `Upgrade to ${plan.name}` : `Change to ${plan.name}`} description="Review the member count and billing summary before continuing." onClose={onClose}>
      <div className="space-y-5 px-6 py-6">
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-4">
          <p className="text-lg font-semibold text-slate-900">{plan.name}</p>
          <p className="mt-1 text-sm text-slate-600">
            {displayPrice.amount}
            {displayPrice.cadence || ""} · {seatCount} member{seatCount === 1 ? "" : "s"}
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
              <p className="mt-1 text-sm text-amber-700">{intent.mode === "upgrade" ? `Your ${plan.trialDays}-day trial starts immediately.` : "Any credits for unused time, immediate charges, and the next invoice total will be confirmed in Stripe before you approve the change."}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 px-4 py-4">
          <div className="flex items-center justify-between text-sm text-slate-600">
            <span>{plan.name} price</span>
            <span>
              {displayPrice.amount}
              {displayPrice.cadence || ""}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
            <span>Member count</span>
            <span>{seatCount}</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
            <span>Billing cadence</span>
            <span className="capitalize">{intent.billingInterval}</span>
          </div>
          {subtotal === null ? (
            <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-800">
              <p className="font-medium text-amber-900">Teams with 50 or more members need a custom quote before billing can continue.</p>
              <p className="mt-2">
                Email Tina directly and we&apos;ll help you with pricing, rollout, and billing setup for larger teams.
              </p>
            </div>
          ) : (
            <div className="mt-3 border-t border-slate-200 pt-3">
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>Plan subtotal</span>
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
          )}
        </div>
        <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-5">
          <FormButton type="button" onClick={onClose} variant="secondary" size="md">
            Cancel
          </FormButton>
          {subtotal === null ? (
            <FormButtonLink href={buildCustomQuoteHref(seatCount, plan.name)} size="md">
              Email Tina for a quote
            </FormButtonLink>
          ) : (
            <FormButton type="button" onClick={onConfirm} size="md" disabled={pending}>
              {pending
                ? "Processing..."
                : billing.planKey === "starter"
                  ? `Confirm ${plan.name}`
                  : "Continue in Stripe"}
            </FormButton>
          )}
        </div>
      </div>
    </DashboardModal>
  );
}
export function DashboardSettingsBillingUpdatePaymentModal({ billing, open, pending, onClose, onConfirm }: { billing: DashboardBillingSummary; open: boolean; pending: boolean; onClose: () => void; onConfirm: () => void }) {
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
          <FormButton type="button" onClick={onClose} variant="secondary" size="md">
            Cancel
          </FormButton>
          <FormButton type="button" onClick={onConfirm} size="md" disabled={pending}>
            {pending ? "Opening..." : "Open Stripe"}
          </FormButton>
        </div>
      </div>
    </DashboardModal>
  );
}
