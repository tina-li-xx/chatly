import "server-only";

import { getPool } from "@/lib/db";

export type PostgresAdvisoryLockKey = readonly [number, number];

export async function withPostgresAdvisoryLock<T>(
  lockKey: PostgresAdvisoryLockKey,
  task: () => Promise<T>
) {
  const pool = await getPool();
  const client = await pool.connect();
  let destroyClient = false;
  let acquired = false;

  try {
    const { rows } = await client.query<{ locked: boolean }>(
      "select pg_try_advisory_lock($1, $2) as locked",
      [...lockKey]
    );

    if (!rows[0]?.locked) {
      return {
        acquired: false as const,
        value: undefined
      };
    }

    acquired = true;
    let value!: T;

    try {
      value = await task();
    } finally {
      if (acquired) {
        try {
          const unlockResult = await client.query<{ unlocked: boolean }>(
            "select pg_advisory_unlock($1, $2) as unlocked",
            [...lockKey]
          );

          if (!unlockResult.rows[0]?.unlocked) {
            destroyClient = true;
          }
        } catch (error) {
          destroyClient = true;
          throw error;
        }
      }
    }

    return {
      acquired: true as const,
      value
    };
  } finally {
    client.release(destroyClient);
  }
}
