describe("runWindowedSchedulerTask", () => {
  it("claims, runs, and completes a windowed task", async () => {
    vi.resetModules();

    const claimSchedulerRunWindow = vi.fn().mockResolvedValue(true);
    const completeSchedulerRunWindow = vi.fn().mockResolvedValue(undefined);
    const releaseSchedulerRunWindow = vi.fn().mockResolvedValue(undefined);
    const task = vi.fn().mockResolvedValue(undefined);

    vi.doMock("@/lib/scheduler-run-windows", () => ({
      claimSchedulerRunWindow,
      completeSchedulerRunWindow,
      releaseSchedulerRunWindow
    }));

    const { runWindowedSchedulerTask } = await import(
      "@/lib/runtime/scheduler-window-runner"
    );
    const result = await runWindowedSchedulerTask({
      intervalMs: 60_000,
      jobKey: "scheduler.test",
      task
    });

    expect(result.status).toBe("completed");
    expect(task).toHaveBeenCalledTimes(1);
    expect(completeSchedulerRunWindow).toHaveBeenCalledTimes(1);
    expect(releaseSchedulerRunWindow).not.toHaveBeenCalled();
  });

  it("skips when the window is already claimed", async () => {
    vi.resetModules();

    const claimSchedulerRunWindow = vi.fn().mockResolvedValue(false);
    const task = vi.fn().mockResolvedValue(undefined);

    vi.doMock("@/lib/scheduler-run-windows", () => ({
      claimSchedulerRunWindow,
      completeSchedulerRunWindow: vi.fn(),
      releaseSchedulerRunWindow: vi.fn()
    }));

    const { runWindowedSchedulerTask } = await import(
      "@/lib/runtime/scheduler-window-runner"
    );
    const result = await runWindowedSchedulerTask({
      intervalMs: 60_000,
      jobKey: "scheduler.test",
      task
    });

    expect(result.status).toBe("skipped");
    expect(task).not.toHaveBeenCalled();
  });

  it("releases the window if the active lock is unavailable", async () => {
    vi.resetModules();

    const claimSchedulerRunWindow = vi.fn().mockResolvedValue(true);
    const releaseSchedulerRunWindow = vi.fn().mockResolvedValue(undefined);

    vi.doMock("@/lib/scheduler-run-windows", () => ({
      claimSchedulerRunWindow,
      completeSchedulerRunWindow: vi.fn(),
      releaseSchedulerRunWindow
    }));
    vi.doMock("@/lib/postgres-advisory-lock", () => ({
      withPostgresAdvisoryLock: vi.fn().mockResolvedValue({
        acquired: false,
        value: undefined
      })
    }));

    const { runWindowedSchedulerTask } = await import(
      "@/lib/runtime/scheduler-window-runner"
    );
    const result = await runWindowedSchedulerTask({
      intervalMs: 60_000,
      jobKey: "scheduler.test",
      lockKey: [4301, 99],
      task: vi.fn().mockResolvedValue(undefined)
    });

    expect(result.status).toBe("skipped");
    expect(releaseSchedulerRunWindow).toHaveBeenCalledTimes(1);
  });

  it("releases the window when the task fails", async () => {
    vi.resetModules();

    const claimSchedulerRunWindow = vi.fn().mockResolvedValue(true);
    const releaseSchedulerRunWindow = vi.fn().mockResolvedValue(undefined);

    vi.doMock("@/lib/scheduler-run-windows", () => ({
      claimSchedulerRunWindow,
      completeSchedulerRunWindow: vi.fn(),
      releaseSchedulerRunWindow
    }));

    const { runWindowedSchedulerTask } = await import(
      "@/lib/runtime/scheduler-window-runner"
    );

    await expect(
      runWindowedSchedulerTask({
        intervalMs: 60_000,
        jobKey: "scheduler.test",
        task: vi.fn().mockRejectedValue(new Error("boom"))
      })
    ).rejects.toThrow("boom");
    expect(releaseSchedulerRunWindow).toHaveBeenCalledTimes(1);
  });
});
