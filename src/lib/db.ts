import "server-only";

import { drizzle } from "drizzle-orm/node-postgres";
import type { Pool, QueryResultRow } from "pg";
import { runDrizzleMigrations } from "@/lib/drizzle/migrate";
import * as schema from "@/lib/drizzle/schema";
import { getDatabaseConfig } from "@/lib/env.server";

function createDb(pool: Pool) {
  return drizzle(pool, { schema });
}

type ChatlyDb = ReturnType<typeof createDb>;

declare global {
  // eslint-disable-next-line no-var
  var __chattingPool: Pool | undefined;
  // eslint-disable-next-line no-var
  var __chattingPoolReady: Promise<Pool> | undefined;
  // eslint-disable-next-line no-var
  var __chattingSchemaReady: Promise<void> | undefined;
  // eslint-disable-next-line no-var
  var __chattingSchemaVersion: string | undefined;
  // eslint-disable-next-line no-var
  var __chattingDb: ChatlyDb | undefined;
}

const SCHEMA_VERSION = "2026-04-07-workspace-zapier-delivery-queue";
const SCHEMA_LOCK_KEY = [20260401, 1] as const;

async function createPool() {
  const config = getDatabaseConfig();
  const { Pool } = await import("pg");

  return new Pool({
    connectionString: config.connectionString
  });
}

async function runMigrationsWithLock(pool: Pool) {
  const client = await pool.connect();
  let destroyClient = false;

  try {
    await client.query("select pg_advisory_lock($1, $2)", [...SCHEMA_LOCK_KEY]);

    try {
      await runDrizzleMigrations(pool);
    } finally {
      try {
        const unlockResult = await client.query<{ unlocked: boolean }>(
          "select pg_advisory_unlock($1, $2) as unlocked",
          [...SCHEMA_LOCK_KEY]
        );

        if (!unlockResult.rows[0]?.unlocked) {
          destroyClient = true;
        }
      } catch (error) {
        destroyClient = true;
        throw error;
      }
    }
  } finally {
    client.release(destroyClient);
  }
}

export async function getPool() {
  if (global.__chattingPool) {
    return global.__chattingPool;
  }

  if (!global.__chattingPoolReady) {
    global.__chattingPoolReady = createPool()
      .then((pool) => {
        global.__chattingPool = pool;
        return pool;
      })
      .catch((error) => {
        global.__chattingPoolReady = undefined;
        throw error;
      });
  }

  return global.__chattingPoolReady;
}

export async function getDb() {
  if (global.__chattingDb) {
    return global.__chattingDb;
  }

  const db = createDb(await getPool());
  global.__chattingDb = db;
  return db;
}

export async function ensureSchema() {
  if (
    !global.__chattingSchemaReady ||
    global.__chattingSchemaVersion !== SCHEMA_VERSION
  ) {
    global.__chattingSchemaVersion = SCHEMA_VERSION;
    global.__chattingSchemaReady = (async () => {
      await runMigrationsWithLock(await getPool());
    })().catch((error) => {
      if (global.__chattingSchemaVersion === SCHEMA_VERSION) {
        global.__chattingSchemaReady = undefined;
      }

      throw error;
    });
  }

  await global.__chattingSchemaReady;
}

export async function query<T extends QueryResultRow>(text: string, values?: unknown[]) {
  await ensureSchema();
  return (await getPool()).query<T>(text, values);
}
