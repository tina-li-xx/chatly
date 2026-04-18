import { JOB_SCHEDULES } from "@/lib/job-schedules";
import {
  createCompletedWindowRunner,
  flushSchedulerAsyncWork,
  resetGlobalScheduler
} from "@/lib/runtime/scheduler-test-helpers";

describe("weekly performance scheduler", () => {
  it("starts once and runs weekly emails on an interval", async () => {
    vi.useFakeTimers();
    resetGlobalScheduler("__chattingWeeklyPerformanceScheduler__");

    const runScheduledWeeklyPerformanceEmails = vi.fn().mockResolvedValue(undefined);
    vi.doMock("@/lib/weekly-performance", () => ({
      runScheduledWeeklyPerformanceEmails
    }));
    vi.doMock("@/lib/runtime/scheduler-window-runner", () => ({
      runWindowedSchedulerTask: createCompletedWindowRunner()
    }));
    const setIntervalSpy = vi.spyOn(globalThis, "setInterval");

    const { weeklyPerformanceScheduler } = await import("@/lib/runtime/weekly-performance-scheduler");

    weeklyPerformanceScheduler.start();
    await flushSchedulerAsyncWork();
    const afterStart = runScheduledWeeklyPerformanceEmails.mock.calls.length;

    weeklyPerformanceScheduler.start();
    expect(setIntervalSpy).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(JOB_SCHEDULES.weeklyPerformance.intervalMs);
    await flushSchedulerAsyncWork();

    expect(runScheduledWeeklyPerformanceEmails.mock.calls.length).toBeGreaterThan(afterStart);

    weeklyPerformanceScheduler.stop();
    setIntervalSpy.mockRestore();
    vi.useRealTimers();
  });

  it("skips overlapping weekly runs", async () => {
    vi.useFakeTimers();
    resetGlobalScheduler("__chattingWeeklyPerformanceScheduler__");

    let resolveRun: (() => void) | null = null;
    const runScheduledWeeklyPerformanceEmails = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveRun = resolve;
        })
    );
    vi.doMock("@/lib/weekly-performance", () => ({
      runScheduledWeeklyPerformanceEmails
    }));
    vi.doMock("@/lib/runtime/scheduler-window-runner", () => ({
      runWindowedSchedulerTask: createCompletedWindowRunner()
    }));

    const { weeklyPerformanceScheduler } = await import("@/lib/runtime/weekly-performance-scheduler");

    weeklyPerformanceScheduler.start();
    await flushSchedulerAsyncWork();
    await vi.advanceTimersByTimeAsync(JOB_SCHEDULES.weeklyPerformance.intervalMs);
    await flushSchedulerAsyncWork();

    expect(runScheduledWeeklyPerformanceEmails).toHaveBeenCalledTimes(1);

    resolveRun?.();
    await flushSchedulerAsyncWork();

    weeklyPerformanceScheduler.stop();
    vi.useRealTimers();
  });
});
