import type { Pool } from "pg";

export async function runSchedulerRunWindowSchemaInitialization(pool: Pool) {
  await pool.query(`
    create table if not exists scheduler_run_windows (
      job_key text not null,
      window_key text not null,
      status text not null default 'running',
      started_at timestamptz not null default now(),
      finished_at timestamptz,
      updated_at timestamptz not null default now(),
      metadata jsonb not null default '{}'::jsonb,
      constraint scheduler_run_windows_job_window_pk primary key (job_key, window_key)
    )
  `);

  await pool.query(`
    create index if not exists scheduler_run_windows_started_at_idx
      on scheduler_run_windows (started_at)
  `);
}
