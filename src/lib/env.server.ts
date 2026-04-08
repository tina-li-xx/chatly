import "server-only";

export {
  getMissingRequiredEnvVars,
  getOptionalServerEnv,
  getRequiredServerEnv
} from "@/lib/env-server/core";
export {
  getMissingEnvVarsForGroup,
  getMissingMiniMaxEnvVars,
  getMissingSesEnvVars
} from "@/lib/env-server/groups";
export {
  getAdminAlertEmail,
  getAppDisplayName,
  getAuthSecret,
  getDatabaseConfig,
  getMiniMaxConfig,
  getReplyDomain,
  getSesClientConfig,
  getSesInboundTopicArnSet
} from "@/lib/env-server/services";
export {
  buildStripeEnvSource,
  getOptionalStripeServerEnv,
  getRequiredStripeServerEnv
} from "@/lib/env-server/stripe";
export {
  assertIntegrationsEnvConfigured,
  assertR2EnvConfigured,
  assertStartupProductionCoreEnvConfigured,
  assertStripeBillingEnvConfigured,
  getMissingIntegrationsEnvVars,
  getMissingR2EnvVars,
  getMissingStartupProductionCoreEnvVars,
  getMissingStripeBillingEnvVars,
  getMissingStripeCheckoutEnvVars,
  isStripeBillingReady,
  isStripeConfigured
} from "@/lib/env-server/validation";
