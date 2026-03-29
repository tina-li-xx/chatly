import "server-only";

import { getRuntimeEnvironment, type RuntimeEnvironment } from "@/lib/env";
import {
  getMissingRequiredEnvVars,
  type ServerEnvSource
} from "@/lib/env-server/core";

const STARTUP_PRODUCTION_CORE_ENV_VARS = [
  "DATABASE_URL",
  "AUTH_SECRET",
  "NEXT_PUBLIC_APP_URL"
] as const;

const R2_ENV_VARS = [
  "R2_ACCOUNT_ID",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_BUCKET_NAME",
  "R2_PUBLIC_BASE_URL"
] as const;

const STRIPE_CHECKOUT_ENV_VARS = [
  "STRIPE_SECRET_KEY",
  "STRIPE_PRICE_GROWTH_MONTHLY",
  "STRIPE_PRICE_GROWTH_ANNUAL",
  "STRIPE_PRICE_PRO_MONTHLY",
  "STRIPE_PRICE_PRO_ANNUAL",
  "NEXT_PUBLIC_APP_URL"
] as const;

const STRIPE_BILLING_ENV_VARS = [
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "STRIPE_PRICE_GROWTH_MONTHLY",
  "STRIPE_PRICE_GROWTH_ANNUAL",
  "STRIPE_PRICE_PRO_MONTHLY",
  "STRIPE_PRICE_PRO_ANNUAL",
  "NEXT_PUBLIC_APP_URL"
] as const;

let validatedStartupCoreEnvironment = false;
let validatedR2Environment: RuntimeEnvironment | null = null;
let validatedStripeBillingEnvironment: RuntimeEnvironment | null = null;

export function getMissingStartupProductionCoreEnvVars(params?: {
  environment?: RuntimeEnvironment;
  source?: ServerEnvSource;
}) {
  const environment = params?.environment || getRuntimeEnvironment();

  if (environment !== "production") {
    return [] as string[];
  }

  return getMissingRequiredEnvVars(
    STARTUP_PRODUCTION_CORE_ENV_VARS,
    params?.source || process.env
  );
}

export function getMissingStripeCheckoutEnvVars(params?: {
  source?: ServerEnvSource;
}) {
  return getMissingRequiredEnvVars(STRIPE_CHECKOUT_ENV_VARS, params?.source || process.env);
}

export function getMissingStripeBillingEnvVars(params?: {
  source?: ServerEnvSource;
}) {
  return getMissingRequiredEnvVars(STRIPE_BILLING_ENV_VARS, params?.source || process.env);
}

export function getMissingR2EnvVars(params?: {
  source?: ServerEnvSource;
}) {
  return getMissingRequiredEnvVars(R2_ENV_VARS, params?.source || process.env);
}

export function isStripeConfigured(source: ServerEnvSource = process.env) {
  return getMissingStripeCheckoutEnvVars({ source }).length === 0;
}

export function isStripeBillingReady(source: ServerEnvSource = process.env) {
  return getMissingStripeBillingEnvVars({ source }).length === 0;
}

export function assertStartupProductionCoreEnvConfigured(params?: {
  environment?: RuntimeEnvironment;
  source?: ServerEnvSource;
  cache?: boolean;
}) {
  const environment = params?.environment || getRuntimeEnvironment();

  if (environment !== "production") {
    return;
  }

  const useCache = params?.cache !== false && !params?.source;
  if (useCache && validatedStartupCoreEnvironment) {
    return;
  }

  const missing = getMissingStartupProductionCoreEnvVars({
    environment,
    source: params?.source
  });

  if (missing.length > 0) {
    throw new Error(
      `[StartupEnvConfig] Missing required production env vars: ${missing.join(", ")}`
    );
  }

  if (useCache) {
    validatedStartupCoreEnvironment = true;
  }
}

export function assertStripeBillingEnvConfigured(params?: {
  environment?: RuntimeEnvironment;
  source?: ServerEnvSource;
  cache?: boolean;
}) {
  const environment = params?.environment || getRuntimeEnvironment();
  const useCache = params?.cache !== false && !params?.source;

  if (useCache && validatedStripeBillingEnvironment === environment) {
    return;
  }

  const missing = getMissingStripeBillingEnvVars({
    source: params?.source
  });

  if (missing.length > 0) {
    throw new Error(
      `[StripeBillingConfig] Missing required Stripe billing env vars: ${missing.join(", ")}`
    );
  }

  if (useCache) {
    validatedStripeBillingEnvironment = environment;
  }
}

export function assertR2EnvConfigured(params?: {
  environment?: RuntimeEnvironment;
  source?: ServerEnvSource;
  cache?: boolean;
}) {
  const environment = params?.environment || getRuntimeEnvironment();

  if (environment !== "production") {
    return;
  }

  const useCache = params?.cache !== false && !params?.source;
  if (useCache && validatedR2Environment === environment) {
    return;
  }

  const missing = getMissingR2EnvVars({
    source: params?.source
  });

  if (missing.length > 0) {
    throw new Error(`[R2Config] Missing required R2 env vars: ${missing.join(", ")}`);
  }

  if (useCache) {
    validatedR2Environment = environment;
  }
}
