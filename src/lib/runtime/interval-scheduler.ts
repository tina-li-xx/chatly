import "server-only";

import {
  type PostgresAdvisoryLockKey,
  withPostgresAdvisoryLock
} from "@/lib/postgres-advisory-lock";
import { runWindowedSchedulerTask } from "@/lib/runtime/scheduler-window-runner";

type IntervalSchedulerOptions = {
  distributedLockKey?: PostgresAdvisoryLockKey;
  intervalMs: number;
  failureMessage: string;
  jobKey?: string;
  task: () => Promise<void>;
};

export class IntervalScheduler {
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private running = false;

  constructor(private readonly options: IntervalSchedulerOptions) {}

  start() {
    if (this.intervalId) {
      return;
    }

    void this.runCycle();
    this.intervalId = setInterval(() => {
      void this.runCycle();
    }, this.options.intervalMs);
  }

  stop() {
    if (!this.intervalId) {
      return;
    }

    clearInterval(this.intervalId);
    this.intervalId = null;
  }

  async runCycle() {
    if (this.running) {
      return;
    }

    this.running = true;

    try {
      if (this.options.jobKey) {
        await runWindowedSchedulerTask({
          intervalMs: this.options.intervalMs,
          jobKey: this.options.jobKey,
          lockKey: this.options.distributedLockKey,
          task: this.options.task
        });
      } else if (this.options.distributedLockKey) {
        await withPostgresAdvisoryLock(
          this.options.distributedLockKey,
          this.options.task
        );
      } else {
        await this.options.task();
      }
    } catch (error) {
      console.error(this.options.failureMessage, error);
    } finally {
      this.running = false;
    }
  }
}

type GlobalSchedulerStore = typeof globalThis & Record<string, IntervalScheduler | undefined>;

export function resolveGlobalIntervalScheduler(
  key: string,
  create: () => IntervalScheduler
) {
  const store = globalThis as GlobalSchedulerStore;
  store[key] ??= create();
  return store[key];
}
