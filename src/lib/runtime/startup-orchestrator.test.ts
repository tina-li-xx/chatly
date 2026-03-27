describe("startup orchestrator", () => {
  it("runs the startup env assertions", async () => {
    vi.resetModules();

    const assertStartupProductionCoreEnvConfigured = vi.fn();
    const assertR2EnvConfigured = vi.fn();
    const assertStripeBillingEnvConfigured = vi.fn();

    vi.doMock("@/lib/env.server", () => ({
      assertStartupProductionCoreEnvConfigured,
      assertR2EnvConfigured,
      assertStripeBillingEnvConfigured
    }));

    const { startNodeRuntimeServices } = await import("@/lib/runtime/startup-orchestrator");
    await startNodeRuntimeServices();

    expect(assertStartupProductionCoreEnvConfigured).toHaveBeenCalledTimes(1);
    expect(assertR2EnvConfigured).toHaveBeenCalledTimes(1);
    expect(assertStripeBillingEnvConfigured).toHaveBeenCalledTimes(1);
  });
});
