import "server-only";

export async function startNodeRuntimeServices() {
  const [
    {
      assertIntegrationsEnvConfigured,
      assertRedisLiveEnvConfigured,
      assertStartupProductionCoreEnvConfigured
    },
    { warmLiveEventBridge },
    { dailyDigestScheduler },
    { chattingSeoAutopilotScheduler },
    { growthLifecycleScheduler },
    { zapierDeliveryScheduler },
    { weeklyPerformanceScheduler }
  ] = await Promise.all([
    import("@/lib/env.server"),
    import("@/lib/live-events"),
    import("@/lib/runtime/daily-digest-scheduler"),
    import("@/lib/runtime/chatting-seo-autopilot-scheduler"),
    import("@/lib/runtime/growth-lifecycle-scheduler"),
    import("@/lib/runtime/zapier-delivery-scheduler"),
    import("@/lib/runtime/weekly-performance-scheduler")
  ]);

  assertStartupProductionCoreEnvConfigured();
  assertIntegrationsEnvConfigured();
  assertRedisLiveEnvConfigured();
  await warmLiveEventBridge();
  dailyDigestScheduler.start();
  chattingSeoAutopilotScheduler.start();
  growthLifecycleScheduler.start();
  zapierDeliveryScheduler.start();
  weeklyPerformanceScheduler.start();
}
