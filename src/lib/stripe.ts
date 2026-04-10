import Stripe from "stripe";
import {
  type BillingInterval,
  type BillingPlanKey,
  isPaidPlan
} from "@/lib/billing-plans";
import { getPublicAppUrl } from "@/lib/env";
import { getRequiredStripeServerEnv } from "@/lib/env.server";
import {
  getGrowthStripePriceTiers,
  type ChattingGrowthStripePriceTier
} from "@/lib/pricing-model";

let stripeClient: Stripe | null = null;
const validatedStripePriceIds = new Set<string>();
const STRIPE_GROWTH_PRICE_ENV_NAMES = {
  monthly: "STRIPE_PRICE_GROWTH_MONTHLY",
  annual: "STRIPE_PRICE_GROWTH_ANNUAL"
} as const;

export { isStripeBillingReady, isStripeConfigured } from "@/lib/env.server";

export function getStripe() {
  if (stripeClient) {
    return stripeClient;
  }

  stripeClient = new Stripe(
    getRequiredStripeServerEnv("STRIPE_SECRET_KEY", { errorCode: "STRIPE_NOT_CONFIGURED" })
  );
  return stripeClient;
}

export function getStripeWebhookSecret() {
  return getRequiredStripeServerEnv("STRIPE_WEBHOOK_SECRET", { errorCode: "STRIPE_NOT_CONFIGURED" });
}

export function getStripePriceId(planKey: BillingPlanKey, interval: BillingInterval) {
  if (!isPaidPlan(planKey)) {
    throw new Error("STRIPE_CHECKOUT_UNAVAILABLE");
  }

  return getRequiredStripeServerEnv(STRIPE_GROWTH_PRICE_ENV_NAMES[interval], {
    errorCode: "STRIPE_NOT_CONFIGURED"
  });
}

function matchesExpectedTierAmount(actual: number | null, expected: number | null) {
  if (expected === null) {
    return actual === null || actual === 0;
  }

  return actual === expected;
}

function normalizeStripeTierUpTo(value: unknown) {
  return value === "inf" ? "inf" : typeof value === "number" ? value : null;
}

function matchesExpectedGrowthTier(
  actualTier: Stripe.Price.Tier | undefined,
  expectedTier: ChattingGrowthStripePriceTier
) {
  return (
    normalizeStripeTierUpTo(actualTier?.up_to ?? null) === expectedTier.upTo &&
    matchesExpectedTierAmount(actualTier?.flat_amount ?? null, expectedTier.flatAmountCents) &&
    matchesExpectedTierAmount(actualTier?.unit_amount ?? null, expectedTier.unitAmountCents)
  );
}

function matchesExpectedGrowthPrice(price: Stripe.Price, interval: BillingInterval) {
  const expectedTiers = getGrowthStripePriceTiers(interval);
  const tiers = price.tiers ?? [];

  if (
    !price.active ||
    price.currency !== "usd" ||
    price.type !== "recurring" ||
    price.billing_scheme !== "tiered" ||
    price.tiers_mode !== "volume" ||
    price.recurring?.interval !== (interval === "annual" ? "year" : "month") ||
    price.recurring?.interval_count !== 1 ||
    price.recurring?.usage_type !== "licensed" ||
    tiers.length !== expectedTiers.length
  ) {
    return false;
  }

  return expectedTiers.every((expectedTier, index) =>
    matchesExpectedGrowthTier(tiers[index], expectedTier)
  );
}

export async function assertStripeGrowthPriceConfigured(planKey: BillingPlanKey, interval: BillingInterval) {
  if (!isPaidPlan(planKey)) {
    throw new Error("STRIPE_CHECKOUT_UNAVAILABLE");
  }

  const priceId = getStripePriceId(planKey, interval);
  if (validatedStripePriceIds.has(priceId)) {
    return priceId;
  }

  try {
    const price = await getStripe().prices.retrieve(priceId, {
      expand: ["tiers"]
    });
    if (!matchesExpectedGrowthPrice(price, interval)) {
      throw new Error("STRIPE_PRICE_CONFIG_INVALID");
    }
  } catch (error) {
    if (error instanceof Error && error.message === "STRIPE_PRICE_CONFIG_INVALID") {
      throw error;
    }

    throw new Error("STRIPE_PRICE_CONFIG_INVALID");
  }

  validatedStripePriceIds.add(priceId);
  return priceId;
}

export function getStripeAppUrl() {
  return getPublicAppUrl().replace(/\/+$/, "");
}
