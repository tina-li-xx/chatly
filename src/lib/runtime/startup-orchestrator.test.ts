describe("startup orchestrator", () => {
  it("runs the startup env assertions", async () => {
    vi.resetModules();

    const assertIntegrationsEnvConfigured = vi.fn();
    const assertStartupProductionCoreEnvConfigured = vi.fn();
    const dailyDigestStart = vi.fn();
    const schedulerStart = vi.fn();
    const zapierDeliveryStart = vi.fn();
    const weeklyPerformanceStart = vi.fn();

    vi.doMock("@/lib/env.server", () => ({
      assertIntegrationsEnvConfigured,
      assertStartupProductionCoreEnvConfigured
    }));
    vi.doMock("@/lib/runtime/daily-digest-scheduler", () => ({
      dailyDigestScheduler: {
        start: dailyDigestStart
      }
    }));
    vi.doMock("@/lib/runtime/growth-lifecycle-scheduler", () => ({
      growthLifecycleScheduler: {
        start: schedulerStart
      }
    }));
    vi.doMock("@/lib/runtime/zapier-delivery-scheduler", () => ({
      zapierDeliveryScheduler: {
        start: zapierDeliveryStart
      }
    }));
    vi.doMock("@/lib/runtime/weekly-performance-scheduler", () => ({
      weeklyPerformanceScheduler: {
        start: weeklyPerformanceStart
      }
    }));

    const { startNodeRuntimeServices } = await import("@/lib/runtime/startup-orchestrator");
    await startNodeRuntimeServices();

    expect(assertIntegrationsEnvConfigured).toHaveBeenCalledTimes(1);
    expect(assertStartupProductionCoreEnvConfigured).toHaveBeenCalledTimes(1);
    expect(dailyDigestStart).toHaveBeenCalledTimes(1);
    expect(schedulerStart).toHaveBeenCalledTimes(1);
    expect(zapierDeliveryStart).toHaveBeenCalledTimes(1);
    expect(weeklyPerformanceStart).toHaveBeenCalledTimes(1);
  });
});
