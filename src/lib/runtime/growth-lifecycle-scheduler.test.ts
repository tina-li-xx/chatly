import {
  createCompletedWindowRunner,
  flushSchedulerAsyncWork,
  resetGlobalScheduler
} from "@/lib/runtime/scheduler-test-helpers";

describe("growth lifecycle scheduler", () => {
  it("starts once and runs lifecycle emails on an interval", async () => {
    vi.useFakeTimers();
    resetGlobalScheduler("__chatlyGrowthLifecycleScheduler__");

    const runScheduledGrowthLifecycleEmails = vi.fn().mockResolvedValue(undefined);
    vi.doMock("@/lib/growth-outreach-runner", () => ({
      runScheduledGrowthLifecycleEmails
    }));
    vi.doMock("@/lib/runtime/scheduler-window-runner", () => ({
      runWindowedSchedulerTask: createCompletedWindowRunner()
    }));
    const setIntervalSpy = vi.spyOn(globalThis, "setInterval");

    const { growthLifecycleScheduler } = await import("@/lib/runtime/growth-lifecycle-scheduler");

    growthLifecycleScheduler.start();
    await flushSchedulerAsyncWork();
    const afterStart = runScheduledGrowthLifecycleEmails.mock.calls.length;

    growthLifecycleScheduler.start();
    expect(setIntervalSpy).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(60 * 60 * 1000);
    await flushSchedulerAsyncWork();

    expect(runScheduledGrowthLifecycleEmails.mock.calls.length).toBeGreaterThan(afterStart);

    growthLifecycleScheduler.stop();
    setIntervalSpy.mockRestore();
    vi.useRealTimers();
  });

  it("skips overlapping lifecycle runs", async () => {
    vi.useFakeTimers();
    resetGlobalScheduler("__chatlyGrowthLifecycleScheduler__");

    let resolveRun: (() => void) | null = null;
    const runScheduledGrowthLifecycleEmails = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveRun = resolve;
        })
    );
    vi.doMock("@/lib/growth-outreach-runner", () => ({
      runScheduledGrowthLifecycleEmails
    }));
    vi.doMock("@/lib/runtime/scheduler-window-runner", () => ({
      runWindowedSchedulerTask: createCompletedWindowRunner()
    }));

    const { growthLifecycleScheduler } = await import("@/lib/runtime/growth-lifecycle-scheduler");

    growthLifecycleScheduler.start();
    await flushSchedulerAsyncWork();
    await vi.advanceTimersByTimeAsync(60 * 60 * 1000);
    await flushSchedulerAsyncWork();

    expect(runScheduledGrowthLifecycleEmails).toHaveBeenCalledTimes(1);

    resolveRun?.();
    await flushSchedulerAsyncWork();

    growthLifecycleScheduler.stop();
    vi.useRealTimers();
  });
});
