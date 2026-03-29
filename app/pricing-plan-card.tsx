import type { ReactNode } from "react";
import {
  getBillingDisplayPrice,
  getBillingPlanDefinition,
  type BillingInterval,
  type BillingPlanKey
} from "@/lib/billing-plans";
import { classNames } from "@/lib/utils";
import { CheckIcon } from "./dashboard/dashboard-ui";

export function PricingPlanCard({
  planKey,
  interval,
  featuredLabel,
  summaryLabel,
  priceNote,
  footerLabel,
  action
}: {
  planKey: BillingPlanKey;
  interval: BillingInterval;
  featuredLabel?: string | null;
  summaryLabel?: string | null;
  priceNote?: string | null;
  footerLabel?: string | null;
  action: ReactNode;
}) {
  const plan = getBillingPlanDefinition(planKey);
  const displayPrice = getBillingDisplayPrice(planKey, interval);
  const resolvedPriceNote = priceNote ?? displayPrice.note;

  return (
    <article
      className={classNames(
        "relative flex min-h-[38rem] flex-col rounded-[28px] border bg-white p-10",
        plan.featured
          ? "border-2 border-blue-600 shadow-[0_18px_48px_rgba(37,99,235,0.08)]"
          : "border-slate-200"
      )}
    >
      {featuredLabel ? (
        <div className="absolute left-1/2 top-0 inline-flex -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
          {featuredLabel}
        </div>
      ) : null}
      <h3 className="text-[2rem] font-semibold tracking-tight text-slate-900">{plan.name}</h3>
      <p className="mt-4 text-[15px] leading-7 text-slate-500">{plan.subtitle}</p>
      <div className="mt-12 flex flex-wrap items-end gap-x-3 gap-y-2">
        <span className="display-font text-5xl leading-none text-slate-900 lg:text-6xl">
          {displayPrice.amount}
        </span>
        <span className="text-[15px] font-medium text-slate-500 lg:pb-2">{displayPrice.cadence}</span>
      </div>
      {summaryLabel ? <p className="mt-4 text-sm text-slate-500">{summaryLabel}</p> : null}
      {resolvedPriceNote ? (
        <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          {resolvedPriceNote}
        </p>
      ) : null}
      <ul className="mt-10 border-t border-slate-100">
        {plan.marketingFeatures.map((feature) => (
          <li
            key={feature}
            className="flex items-center gap-3 border-b border-slate-100 py-5 text-[15px] text-slate-700"
          >
            <CheckIcon className="h-4 w-4 shrink-0 text-emerald-500" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <div className="mt-auto pt-8">
        {footerLabel ? <p className="text-sm text-slate-500">{footerLabel}</p> : null}
        <div className={classNames(footerLabel ? "mt-4" : null)}>{action}</div>
      </div>
    </article>
  );
}
