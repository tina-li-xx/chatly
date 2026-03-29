import Stripe from "stripe";
import {
  type BillingInterval,
  type BillingPlanKey,
  isPaidPlan
} from "@/lib/billing-plans";
import { getPublicAppUrl } from "@/lib/env";
import { getRequiredServerEnv } from "@/lib/env.server";

let stripeClient: Stripe | null = null;

export { isStripeBillingReady, isStripeConfigured } from "@/lib/env.server";

export function getStripe() {
  if (stripeClient) {
    return stripeClient;
  }

  stripeClient = new Stripe(
    getRequiredServerEnv("STRIPE_SECRET_KEY", { errorCode: "STRIPE_NOT_CONFIGURED" })
  );
  return stripeClient;
}

export function getStripeWebhookSecret() {
  return getRequiredServerEnv("STRIPE_WEBHOOK_SECRET", { errorCode: "STRIPE_NOT_CONFIGURED" });
}

export function getStripePriceId(planKey: BillingPlanKey, interval: BillingInterval) {
  if (!isPaidPlan(planKey)) {
    throw new Error("STRIPE_CHECKOUT_UNAVAILABLE");
  }

  const envName =
    planKey === "growth"
      ? interval === "annual"
        ? "STRIPE_PRICE_GROWTH_ANNUAL"
        : "STRIPE_PRICE_GROWTH_MONTHLY"
      : interval === "annual"
        ? "STRIPE_PRICE_PRO_ANNUAL"
        : "STRIPE_PRICE_PRO_MONTHLY";

  return getRequiredServerEnv(envName, { errorCode: "STRIPE_NOT_CONFIGURED" });
}

export function getStripeAppUrl() {
  return getPublicAppUrl().replace(/\/+$/, "");
}
