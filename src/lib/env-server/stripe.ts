import "server-only";

import { getRuntimeEnvironment, type RuntimeEnvironment } from "@/lib/env";
import { normalizeEnvValue, type EnvSource } from "@/lib/env-core";
import { getOptionalServerEnv, getRequiredServerEnv, type ServerEnvSource } from "@/lib/env-server/core";

const STRIPE_DEVELOPMENT_ENV_ALIASES = {
  STRIPE_SECRET_KEY: "STRIPE_DEV_SECRET_KEY",
  STRIPE_WEBHOOK_SECRET: "STRIPE_DEV_WEBHOOK_SECRET",
  STRIPE_PRICE_GROWTH_MONTHLY: "STRIPE_DEV_PRICE_GROWTH_MONTHLY",
  STRIPE_PRICE_GROWTH_ANNUAL: "STRIPE_DEV_PRICE_GROWTH_ANNUAL"
} as const;
type StripeServerEnvName = keyof typeof STRIPE_DEVELOPMENT_ENV_ALIASES;
const STRIPE_SERVER_ENV_NAMES = Object.keys(STRIPE_DEVELOPMENT_ENV_ALIASES) as StripeServerEnvName[];

function prefersDevelopmentStripeEnv(environment: RuntimeEnvironment) {
  return environment !== "production";
}

function resolveStripeEnvName(name: string, source: EnvSource, environment: RuntimeEnvironment) {
  if (!prefersDevelopmentStripeEnv(environment)) {
    return name;
  }

  const alias = STRIPE_DEVELOPMENT_ENV_ALIASES[name as StripeServerEnvName];
  if (alias && normalizeEnvValue(source[alias])) {
    return alias;
  }
  return name;
}

function readStripeServerEnvValue(
  name: string,
  source: ServerEnvSource,
  environment: RuntimeEnvironment
) {
  return getOptionalServerEnv(resolveStripeEnvName(name, source, environment), source);
}

export function getOptionalStripeServerEnv(
  name: string,
  params?: {
    environment?: RuntimeEnvironment;
    source?: ServerEnvSource;
  }
) {
  const environment = params?.environment || getRuntimeEnvironment();
  const source = params?.source || process.env;
  return readStripeServerEnvValue(name, source, environment);
}

export function getRequiredStripeServerEnv(
  name: string,
  params?: {
    environment?: RuntimeEnvironment;
    errorCode?: string;
    source?: ServerEnvSource;
  }
) {
  const environment = params?.environment || getRuntimeEnvironment();
  const source = params?.source || process.env;
  return getRequiredServerEnv(resolveStripeEnvName(name, source, environment), {
    errorCode: params?.errorCode,
    source
  });
}

export function buildStripeEnvSource(
  source: ServerEnvSource = process.env,
  environment: RuntimeEnvironment = getRuntimeEnvironment()
) {
  if (!prefersDevelopmentStripeEnv(environment)) {
    return source;
  }

  const stripeSource: ServerEnvSource = { ...source };

  for (const name of STRIPE_SERVER_ENV_NAMES) {
    const value = readStripeServerEnvValue(name, source, environment);
    if (value) {
      stripeSource[name] = value;
    }
  }

  return stripeSource;
}
