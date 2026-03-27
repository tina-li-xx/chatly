"use client";

import { SettingsEmailTemplates } from "./settings-email-templates";
import type {
  BillingPlanKey,
  DashboardBillingSummary,
  DashboardSettingsEmail
} from "@/lib/data";
import { formatDateTime, classNames } from "@/lib/utils";
import { CreditCardIcon } from "./dashboard-ui";
import {
  DASHBOARD_INPUT_CLASS,
  DASHBOARD_PRIMARY_BUTTON_CLASS,
  type DashboardNoticeState
} from "./dashboard-controls";
import { formatMoney, SettingsCard, SettingsSectionHeader } from "./dashboard-settings-shared";

export function SettingsEmailSection({
  title,
  subtitle,
  email,
  profileEmail,
  profileName,
  onUpdateEmail,
  onNotice
}: {
  title: string;
  subtitle: string;
  email: DashboardSettingsEmail;
  profileEmail: string;
  profileName: string;
  onUpdateEmail: <K extends keyof DashboardSettingsEmail>(key: K, value: DashboardSettingsEmail[K]) => void;
  onNotice: (value: DashboardNoticeState) => void;
}) {
  return (
    <div className="space-y-6">
      <SettingsSectionHeader title={title} subtitle={subtitle} />

      <SettingsCard title="Notification email" description="Where we send team notifications.">
        <label className="space-y-1.5">
          <span className="text-sm font-medium text-slate-700">Email address</span>
          <input
            type="email"
            value={email.notificationEmail}
            onChange={(event) => onUpdateEmail("notificationEmail", event.target.value)}
            className={DASHBOARD_INPUT_CLASS}
          />
        </label>
      </SettingsCard>

      <SettingsCard title="Reply-to address" description="Visitors will reply to this address.">
        <label className="space-y-1.5">
          <span className="text-sm font-medium text-slate-700">Reply-to email</span>
          <input
            type="email"
            value={email.replyToEmail}
            onChange={(event) => onUpdateEmail("replyToEmail", event.target.value)}
            className={DASHBOARD_INPUT_CLASS}
          />
        </label>
      </SettingsCard>

      <SettingsEmailTemplates
        templates={email.templates}
        notificationEmail={email.notificationEmail}
        replyToEmail={email.replyToEmail}
        profileEmail={profileEmail}
        profileName={profileName}
        onChange={(templates) => onUpdateEmail("templates", templates)}
        onNotice={onNotice}
      />

      <SettingsCard title="Email signature">
        <div className="overflow-hidden rounded-lg border border-slate-200">
          <div className="flex items-center gap-1 border-b border-slate-200 bg-slate-50 px-3 py-2">
            {["B", "I", "Link", "Image"].map((item) => (
              <span key={item} className="rounded-md px-2 py-1 text-xs font-medium text-slate-500">
                {item}
              </span>
            ))}
          </div>
          <textarea
            value={email.emailSignature}
            onChange={(event) => onUpdateEmail("emailSignature", event.target.value)}
            className="min-h-[140px] w-full resize-y border-0 px-3.5 py-3 text-sm leading-6 text-slate-900 placeholder:text-slate-400 focus:border-0"
            placeholder="Best,&#10;The Chatting team"
          />
        </div>
      </SettingsCard>
    </div>
  );
}

