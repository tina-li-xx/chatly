import "server-only";

import { type AppEnvValidationGroup } from "@/lib/env-config";
import { getRuntimeEnvironment, type RuntimeEnvironment } from "@/lib/env";
import { getMissingEnvVarsForGroup } from "@/lib/env-server/groups";
import { type ServerEnvSource } from "@/lib/env-server/core";
import { buildStripeEnvSource } from "@/lib/env-server/stripe";

const validationState = {
  applePush: null as RuntimeEnvironment | null,
  startup: null as RuntimeEnvironment | null,
  integrations: null as RuntimeEnvironment | null,
  redisLive: null as RuntimeEnvironment | null,
  r2: null as RuntimeEnvironment | null,
  stripeBilling: null as RuntimeEnvironment | null
};

type EnvValidationParams = {
  environment?: RuntimeEnvironment;
  source?: ServerEnvSource;
};

type CachedEnvValidationParams = EnvValidationParams & {
  cache?: boolean;
};

type StripeEnvValidationGroup = "stripe-checkout" | "stripe-billing";

function getMissingProductionEnvVars(group: AppEnvValidationGroup, params?: EnvValidationParams) {
  const environment = params?.environment || getRuntimeEnvironment();
  if (environment !== "production") {
    return [] as string[];
  }

  return getMissingEnvVarsForGroup(group, params?.source || process.env);
}

function getMissingStripeEnvVars(group: StripeEnvValidationGroup, params?: EnvValidationParams) {
  const environment = params?.environment || getRuntimeEnvironment();
  const source = buildStripeEnvSource(params?.source || process.env, environment);
  return getMissingEnvVarsForGroup(group, source);
}

function assertCachedEnv(
  cacheKey: keyof typeof validationState,
  messagePrefix: string,
  getMissing: (params?: EnvValidationParams) => string[],
  params?: CachedEnvValidationParams,
  options?: {
    productionOnly?: boolean;
  }
) {
  const environment = params?.environment || getRuntimeEnvironment();
  if (options?.productionOnly && environment !== "production") {
    return;
  }

  const useCache = params?.cache !== false && !params?.source;
  if (useCache && validationState[cacheKey] === environment) {
    return;
  }

  const missing = getMissing({
    environment,
    source: params?.source
  });

  if (missing.length > 0) {
    throw new Error(`${messagePrefix}${missing.join(", ")}`);
  }

  if (useCache) {
    validationState[cacheKey] = environment;
  }
}

export function getMissingStartupProductionCoreEnvVars(params?: EnvValidationParams) {
  return getMissingProductionEnvVars("startup-production-core", params);
}

export function getMissingApplePushEnvVars(params?: EnvValidationParams) {
  return getMissingEnvVarsForGroup("apple-push", params?.source || process.env);
}

export function getMissingStripeCheckoutEnvVars(params?: EnvValidationParams) {
  return getMissingStripeEnvVars("stripe-checkout", params);
}

export function getMissingStripeBillingEnvVars(params?: EnvValidationParams) {
  return getMissingStripeEnvVars("stripe-billing", params);
}

export function getMissingIntegrationsEnvVars(params?: EnvValidationParams) {
  return getMissingProductionEnvVars("integrations", params);
}

export function getMissingRedisLiveEnvVars(params?: EnvValidationParams) {
  return getMissingEnvVarsForGroup("redis-live", params?.source || process.env);
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

export function isApplePushConfigured(
  source: ServerEnvSource = process.env,
  environment: RuntimeEnvironment = getRuntimeEnvironment()
) {
  return getMissingApplePushEnvVars({ source, environment }).length === 0;
}

export function isStripeBillingReady(
  source: ServerEnvSource = process.env,
  environment: RuntimeEnvironment = getRuntimeEnvironment()
) {
  return getMissingStripeBillingEnvVars({ source, environment }).length === 0;
}

export function assertStartupProductionCoreEnvConfigured(params?: CachedEnvValidationParams) {
  assertCachedEnv(
    "startup",
    "[StartupEnvConfig] Missing required production env vars: ",
    getMissingStartupProductionCoreEnvVars,
    params,
    { productionOnly: true }
  );
}

export function assertApplePushEnvConfigured(params?: CachedEnvValidationParams) {
  assertCachedEnv(
    "applePush",
    "[ApplePushConfig] Missing required Apple push env vars: ",
    getMissingApplePushEnvVars,
    params
  );
}

export function assertStripeBillingEnvConfigured(params?: CachedEnvValidationParams) {
  assertCachedEnv(
    "stripeBilling",
    "[StripeBillingConfig] Missing required Stripe billing env vars: ",
    getMissingStripeBillingEnvVars,
    params
  );
}

export function assertIntegrationsEnvConfigured(params?: CachedEnvValidationParams) {
  assertCachedEnv(
    "integrations",
    "[IntegrationsConfig] Missing required integrations env vars: ",
    getMissingIntegrationsEnvVars,
    params,
    { productionOnly: true }
  );
}

export function assertRedisLiveEnvConfigured(params?: CachedEnvValidationParams) {
  assertCachedEnv(
    "redisLive",
    "[RedisLiveConfig] Missing required Redis live env vars: ",
    getMissingRedisLiveEnvVars,
    params
  );
}

export function assertR2EnvConfigured(params?: CachedEnvValidationParams) {
  assertCachedEnv("r2", "[R2Config] Missing required R2 env vars: ", getMissingR2EnvVars, params, {
    productionOnly: true
  });
}
