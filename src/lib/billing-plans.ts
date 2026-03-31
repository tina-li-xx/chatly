import {
  CHATTING_ANNUAL_SAVINGS_LABEL,
  CHATTING_STARTER_PRICE_LABEL,
  CHATTING_VISIBLE_PRICING_PLAN_ORDER,
  formatChattingGrowthPriceLabel,
  formatChattingGrowthTotalLabel,
  getChattingGrowthDisplayPrice,
  getChattingGrowthTotalCents,
  getChattingStarterDisplayPrice,
  type ChattingPricingInterval
} from "@/lib/pricing";

export type BillingPlanKey = "starter" | "growth";
export type BillingInterval = ChattingPricingInterval;

export type BillingPlanFeatures = {
  billedPerSeat: boolean;
  proactiveChat: boolean;
  removeBranding: boolean;
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
export const BILLING_PLAN_ORDER: BillingPlanKey[] = [...CHATTING_VISIBLE_PRICING_PLAN_ORDER];
export const BILLING_INTERVAL_ORDER: BillingInterval[] = ["monthly", "annual"];

const PLAN_DEFINITIONS: Record<BillingPlanKey, BillingPlanDefinition> = {
  starter: {
    name: "Starter",
    dashboardName: "Starter Plan",
    subtitle: "",
    featured: false,
    seatLimit: 5,
    savingsLabel: null,
    trialDays: 0,
    features: { billedPerSeat: false, proactiveChat: false, removeBranding: false },
    marketingFeatures: [
      "50 conversations each month",
      "Basic analytics",
      "Widget customization",
      "Email notifications",
      "Chatting branding"
    ]
  },
  growth: {
    name: "Growth",
    dashboardName: "Growth Plan",
    subtitle: "",
    featured: true,
    seatLimit: null,
    savingsLabel: CHATTING_ANNUAL_SAVINGS_LABEL,
    trialDays: BILLING_TRIAL_DAYS,
    features: { billedPerSeat: true, proactiveChat: true, removeBranding: true },
    marketingFeatures: [
      "Unlimited conversations",
      "Proactive chat",
      "Visitor tracking",
      "Advanced analytics",
      "API access",
      "Custom branding",
      "White-label widget",
      "14-day free trial"
    ]
  }
};

export function normalizeBillingPlanKey(value: string | null | undefined): BillingPlanKey {
  return value === "growth" ? "growth" : "starter";
}

export function normalizeBillingInterval(value: unknown): BillingInterval {
  return value === "annual" ? "annual" : "monthly";
}

export function isPaidPlan(planKey: BillingPlanKey): planKey is "growth" {
  return planKey === "growth";
}

export function getBillingPlanDefinition(planKey: BillingPlanKey) {
  return PLAN_DEFINITIONS[planKey];
}

export function getBillingPlanFeatures(planKey: BillingPlanKey) {
  return PLAN_DEFINITIONS[planKey].features;
}

export function getBillingTotalCents(planKey: BillingPlanKey, interval: BillingInterval, seatCount: number) {
  if (planKey === "growth") {
    return getChattingGrowthTotalCents(interval, seatCount);
  }

  return 0;
}

export function formatBillingPriceLabel(planKey: BillingPlanKey, interval: BillingInterval | null) {
  if (!isPaidPlan(planKey)) {
    return CHATTING_STARTER_PRICE_LABEL;
  }

  return formatChattingGrowthPriceLabel(interval ?? "monthly");
}

export function getBillingDisplayPrice(planKey: BillingPlanKey, interval: BillingInterval) {
  if (!isPaidPlan(planKey)) {
    return getChattingStarterDisplayPrice();
  }

  return getChattingGrowthDisplayPrice(interval);
}

export function getBillingPreviewDisplayPrice(planKey: BillingPlanKey, interval: BillingInterval, seatCount: number) {
  if (!isPaidPlan(planKey)) {
    return getChattingStarterDisplayPrice();
  }

  const total = getBillingTotalCents(planKey, interval, seatCount);

  return total === null
    ? { amount: "Custom", cadence: "", note: "50+ members" }
    : {
        amount: `$${Math.round(total / 100)}`,
        cadence: interval === "annual" ? "/year" : "/month",
        note: null
      };
}

export function formatSeatTotalLabel(planKey: BillingPlanKey, interval: BillingInterval, seatCount: number) {
  if (!isPaidPlan(planKey)) {
    return "Free";
  }

  return formatChattingGrowthTotalLabel(interval, seatCount);
}

export function shouldShowWidgetBranding(planKey: BillingPlanKey) {
  return !getBillingPlanFeatures(planKey).removeBranding;
}

export function shouldShowTranscriptBranding(planKey: BillingPlanKey | null) {
  return shouldShowWidgetBranding(planKey ? normalizeBillingPlanKey(planKey) : "starter");
}
