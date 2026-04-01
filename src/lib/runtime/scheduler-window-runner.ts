import "server-only";

import {
  type PostgresAdvisoryLockKey,
  withPostgresAdvisoryLock
} from "@/lib/postgres-advisory-lock";
import {
  claimSchedulerRunWindow,
  completeSchedulerRunWindow,
  releaseSchedulerRunWindow
} from "@/lib/scheduler-run-windows";

type SchedulerWindowTaskParams = {
  intervalMs: number;
  jobKey: string;
  lockKey?: PostgresAdvisoryLockKey;
  task: () => Promise<void>;
};

function resolveSchedulerInstanceId() {
  return (process.env.K_REVISION || process.env.HOSTNAME || "local").trim();
}

function toWindowKey(now: Date, intervalMs: number) {
  return String(Math.floor(now.getTime() / intervalMs));
}

export async function runWindowedSchedulerTask(
  params: SchedulerWindowTaskParams
) {
  const instanceId = resolveSchedulerInstanceId();
  const windowKey = toWindowKey(new Date(), params.intervalMs);

  const claimed = await claimSchedulerRunWindow({
    jobKey: params.jobKey,
    windowKey,
    metadata: { instanceId }
  });

  if (!claimed) {
    return { status: "skipped" as const, windowKey };
  }

  try {
    if (params.lockKey) {
      const lockResult = await withPostgresAdvisoryLock(
        params.lockKey,
        params.task
      );

      if (!lockResult.acquired) {
        await releaseSchedulerRunWindow({ jobKey: params.jobKey, windowKey });
        return { status: "skipped" as const, windowKey };
      }
    } else {
      await params.task();
    }

    await completeSchedulerRunWindow({
      jobKey: params.jobKey,
      windowKey,
      metadata: { instanceId }
    });

    return { status: "completed" as const, windowKey };
  } catch (error) {
    await releaseSchedulerRunWindow({ jobKey: params.jobKey, windowKey });
    throw error;
  }
}
