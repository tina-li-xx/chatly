import "server-only";

import { getRuntimeEnvironment, type RuntimeEnvironment } from "@/lib/env";
import { getMissingEnvVarsForGroup } from "@/lib/env-server/groups";
import { type ServerEnvSource } from "@/lib/env-server/core";
import { buildStripeEnvSource } from "@/lib/env-server/stripe";

let validatedStartupCoreEnvironment = false;
let validatedR2Environment: RuntimeEnvironment | null = null;
let validatedStripeBillingEnvironment: RuntimeEnvironment | null = null;
type StripeEnvValidationGroup = "stripe-checkout" | "stripe-billing";

function getMissingStripeEnvVars(
  group: StripeEnvValidationGroup,
  params?: {
    environment?: RuntimeEnvironment;
    source?: ServerEnvSource;
  }
) {
  const environment = params?.environment || getRuntimeEnvironment();
  const source = buildStripeEnvSource(params?.source || process.env, environment);

  return getMissingEnvVarsForGroup(group, source);
}

export function getMissingStartupProductionCoreEnvVars(params?: {
  environment?: RuntimeEnvironment;
  source?: ServerEnvSource;
}) {
  const environment = params?.environment || getRuntimeEnvironment();

  if (environment !== "production") {
    return [] as string[];
  }

  return getMissingEnvVarsForGroup("startup-production-core", params?.source || process.env);
}

export function getMissingStripeCheckoutEnvVars(params?: {
  environment?: RuntimeEnvironment;
  source?: ServerEnvSource;
}) {
  return getMissingStripeEnvVars("stripe-checkout", params);
}

export function getMissingStripeBillingEnvVars(params?: {
  environment?: RuntimeEnvironment;
  source?: ServerEnvSource;
}) {
  return getMissingStripeEnvVars("stripe-billing", params);
}

export function getMissingR2EnvVars(params?: {
  source?: ServerEnvSource;
}) {
  return getMissingEnvVarsForGroup("r2", params?.source || process.env);
}

export function isStripeConfigured(
  source: ServerEnvSource = process.env,
  environment: RuntimeEnvironment = getRuntimeEnvironment()
) {
  return getMissingStripeCheckoutEnvVars({ source, environment }).length === 0;
}

export function isStripeBillingReady(
  source: ServerEnvSource = process.env,
  environment: RuntimeEnvironment = getRuntimeEnvironment()
) {
  return getMissingStripeBillingEnvVars({ source, environment }).length === 0;
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
    environment,
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
