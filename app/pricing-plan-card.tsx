import type { ReactNode } from "react";
import {
  getBillingDisplayPrice,
  getBillingPlanDefinition,
  type BillingInterval,
  type BillingPlanKey
} from "@/lib/billing-plans";
import { classNames } from "@/lib/utils";
import { CheckIcon } from "./dashboard/dashboard-ui";

export type PricingFeatureItem = string | { label: string; note?: string };

function normalizeFeatures(items: PricingFeatureItem[]) {
  return items.map((item) => (typeof item === "string" ? { label: item } : item));
}

export function PricingPlanCard({
  action,
  className,
  displayPriceOverride,
  featureItems,
  featuredLabel,
  interval,
  planKey,
  priceNote,
  priceNotePlacement = "top",
  summaryLabel
}: {
  action: ReactNode;
  className?: string;
  displayPriceOverride?: ReturnType<typeof getBillingDisplayPrice> | null;
  featureItems?: PricingFeatureItem[];
  featuredLabel?: string | null;
  interval: BillingInterval;
  planKey: BillingPlanKey;
  priceNote?: string | null;
  priceNotePlacement?: "top" | "feature" | "hidden";
  summaryLabel?: string | null;
}) {
  const plan = getBillingPlanDefinition(planKey);
  const displayPrice = displayPriceOverride ?? getBillingDisplayPrice(planKey, interval);
  const resolvedPriceNote = priceNote ?? displayPrice.note;
  const tone = plan.featured ? "bg-blue-50 text-blue-600" : "bg-slate-100 text-slate-500";
  const badge = featuredLabel ?? (plan.featured ? "Recommended" : null);
  const features = normalizeFeatures(featureItems ?? plan.marketingFeatures);
  const featureRows =
    priceNotePlacement === "feature" && resolvedPriceNote && features[1]
      ? features.map((item, index) => (index === 1 ? { ...item, note: item.note ?? resolvedPriceNote } : item))
      : features;

  return (
    <article
      className={classNames(
        "relative flex h-full flex-col rounded-[20px] border bg-white p-8",
        plan.featured
          ? "border-2 border-blue-600 shadow-[0_4px_20px_rgba(37,99,235,0.12)]"
          : "border-slate-200",
        className
      )}
    >
      {badge ? (
        <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600 px-4 py-1.5 text-[12px] font-semibold uppercase tracking-[0.05em] text-white">
          {badge}
        </div>
      ) : null}

      <p className={classNames("text-sm font-semibold uppercase tracking-[0.08em] text-slate-500", badge ? "mt-3" : "")}>
        {plan.name}
      </p>
      <div className="mt-3 flex items-end gap-1">
        <span className="display-font text-5xl leading-none text-slate-900">{displayPrice.amount}</span>
        {displayPrice.cadence ? <span className="pb-1 text-base text-slate-500">{displayPrice.cadence}</span> : null}
      </div>
      {summaryLabel ? <p className="mt-3 text-[15px] text-slate-500">{summaryLabel}</p> : null}
      {resolvedPriceNote && priceNotePlacement === "top" ? (
        <p className="mt-3 text-sm text-slate-500">{resolvedPriceNote}</p>
      ) : null}

      <ul className="mt-8 space-y-4">
        {featureRows.map((feature) => (
          <li key={feature.label} className="text-[15px] leading-6 text-slate-600">
            <div className="flex items-start gap-3">
              <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${tone}`}>
                <CheckIcon className="h-3 w-3" />
              </span>
              <span>{feature.label}</span>
            </div>
            {feature.note ? <p className="pl-8 pt-1 text-sm text-slate-500">{feature.note}</p> : null}
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-8">{action}</div>
    </article>
  );
}
