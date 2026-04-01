import "server-only";

import { IntervalScheduler, resolveGlobalIntervalScheduler } from "@/lib/runtime/interval-scheduler";
import type { WindowedSchedulerConfig } from "@/lib/runtime/scheduler-lock-keys";

export function createWindowedScheduler(
  config: WindowedSchedulerConfig,
  task: () => Promise<void>
) {
  return resolveGlobalIntervalScheduler(
    config.globalStoreKey,
    () =>
      new IntervalScheduler({
        distributedLockKey: config.lockKey,
        intervalMs: config.intervalMs,
        failureMessage: config.failureMessage,
        jobKey: config.jobKey,
        task
      })
  );
}
