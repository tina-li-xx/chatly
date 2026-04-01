describe("IntervalScheduler", () => {
  it("runs the task through a claimed scheduler window when a job key is configured", async () => {
    vi.resetModules();

    const runWindowedSchedulerTask = vi.fn().mockResolvedValue({
      status: "completed",
      windowKey: "1"
    });
    const task = vi.fn().mockResolvedValue(undefined);

    vi.doMock("@/lib/runtime/scheduler-window-runner", () => ({
      runWindowedSchedulerTask
    }));

    const { IntervalScheduler } = await import("@/lib/runtime/interval-scheduler");
    const scheduler = new IntervalScheduler({
      distributedLockKey: [4301, 8],
      failureMessage: "scheduler failed",
      intervalMs: 1000,
      jobKey: "scheduler.test",
      task
    });

    await scheduler.runCycle();

    expect(runWindowedSchedulerTask).toHaveBeenCalledWith({
      intervalMs: 1000,
      jobKey: "scheduler.test",
      lockKey: [4301, 8],
      task
    });
    expect(task).not.toHaveBeenCalled();
  });

  it("runs the task through a distributed lock when configured", async () => {
    vi.resetModules();

    const withPostgresAdvisoryLock = vi.fn(
      async (_lockKey: readonly [number, number], task: () => Promise<void>) => {
        await task();
        return { acquired: true as const, value: undefined };
      }
    );
    const task = vi.fn().mockResolvedValue(undefined);

    vi.doMock("@/lib/postgres-advisory-lock", () => ({
      withPostgresAdvisoryLock
    }));

    const { IntervalScheduler } = await import("@/lib/runtime/interval-scheduler");
    const scheduler = new IntervalScheduler({
      distributedLockKey: [4301, 9],
      failureMessage: "scheduler failed",
      intervalMs: 1000,
      task
    });

    await scheduler.runCycle();

    expect(withPostgresAdvisoryLock).toHaveBeenCalledWith([4301, 9], task);
    expect(task).toHaveBeenCalledTimes(1);
  });

  it("skips the task when a distributed lock is not acquired", async () => {
    vi.resetModules();

    const withPostgresAdvisoryLock = vi.fn().mockResolvedValue({
      acquired: false as const,
      value: undefined
    });
    const task = vi.fn().mockResolvedValue(undefined);

    vi.doMock("@/lib/postgres-advisory-lock", () => ({
      withPostgresAdvisoryLock
    }));

    const { IntervalScheduler } = await import("@/lib/runtime/interval-scheduler");
    const scheduler = new IntervalScheduler({
      distributedLockKey: [4301, 10],
      failureMessage: "scheduler failed",
      intervalMs: 1000,
      task
    });

    await scheduler.runCycle();

    expect(withPostgresAdvisoryLock).toHaveBeenCalledWith([4301, 10], task);
    expect(task).not.toHaveBeenCalled();
  });
});
