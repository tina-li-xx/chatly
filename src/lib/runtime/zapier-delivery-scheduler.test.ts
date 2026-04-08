import {
  createCompletedWindowRunner,
  flushSchedulerAsyncWork,
  resetGlobalScheduler
} from "@/lib/runtime/scheduler-test-helpers";

describe("zapier delivery scheduler", () => {
  it("starts once and runs queued deliveries on an interval", async () => {
    vi.useFakeTimers();
    resetGlobalScheduler("__chattingZapierDeliveryScheduler__");

    const runScheduledZapierDeliveries = vi.fn().mockResolvedValue(undefined);
    vi.doMock("@/lib/zapier-delivery-runner", () => ({
      runScheduledZapierDeliveries
    }));
    vi.doMock("@/lib/runtime/scheduler-window-runner", () => ({
      runWindowedSchedulerTask: createCompletedWindowRunner()
    }));
    const setIntervalSpy = vi.spyOn(globalThis, "setInterval");

    const { zapierDeliveryScheduler } = await import(
      "@/lib/runtime/zapier-delivery-scheduler"
    );

    zapierDeliveryScheduler.start();
    await flushSchedulerAsyncWork();
    const afterStart = runScheduledZapierDeliveries.mock.calls.length;

    zapierDeliveryScheduler.start();
    expect(setIntervalSpy).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(15 * 1000);
    await flushSchedulerAsyncWork();

    expect(runScheduledZapierDeliveries.mock.calls.length).toBeGreaterThan(afterStart);

    zapierDeliveryScheduler.stop();
    setIntervalSpy.mockRestore();
    vi.useRealTimers();
  });
});
