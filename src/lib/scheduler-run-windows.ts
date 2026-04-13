import "server-only";

import { query } from "@/lib/db";
import { withRetryableDatabaseConnectionRetry } from "@/lib/retryable-database-errors";

export async function claimSchedulerRunWindow(args: {
  jobKey: string;
  windowKey: string;
  metadata?: Record<string, unknown>;
}) {
  const result = await withRetryableDatabaseConnectionRetry(() =>
    query<{ inserted: number }>(
      `
        insert into scheduler_run_windows (
          job_key,
          window_key,
          status,
          started_at,
          updated_at,
          metadata
        )
        values ($1, $2, 'running', now(), now(), $3::jsonb)
        on conflict (job_key, window_key) do nothing
        returning 1 as inserted
      `,
      [args.jobKey, args.windowKey, JSON.stringify(args.metadata ?? {})]
    )
  );

  return Boolean(result.rows[0]?.inserted);
}

export async function completeSchedulerRunWindow(args: {
  jobKey: string;
  windowKey: string;
  metadata?: Record<string, unknown>;
}) {
  await withRetryableDatabaseConnectionRetry(() =>
    query(
      `
        update scheduler_run_windows
        set
          status = 'completed',
          metadata = $3::jsonb,
          finished_at = now(),
          updated_at = now()
        where job_key = $1
          and window_key = $2
      `,
      [args.jobKey, args.windowKey, JSON.stringify(args.metadata ?? {})]
    )
  );
}

export async function releaseSchedulerRunWindow(args: {
  jobKey: string;
  windowKey: string;
}) {
  await withRetryableDatabaseConnectionRetry(() =>
    query(
      `
        delete from scheduler_run_windows
        where job_key = $1
          and window_key = $2
      `,
      [args.jobKey, args.windowKey]
    )
  );
}
