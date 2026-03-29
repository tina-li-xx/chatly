import {
  CHATLY_ANNUAL_SAVINGS_LABEL,
  CHATLY_GROWTH_INCLUDED_MEMBERS,
  CHATLY_VISIBLE_PRICING_PLAN_ORDER,
  formatChatlyGrowthPriceLabel,
  formatChatlyGrowthTotalLabel,
  getChatlyGrowthDisplayPrice,
  getChatlyGrowthOverflowPriceCents,
  getChatlyGrowthTotalCents,
  getLegacyProDisplayPrice,
  getLegacyProSeatPriceCents,
  type ChatlyPricingInterval
} from "@/lib/pricing";

export type BillingPlanKey = "starter" | "growth" | "pro";
export type BillingInterval = ChatlyPricingInterval;

export type BillingPlanFeatures = {
  billedPerSeat: boolean;
  proactiveChat: boolean;
  removeBranding: boolean;
  trialExtensions: boolean;
};

type BillingPlanDefinition = {
  name: string;
  dashboardName: string;
  subtitle: string;
  featured: boolean;
  seatLimit: number | null;
  savingsLabel: string | null;
  trialDays: number;
  features: BillingPlanFeatures;
  marketingFeatures: string[];
};

export const BILLING_TRIAL_DAYS = 14;
export const BILLING_TRIAL_EXTENSION_DAYS = 7;
export const BILLING_PLAN_ORDER: BillingPlanKey[] = [...CHATLY_VISIBLE_PRICING_PLAN_ORDER];
export const BILLING_INTERVAL_ORDER: BillingInterval[] = ["monthly", "annual"];

const PLAN_DEFINITIONS: Record<BillingPlanKey, BillingPlanDefinition> = {
  starter: {
    name: "Starter",
    dashboardName: "Starter Plan",
    subtitle: "For solo founders testing the waters",
    featured: false,
    seatLimit: 5,
    savingsLabel: null,
    trialDays: 0,
    features: { billedPerSeat: false, proactiveChat: false, removeBranding: false, trialExtensions: false },
    marketingFeatures: [
      "50 conversations each month",
      "Up to 5 reserved seats",
      "Basic analytics",
      "Widget customization",
      "Email notifications",
      "Chatly branding"
    ]
  },
  growth: {
    name: "Growth",
    dashboardName: "Growth Plan",
    subtitle: "For teams ready to turn high-intent traffic into conversations",
    featured: true,
    seatLimit: null,
    savingsLabel: CHATLY_ANNUAL_SAVINGS_LABEL,
    trialDays: BILLING_TRIAL_DAYS,
    features: { billedPerSeat: true, proactiveChat: true, removeBranding: true, trialExtensions: true },
    marketingFeatures: [
      "Unlimited conversations",
      `Includes ${CHATLY_GROWTH_INCLUDED_MEMBERS} members, then $10/member after 5`,
      "Visitor tracking and proactive chat",
      "Full analytics suite",
      "No Chatly branding",
      "14-day free trial"
    ]
  },
  pro: {
    name: "Pro",
    dashboardName: "Pro Plan",
    subtitle: "For teams that want premium reporting, routing, and hands-on support",
    featured: false,
    seatLimit: null,
    savingsLabel: CHATLY_ANNUAL_SAVINGS_LABEL,
    trialDays: BILLING_TRIAL_DAYS,
    features: { billedPerSeat: true, proactiveChat: true, removeBranding: true, trialExtensions: true },
    marketingFeatures: [
      "Everything in Growth",
      "Advanced reporting",
      "API access",
      "Priority onboarding help",
      "Priority support",
      "14-day free trial"
    ]
  }
};

export function normalizeBillingPlanKey(value: string | null | undefined): BillingPlanKey {
  return value === "growth" || value === "pro" ? value : "starter";
}

export function normalizeBillingInterval(value: unknown): BillingInterval {
  return value === "annual" ? "annual" : "monthly";
}

export function isPaidPlan(planKey: BillingPlanKey): planKey is Exclude<BillingPlanKey, "starter"> {
  return planKey !== "starter";
}

export function getBillingPlanDefinition(planKey: BillingPlanKey) {
  return PLAN_DEFINITIONS[planKey];
}

export function getBillingPlanFeatures(planKey: BillingPlanKey) {
  return PLAN_DEFINITIONS[planKey].features;
}

export function getBillingSeatPriceCents(planKey: BillingPlanKey, interval: BillingInterval) {
  if (planKey === "growth") {
    return getChatlyGrowthOverflowPriceCents(interval);
  }

  if (planKey === "pro") {
    return getLegacyProSeatPriceCents(interval);
  }

  return null;
}

export function getBillingTotalCents(planKey: BillingPlanKey, interval: BillingInterval, seatCount: number) {
  if (planKey === "growth") {
    return getChatlyGrowthTotalCents(interval, seatCount);
  }

  if (planKey === "pro") {
    const safeSeatCount = Math.max(1, Math.floor(seatCount || 1));
    return safeSeatCount * getLegacyProSeatPriceCents(interval);
  }

  return 0;
}

export function formatBillingPriceLabel(planKey: BillingPlanKey, interval: BillingInterval | null) {
  if (!isPaidPlan(planKey)) {
    return "$0/month";
  }

  const resolvedInterval = interval ?? "monthly";
  return planKey === "growth"
    ? formatChatlyGrowthPriceLabel(resolvedInterval)
    : resolvedInterval === "annual"
      ? "$400/seat/year"
      : "$40/seat/month";
}

export function getBillingDisplayPrice(planKey: BillingPlanKey, interval: BillingInterval) {
  if (!isPaidPlan(planKey)) {
    return { amount: "$0", cadence: "/month", note: null };
  }

  return planKey === "growth" ? getChatlyGrowthDisplayPrice(interval) : getLegacyProDisplayPrice(interval);
}

export function formatSeatTotalLabel(planKey: BillingPlanKey, interval: BillingInterval, seatCount: number) {
  if (!isPaidPlan(planKey)) {
    return "Free";
  }

  if (planKey === "growth") {
    return formatChatlyGrowthTotalLabel(interval, seatCount);
  }

  const safeSeatCount = Math.max(1, Math.floor(seatCount || 1));
  const cadence = interval === "annual" ? "/year" : "/month";
  return `${safeSeatCount} seat${safeSeatCount === 1 ? "" : "s"} - $${Math.round(getBillingTotalCents(planKey, interval, safeSeatCount) / 100)}${cadence}`;
}

export function shouldShowWidgetBranding(planKey: BillingPlanKey) {
  return !getBillingPlanFeatures(planKey).removeBranding;
}

export function shouldShowTranscriptBranding(planKey: BillingPlanKey | null) {
  return shouldShowWidgetBranding(planKey ? normalizeBillingPlanKey(planKey) : "starter");
}