export function SettingsBillingSection({
  title,
  subtitle,
  billing,
  billingPlanPending,
  billingPortalPending,
  billingSyncPending,
  onOpenBillingPortal,
  onChangePlan,
  onSyncBilling
}: {
  title: string;
  subtitle: string;
  billing: DashboardBillingSummary;
  billingPlanPending: BillingPlanKey | null;
  billingPortalPending: boolean;
  billingSyncPending: boolean;
  onOpenBillingPortal: () => void;
  onChangePlan: (planKey: BillingPlanKey) => void;
  onSyncBilling: () => void;
}) {
  const usagePercent = billing.seatLimit
    ? Math.max(8, Math.min(100, (billing.usedSeats / billing.seatLimit) * 100))
    : 100;

  return (
    <div className="space-y-6">
      <SettingsSectionHeader title={title} subtitle={subtitle} />

      <section className="rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 p-6 text-white">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xl font-semibold">{billing.planName}</p>
            <p className="mt-1 text-sm text-white/80">{billing.priceLabel}</p>
          </div>
          <span className="inline-flex h-10 items-center rounded-lg border border-white/20 px-4 text-sm font-medium text-white/80">
            Current plan
          </span>
        </div>

        <div className="mt-6">
          <div className="h-1.5 rounded-full bg-white/25">
            <div className="h-full rounded-full bg-white" style={{ width: `${usagePercent}%` }} />
          </div>
          <p className="mt-3 text-sm text-white/80">
            {billing.seatLimit
              ? `${billing.usedSeats} of ${billing.seatLimit} team members used`
              : `${billing.usedSeats} team member${billing.usedSeats === 1 ? "" : "s"} on unlimited seats`}
          </p>
          <p className="mt-3 text-sm text-white/80">
            {billing.nextBillingDate
              ? `Next billing: ${billing.nextBillingDate}`
              : billing.planKey === "starter"
                ? "Free plan with no upcoming invoice"
                : "No upcoming invoice scheduled yet"}
          </p>
          <p className="mt-3 text-sm text-white/80">
            {billing.subscriptionStatus
              ? `Stripe subscription status: ${billing.subscriptionStatus.replace(/_/g, " ")}`
              : billing.checkoutAvailable
                ? "Stripe powers checkout, billing, and invoices for paid plans."
                : "Stripe is not configured yet for this environment."}
          </p>
        </div>
      </section>

      <SettingsCard title="Compare plans">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-[10px] border-2 border-blue-600 bg-blue-50 p-5">
            <p className="text-base font-semibold text-slate-900">Starter</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              $0<span className="text-sm font-normal text-slate-500">/month</span>
            </p>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              <li>1 inbox owner</li>
              <li>Up to 5 seats reserved</li>
              <li>Basic live chat analytics</li>
            </ul>
            {billing.planKey === "starter" ? (
              <div className="mt-5 rounded-lg border border-blue-200 bg-white px-4 py-2 text-center text-sm font-medium text-blue-600">
                Current plan
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenBillingPortal}
                disabled={Boolean(billingPlanPending) || billingPortalPending}
                className="mt-5 w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
              >
                {billingPortalPending ? "Opening..." : "Manage downgrade in Stripe"}
              </button>
            )}
          </div>

          <div className="rounded-[10px] border border-slate-200 p-5">
            <p className="text-base font-semibold text-slate-900">Pro</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              $79<span className="text-sm font-normal text-slate-500">/month</span>
            </p>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              <li>Unlimited teammates</li>
              <li>Advanced routing and analytics</li>
              <li>Priority support</li>
            </ul>
            {billing.planKey === "pro" ? (
              <div className="mt-5 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-center text-sm font-medium text-blue-700">
                Current plan
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onChangePlan("pro")}
                disabled={Boolean(billingPlanPending)}
                className={classNames(DASHBOARD_PRIMARY_BUTTON_CLASS, "mt-5 w-full")}
              >
                {billingPlanPending === "pro" ? "Processing..." : "Upgrade to Pro"}
              </button>
            )}
          </div>
        </div>
      </SettingsCard>

      <SettingsCard
        title="Payment method"
        actions={
          <button
            type="button"
            onClick={onOpenBillingPortal}
            disabled={billingPortalPending || !billing.checkoutAvailable}
            className="text-sm font-medium text-blue-600 transition hover:text-blue-700 disabled:opacity-50"
          >
            {billingPortalPending ? "Opening..." : billing.paymentMethod ? "Manage in Stripe" : "Add in Stripe"}
          </button>
        }
      >
        <div className="flex items-center gap-4 rounded-lg bg-slate-50 px-4 py-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm">
            <CreditCardIcon className="h-5 w-5" />
          </span>
          <div>
            {billing.paymentMethod ? (
              <>
                <p className="text-sm text-slate-700">
                  {billing.paymentMethod.brand} ending in {billing.paymentMethod.last4}
                </p>
                <p className="mt-1 text-[13px] text-slate-500">
                  Expires {String(billing.paymentMethod.expMonth).padStart(2, "0")}/
                  {String(billing.paymentMethod.expYear).slice(-2)}
                  {" · "}
                  {billing.paymentMethod.holderName}
                </p>
              </>
            ) : (
              <>
                <p className="text-sm text-slate-700">No payment method on file</p>
                <p className="mt-1 text-[13px] text-slate-500">
                  Add or update cards in the Stripe billing portal before upgrading this workspace to Pro.
                </p>
              </>
            )}
          </div>
        </div>
      </SettingsCard>

      <SettingsCard
        title="Billing history"
        actions={
          <button
            type="button"
            onClick={onSyncBilling}
            disabled={billingSyncPending || !billing.checkoutAvailable}
            className="text-sm font-medium text-blue-600 transition hover:text-blue-700 disabled:opacity-50"
          >
            {billingSyncPending ? "Refreshing..." : "Refresh from Stripe"}
          </button>
        }
      >
        {billing.invoices.length ? (
          <div className="overflow-hidden rounded-lg border border-slate-200">
            {billing.invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex flex-col gap-3 border-b border-slate-100 px-4 py-4 text-sm last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-slate-900">{invoice.description}</p>
                  <p className="mt-1 text-[13px] text-slate-500">
                    {formatDateTime(invoice.issuedAt)} · {invoice.planKey === "pro" ? "Pro" : "Starter"}
                  </p>
                </div>
                <div className="flex items-center gap-3 sm:justify-end">
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                    {invoice.status === "paid" ? "Paid" : "Open"}
                  </span>
                  <span className="text-sm font-medium text-slate-900">
                    {formatMoney(invoice.amountCents, invoice.currency)}
                  </span>
                  {invoice.hostedInvoiceUrl || invoice.invoicePdfUrl ? (
                    <a
                      href={invoice.hostedInvoiceUrl || invoice.invoicePdfUrl || "#"}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-medium text-blue-600 transition hover:text-blue-700"
                    >
                      View
                    </a>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
            No invoices yet. Charges will appear here after your first paid billing event.
          </div>
        )}
      </SettingsCard>
    </div>
  );
}
