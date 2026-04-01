import {
  createCompletedWindowRunner,
  flushSchedulerAsyncWork,
  resetGlobalScheduler
} from "@/lib/runtime/scheduler-test-helpers";

describe("daily digest scheduler", () => {
  it("starts once and runs digests on an interval", async () => {
    vi.useFakeTimers();
    resetGlobalScheduler("__chatlyDailyDigestScheduler__");

    const runScheduledDailyDigests = vi.fn().mockResolvedValue(undefined);
    vi.doMock("@/lib/daily-digest", () => ({
      runScheduledDailyDigests
    }));
    vi.doMock("@/lib/runtime/scheduler-window-runner", () => ({
      runWindowedSchedulerTask: createCompletedWindowRunner()
    }));
    const setIntervalSpy = vi.spyOn(globalThis, "setInterval");

    const { dailyDigestScheduler } = await import("@/lib/runtime/daily-digest-scheduler");

    dailyDigestScheduler.start();
    await flushSchedulerAsyncWork();
    const afterStart = runScheduledDailyDigests.mock.calls.length;

    dailyDigestScheduler.start();
    expect(setIntervalSpy).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(60 * 60 * 1000);
    await flushSchedulerAsyncWork();

    expect(runScheduledDailyDigests.mock.calls.length).toBeGreaterThan(afterStart);

    dailyDigestScheduler.stop();
    setIntervalSpy.mockRestore();
    vi.useRealTimers();
  });

  it("skips overlapping digest runs", async () => {
    vi.useFakeTimers();
    resetGlobalScheduler("__chatlyDailyDigestScheduler__");

    let resolveRun: (() => void) | null = null;
    const runScheduledDailyDigests = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveRun = resolve;
        })
    );
    vi.doMock("@/lib/daily-digest", () => ({
      runScheduledDailyDigests
    }));
    vi.doMock("@/lib/runtime/scheduler-window-runner", () => ({
      runWindowedSchedulerTask: createCompletedWindowRunner()
    }));

    const { dailyDigestScheduler } = await import("@/lib/runtime/daily-digest-scheduler");

    dailyDigestScheduler.start();
    await flushSchedulerAsyncWork();
    await vi.advanceTimersByTimeAsync(60 * 60 * 1000);
    await flushSchedulerAsyncWork();

    expect(runScheduledDailyDigests).toHaveBeenCalledTimes(1);

    resolveRun?.();
    await flushSchedulerAsyncWork();

    dailyDigestScheduler.stop();
    vi.useRealTimers();
  });
});
