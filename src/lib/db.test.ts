describe("db pool bootstrap", () => {
  beforeEach(() => {
    vi.resetModules();
    delete global.__chattingDb;
    delete global.__chattingPool;
    delete global.__chattingPoolReady;
    delete global.__chattingSchemaReady;
    delete global.__chattingSchemaVersion;
  });

  it("attaches an idle client error handler to the shared postgres pool", async () => {
    const on = vi.fn();
    const Pool = vi.fn(function MockPool() {
      return { on };
    });

    vi.doMock("pg", () => ({ Pool }));
    vi.doMock("drizzle-orm/node-postgres", () => ({
      drizzle: vi.fn()
    }));
    vi.doMock("@/lib/drizzle/migrate", () => ({
      runDrizzleMigrations: vi.fn()
    }));
    vi.doMock("@/lib/drizzle/schema", () => ({}));
    vi.doMock("@/lib/env.server", () => ({
      getDatabaseConfig: () => ({
        connectionString: "postgres://chatting.test/db"
      })
    }));

    const { getPool } = await import("@/lib/db");
    await getPool();

    expect(Pool).toHaveBeenCalledTimes(1);
    expect(on).toHaveBeenCalledWith("error", expect.any(Function));
  });
});
