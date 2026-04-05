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
  var __chatlyPool: Pool | undefined;
  // eslint-disable-next-line no-var
  var __chatlyPoolReady: Promise<Pool> | undefined;
  // eslint-disable-next-line no-var
  var __chatlySchemaReady: Promise<void> | undefined;
  // eslint-disable-next-line no-var
  var __chatlySchemaVersion: string | undefined;
  // eslint-disable-next-line no-var
  var __chatlyDb: ChatlyDb | undefined;
}

const SCHEMA_VERSION = "2026-04-05-contact-list-indexes";
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
  if (global.__chatlyPool) {
    return global.__chatlyPool;
  }

  if (!global.__chatlyPoolReady) {
    global.__chatlyPoolReady = createPool()
      .then((pool) => {
        global.__chatlyPool = pool;
        return pool;
      })
      .catch((error) => {
        global.__chatlyPoolReady = undefined;
        throw error;
      });
  }

  return global.__chatlyPoolReady;
}

export async function getDb() {
  if (global.__chatlyDb) {
    return global.__chatlyDb;
  }

  const db = createDb(await getPool());
  global.__chatlyDb = db;
  return db;
}

export async function ensureSchema() {
  if (
    !global.__chatlySchemaReady ||
    global.__chatlySchemaVersion !== SCHEMA_VERSION
  ) {
    global.__chatlySchemaVersion = SCHEMA_VERSION;
    global.__chatlySchemaReady = (async () => {
      await runMigrationsWithLock(await getPool());
    })().catch((error) => {
      if (global.__chatlySchemaVersion === SCHEMA_VERSION) {
        global.__chatlySchemaReady = undefined;
      }

      throw error;
    });
  }

  await global.__chatlySchemaReady;
}

export async function query<T extends QueryResultRow>(text: string, values?: unknown[]) {
  await ensureSchema();
  return (await getPool()).query<T>(text, values);
}
