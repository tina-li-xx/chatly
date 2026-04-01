describe("withPostgresAdvisoryLock", () => {
  it("runs the task when the advisory lock is acquired", async () => {
    vi.resetModules();

    const query = vi
      .fn()
      .mockResolvedValueOnce({ rows: [{ locked: true }] })
      .mockResolvedValueOnce({ rows: [{ unlocked: true }] });
    const release = vi.fn();
    const connect = vi.fn().mockResolvedValue({ query, release });
    const getPool = vi.fn().mockResolvedValue({ connect });
    const task = vi.fn().mockResolvedValue("done");

    vi.doMock("@/lib/db", () => ({
      getPool
    }));

    const { withPostgresAdvisoryLock } = await import(
      "@/lib/postgres-advisory-lock"
    );
    const result = await withPostgresAdvisoryLock([4301, 1], task);

    expect(result).toEqual({ acquired: true, value: "done" });
    expect(task).toHaveBeenCalledTimes(1);
    expect(query).toHaveBeenNthCalledWith(
      1,
      "select pg_try_advisory_lock($1, $2) as locked",
      [4301, 1]
    );
    expect(query).toHaveBeenNthCalledWith(
      2,
      "select pg_advisory_unlock($1, $2) as unlocked",
      [4301, 1]
    );
    expect(release).toHaveBeenCalledWith(false);
  });

  it("skips the task when another instance already holds the advisory lock", async () => {
    vi.resetModules();

    const query = vi.fn().mockResolvedValueOnce({ rows: [{ locked: false }] });
    const release = vi.fn();
    const connect = vi.fn().mockResolvedValue({ query, release });
    const getPool = vi.fn().mockResolvedValue({ connect });
    const task = vi.fn().mockResolvedValue("done");

    vi.doMock("@/lib/db", () => ({
      getPool
    }));

    const { withPostgresAdvisoryLock } = await import(
      "@/lib/postgres-advisory-lock"
    );
    const result = await withPostgresAdvisoryLock([4301, 2], task);

    expect(result).toEqual({ acquired: false, value: undefined });
    expect(task).not.toHaveBeenCalled();
    expect(query).toHaveBeenCalledTimes(1);
    expect(release).toHaveBeenCalledWith(false);
  });

  it("unlocks and rethrows when the task fails", async () => {
    vi.resetModules();

    const query = vi
      .fn()
      .mockResolvedValueOnce({ rows: [{ locked: true }] })
      .mockResolvedValueOnce({ rows: [{ unlocked: true }] });
    const release = vi.fn();
    const connect = vi.fn().mockResolvedValue({ query, release });
    const getPool = vi.fn().mockResolvedValue({ connect });
    const task = vi.fn().mockRejectedValue(new Error("task failed"));

    vi.doMock("@/lib/db", () => ({
      getPool
    }));

    const { withPostgresAdvisoryLock } = await import(
      "@/lib/postgres-advisory-lock"
    );

    await expect(
      withPostgresAdvisoryLock([4301, 3], task)
    ).rejects.toThrow("task failed");
    expect(query).toHaveBeenNthCalledWith(
      2,
      "select pg_advisory_unlock($1, $2) as unlocked",
      [4301, 3]
    );
    expect(release).toHaveBeenCalledWith(false);
  });

  it("destroys the client if unlocking fails", async () => {
    vi.resetModules();

    const query = vi
      .fn()
      .mockResolvedValueOnce({ rows: [{ locked: true }] })
      .mockRejectedValueOnce(new Error("unlock failed"));
    const release = vi.fn();
    const connect = vi.fn().mockResolvedValue({ query, release });
    const getPool = vi.fn().mockResolvedValue({ connect });

    vi.doMock("@/lib/db", () => ({
      getPool
    }));

    const { withPostgresAdvisoryLock } = await import(
      "@/lib/postgres-advisory-lock"
    );

    await expect(
      withPostgresAdvisoryLock([4301, 4], vi.fn().mockResolvedValue(undefined))
    ).rejects.toThrow("unlock failed");
    expect(release).toHaveBeenCalledWith(true);
  });
});
