import "server-only";

import type { Pool, QueryResultRow } from "pg";
import { getDatabaseConfig } from "@/lib/env.server";
import { runSchemaInitialization } from "@/lib/db-schema";

declare global {
  // eslint-disable-next-line no-var
  var __chatlyPool: Pool | undefined;
  // eslint-disable-next-line no-var
  var __chatlyPoolReady: Promise<Pool> | undefined;
  // eslint-disable-next-line no-var
  var __chatlySchemaReady: Promise<void> | undefined;
  // eslint-disable-next-line no-var
  var __chatlySchemaVersion: string | undefined;
}

const SCHEMA_VERSION = "2026-03-31-site-widget-copy-schema";

async function createPool() {
  const config = getDatabaseConfig();
  const { Pool } = await import("pg");

  return new Pool({
    connectionString: config.connectionString
  });
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

export async function ensureSchema() {
  if (
    !global.__chatlySchemaReady ||
    global.__chatlySchemaVersion !== SCHEMA_VERSION
  ) {
    global.__chatlySchemaVersion = SCHEMA_VERSION;
    global.__chatlySchemaReady = (async () => {
      await runSchemaInitialization(await getPool());
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
