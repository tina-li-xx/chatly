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
  getApplePushConfig,
  getAdminAlertEmail,
  getAppDisplayName,
  getAuthSecret,
  getDatabaseConfig,
  getMiniMaxConfig,
  getRedisUrl,
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
  assertApplePushEnvConfigured,
  assertIntegrationsEnvConfigured,
  assertRedisLiveEnvConfigured,
  assertR2EnvConfigured,
  assertStartupProductionCoreEnvConfigured,
  assertStripeBillingEnvConfigured,
  getMissingApplePushEnvVars,
  getMissingIntegrationsEnvVars,
  getMissingRedisLiveEnvVars,
  getMissingR2EnvVars,
  getMissingStartupProductionCoreEnvVars,
  getMissingStripeBillingEnvVars,
  getMissingStripeCheckoutEnvVars,
  isApplePushConfigured,
  isStripeBillingReady,
  isStripeConfigured
} from "@/lib/env-server/validation";
