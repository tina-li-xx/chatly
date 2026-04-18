function createStartupOrchestratorMocks() {
  return {
    assertIntegrationsEnvConfigured: vi.fn(),
    assertRedisLiveEnvConfigured: vi.fn(),
    assertStartupProductionCoreEnvConfigured: vi.fn(),
    warmLiveEventBridge: vi.fn().mockResolvedValue(undefined),
    dailyDigestStart: vi.fn(),
    chattingSeoAutopilotStart: vi.fn(),
    growthLifecycleStart: vi.fn(),
    zapierDeliveryStart: vi.fn(),
    weeklyPerformanceStart: vi.fn()
  };
}

async function loadStartupOrchestrator() {
  vi.resetModules();
  const mocks = createStartupOrchestratorMocks();

  vi.doMock("@/lib/env.server", () => ({
    assertIntegrationsEnvConfigured: mocks.assertIntegrationsEnvConfigured,
    assertRedisLiveEnvConfigured: mocks.assertRedisLiveEnvConfigured,
    assertStartupProductionCoreEnvConfigured: mocks.assertStartupProductionCoreEnvConfigured
  }));
  vi.doMock("@/lib/live-events", () => ({
    warmLiveEventBridge: mocks.warmLiveEventBridge
  }));
  vi.doMock("@/lib/runtime/daily-digest-scheduler", () => ({
    dailyDigestScheduler: { start: mocks.dailyDigestStart }
  }));
  vi.doMock("@/lib/runtime/chatting-seo-autopilot-scheduler", () => ({
    chattingSeoAutopilotScheduler: { start: mocks.chattingSeoAutopilotStart }
  }));
  vi.doMock("@/lib/runtime/growth-lifecycle-scheduler", () => ({
    growthLifecycleScheduler: { start: mocks.growthLifecycleStart }
  }));
  vi.doMock("@/lib/runtime/zapier-delivery-scheduler", () => ({
    zapierDeliveryScheduler: { start: mocks.zapierDeliveryStart }
  }));
  vi.doMock("@/lib/runtime/weekly-performance-scheduler", () => ({
    weeklyPerformanceScheduler: { start: mocks.weeklyPerformanceStart }
  }));

  const module = await import("@/lib/runtime/startup-orchestrator");
  return { mocks, startNodeRuntimeServices: module.startNodeRuntimeServices };
}

describe("startup orchestrator", () => {
  it("starts runtime services by default in production", async () => {
    const { mocks, startNodeRuntimeServices } = await loadStartupOrchestrator();
    const source = { NODE_ENV: "production" };

    await startNodeRuntimeServices(source);

    expect(mocks.assertIntegrationsEnvConfigured).toHaveBeenCalledWith({ source });
    expect(mocks.assertRedisLiveEnvConfigured).toHaveBeenCalledWith({ source });
    expect(mocks.assertStartupProductionCoreEnvConfigured).toHaveBeenCalledWith({ source });
    expect(mocks.warmLiveEventBridge).toHaveBeenCalledTimes(1);
    expect(mocks.dailyDigestStart).toHaveBeenCalledTimes(1);
    expect(mocks.chattingSeoAutopilotStart).toHaveBeenCalledTimes(1);
    expect(mocks.growthLifecycleStart).toHaveBeenCalledTimes(1);
    expect(mocks.zapierDeliveryStart).toHaveBeenCalledTimes(1);
    expect(mocks.weeklyPerformanceStart).toHaveBeenCalledTimes(1);
  });

  it("skips background startup work outside production by default", async () => {
    const { mocks, startNodeRuntimeServices } = await loadStartupOrchestrator();

    await startNodeRuntimeServices({ NODE_ENV: "development" });

    expect(mocks.assertIntegrationsEnvConfigured).not.toHaveBeenCalled();
    expect(mocks.assertRedisLiveEnvConfigured).not.toHaveBeenCalled();
    expect(mocks.assertStartupProductionCoreEnvConfigured).not.toHaveBeenCalled();
    expect(mocks.warmLiveEventBridge).not.toHaveBeenCalled();
    expect(mocks.dailyDigestStart).not.toHaveBeenCalled();
    expect(mocks.chattingSeoAutopilotStart).not.toHaveBeenCalled();
    expect(mocks.growthLifecycleStart).not.toHaveBeenCalled();
    expect(mocks.zapierDeliveryStart).not.toHaveBeenCalled();
    expect(mocks.weeklyPerformanceStart).not.toHaveBeenCalled();
  });

  it("lets production disable one scheduler without stopping the others", async () => {
    const { mocks, startNodeRuntimeServices } = await loadStartupOrchestrator();

    await startNodeRuntimeServices({
      NODE_ENV: "production",
      ENABLE_GROWTH_LIFECYCLE_SCHEDULER: "false"
    });

    expect(mocks.dailyDigestStart).toHaveBeenCalledTimes(1);
    expect(mocks.chattingSeoAutopilotStart).toHaveBeenCalledTimes(1);
    expect(mocks.growthLifecycleStart).not.toHaveBeenCalled();
    expect(mocks.zapierDeliveryStart).toHaveBeenCalledTimes(1);
    expect(mocks.weeklyPerformanceStart).toHaveBeenCalledTimes(1);
  });
});
