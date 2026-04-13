describe("startup orchestrator", () => {
  it("runs the startup env assertions", async () => {
    vi.resetModules();

    const assertIntegrationsEnvConfigured = vi.fn();
    const assertRedisLiveEnvConfigured = vi.fn();
    const assertStartupProductionCoreEnvConfigured = vi.fn();
    const warmLiveEventBridge = vi.fn().mockResolvedValue(undefined);
    const chattingSeoAutopilotStart = vi.fn();
    const dailyDigestStart = vi.fn();
    const schedulerStart = vi.fn();
    const zapierDeliveryStart = vi.fn();
    const weeklyPerformanceStart = vi.fn();

    vi.doMock("@/lib/env.server", () => ({
      assertIntegrationsEnvConfigured,
      assertRedisLiveEnvConfigured,
      assertStartupProductionCoreEnvConfigured
    }));
    vi.doMock("@/lib/live-events", () => ({
      warmLiveEventBridge
    }));
    vi.doMock("@/lib/runtime/daily-digest-scheduler", () => ({
      dailyDigestScheduler: {
        start: dailyDigestStart
      }
    }));
    vi.doMock("@/lib/runtime/chatting-seo-autopilot-scheduler", () => ({
      chattingSeoAutopilotScheduler: {
        start: chattingSeoAutopilotStart
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
    expect(assertRedisLiveEnvConfigured).toHaveBeenCalledTimes(1);
    expect(assertStartupProductionCoreEnvConfigured).toHaveBeenCalledTimes(1);
    expect(warmLiveEventBridge).toHaveBeenCalledTimes(1);
    expect(dailyDigestStart).toHaveBeenCalledTimes(1);
    expect(chattingSeoAutopilotStart).toHaveBeenCalledTimes(1);
    expect(schedulerStart).toHaveBeenCalledTimes(1);
    expect(zapierDeliveryStart).toHaveBeenCalledTimes(1);
    expect(weeklyPerformanceStart).toHaveBeenCalledTimes(1);
  });
});
