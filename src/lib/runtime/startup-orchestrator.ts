export async function startNodeRuntimeServices() {
  const {
    assertStartupProductionCoreEnvConfigured,
    assertR2EnvConfigured,
    assertStripeBillingEnvConfigured
  } = await import("@/lib/env.server");

  assertStartupProductionCoreEnvConfigured();
  assertR2EnvConfigured();
  assertStripeBillingEnvConfigured();
}
