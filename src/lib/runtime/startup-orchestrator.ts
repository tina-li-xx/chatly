import "server-only";

export async function startNodeRuntimeServices() {
  const [
    { assertIntegrationsEnvConfigured, assertStartupProductionCoreEnvConfigured },
    { dailyDigestScheduler },
    { growthLifecycleScheduler },
    { zapierDeliveryScheduler },
    { weeklyPerformanceScheduler }
  ] = await Promise.all([
    import("@/lib/env.server"),
    import("@/lib/runtime/daily-digest-scheduler"),
    import("@/lib/runtime/growth-lifecycle-scheduler"),
    import("@/lib/runtime/zapier-delivery-scheduler"),
    import("@/lib/runtime/weekly-performance-scheduler")
  ]);

  assertStartupProductionCoreEnvConfigured();
  assertIntegrationsEnvConfigured();
  dailyDigestScheduler.start();
  growthLifecycleScheduler.start();
  zapierDeliveryScheduler.start();
  weeklyPerformanceScheduler.start();
}
