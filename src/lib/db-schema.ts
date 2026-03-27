import type { Pool } from "pg";
import { runBillingSchemaInitialization } from "./db-schema-billing";
import { runConversationSchemaInitialization } from "./db-schema-conversations";
import { runIndexSchemaInitialization } from "./db-schema-indexes";
import { runSiteSchemaInitialization } from "./db-schema-sites";
import { runUserSchemaInitialization } from "./db-schema-users";

export async function runSchemaInitialization(pool: Pool) {
  await runUserSchemaInitialization(pool);
  await runBillingSchemaInitialization(pool);
  await runSiteSchemaInitialization(pool);
  await runConversationSchemaInitialization(pool);
  await runIndexSchemaInitialization(pool);
}
