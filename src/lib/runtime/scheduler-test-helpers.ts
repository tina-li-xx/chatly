type GlobalSchedulerStore = typeof globalThis & Record<string, unknown>;

export function resetGlobalScheduler(key: string) {
  vi.resetModules();
  (globalThis as GlobalSchedulerStore)[key] = undefined;
}

export async function flushSchedulerAsyncWork() {
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
}

export function createCompletedWindowRunner() {
  return vi.fn(async (params: { task: () => Promise<void> }) => {
    await params.task();
    return { status: "completed" as const, windowKey: "1" };
  });
}
