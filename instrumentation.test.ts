describe("instrumentation", () => {
  const originalRuntime = process.env.NEXT_RUNTIME;

  afterEach(() => {
    vi.resetModules();
    if (originalRuntime === undefined) {
      delete process.env.NEXT_RUNTIME;
    } else {
      process.env.NEXT_RUNTIME = originalRuntime;
    }
  });

  it("starts node runtime services only for nodejs runtime", async () => {
    const startNodeRuntimeServices = vi.fn();

    process.env.NEXT_RUNTIME = "nodejs";
    vi.doMock("@/lib/runtime/startup-orchestrator", () => ({
      startNodeRuntimeServices
    }));

    const instrumentation = await import("./instrumentation");
    await instrumentation.register();
    expect(startNodeRuntimeServices).toHaveBeenCalledTimes(1);

    vi.resetModules();
    process.env.NEXT_RUNTIME = "edge";
    const skippedStartNodeRuntimeServices = vi.fn();
    vi.doMock("@/lib/runtime/startup-orchestrator", () => ({
      startNodeRuntimeServices: skippedStartNodeRuntimeServices
    }));

    const skippedInstrumentation = await import("./instrumentation");
    await skippedInstrumentation.register();
    expect(skippedStartNodeRuntimeServices).not.toHaveBeenCalled();
  });
});
