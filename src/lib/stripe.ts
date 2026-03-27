import Stripe from "stripe";
import { getPublicAppUrl } from "@/lib/env";
import { getOptionalServerEnv, getRequiredServerEnv } from "@/lib/env.server";

let stripeClient: Stripe | null = null;

function hasRequiredStripeValue(name: string) {
  return Boolean(getOptionalServerEnv(name));
}

export function isStripeConfigured() {
  return Boolean(
    hasRequiredStripeValue("STRIPE_SECRET_KEY") &&
      hasRequiredStripeValue("STRIPE_PRICE_PRO_MONTHLY") &&
      hasRequiredStripeValue("NEXT_PUBLIC_APP_URL")
  );
}

export function isStripeBillingReady() {
  return Boolean(isStripeConfigured() && hasRequiredStripeValue("STRIPE_WEBHOOK_SECRET"));
}

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

export function getStripeProPriceId() {
  return getRequiredServerEnv("STRIPE_PRICE_PRO_MONTHLY", { errorCode: "STRIPE_NOT_CONFIGURED" });
}

export function getStripeAppUrl() {
  return getPublicAppUrl().replace(/\/+$/, "");
}
