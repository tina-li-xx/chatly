describe("scheduler run windows", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("retries a transient connection reset while claiming a window", async () => {
    const query = vi
      .fn()
      .mockRejectedValueOnce(
        Object.assign(new Error("read ECONNRESET"), { code: "ECONNRESET" })
      )
      .mockResolvedValueOnce({ rows: [{ inserted: 1 }] });

    vi.doMock("@/lib/db", () => ({
      query
    }));

    const { claimSchedulerRunWindow } = await import("@/lib/scheduler-run-windows");
    const claimed = await claimSchedulerRunWindow({
      jobKey: "scheduler.test",
      windowKey: "123"
    });

    expect(claimed).toBe(true);
    expect(query).toHaveBeenCalledTimes(2);
  });

  it("retries a transient connection reset while releasing a window", async () => {
    const query = vi
      .fn()
      .mockRejectedValueOnce(
        Object.assign(new Error("read ECONNRESET"), { code: "ECONNRESET" })
      )
      .mockResolvedValueOnce({ rows: [] });

    vi.doMock("@/lib/db", () => ({
      query
    }));

    const { releaseSchedulerRunWindow } = await import("@/lib/scheduler-run-windows");

    await expect(
      releaseSchedulerRunWindow({
        jobKey: "scheduler.test",
        windowKey: "123"
      })
    ).resolves.toBeUndefined();
    expect(query).toHaveBeenCalledTimes(2);
  });
});
