import { Pool, type QueryResultRow } from "pg";
import { getRequiredServerEnv } from "@/lib/env.server";
import { runSchemaInitialization } from "@/lib/db-schema";

declare global {
  // eslint-disable-next-line no-var
  var __chatlyPool: Pool | undefined;
  // eslint-disable-next-line no-var
  var __chatlySchemaReady: Promise<void> | undefined;
  // eslint-disable-next-line no-var
  var __chatlySchemaVersion: string | undefined;
}

const SCHEMA_VERSION = "2026-03-27-widget-install-urls";

function getConnectionString() {
  return getRequiredServerEnv("DATABASE_URL");
}

function createPool() {
  return new Pool({
    connectionString: getConnectionString(),
    ssl:
      process.env.DATABASE_SSL === "require"
        ? { rejectUnauthorized: false }
        : undefined
  });
}

export function getPool() {
  if (!global.__chatlyPool) {
    global.__chatlyPool = createPool();
  }

  return global.__chatlyPool;
}

async function initSchema() {
  await runSchemaInitialization(getPool());
}

export async function ensureSchema() {
  if (
    !global.__chatlySchemaReady ||
    global.__chatlySchemaVersion !== SCHEMA_VERSION
  ) {
    global.__chatlySchemaVersion = SCHEMA_VERSION;
    global.__chatlySchemaReady = initSchema().catch((error) => {
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
  return getPool().query<T>(text, values);
}
