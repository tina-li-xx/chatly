import type { Pool } from "pg";
import { runBillingSchemaInitialization } from "./db-schema-billing";
import { runConversationSchemaInitialization } from "./db-schema-conversations";
import { runIndexSchemaInitialization } from "./db-schema-indexes";
import { runMarketingSchemaInitialization } from "./db-schema-marketing";
import { runNotificationSchemaInitialization } from "./db-schema-notifications";
import { runReferralSchemaInitialization } from "./db-schema-referrals";
import { runSchedulerRunWindowSchemaInitialization } from "./db-schema-scheduler-run-windows";
import { runSiteSchemaInitialization } from "./db-schema-sites";
import { runVisitorNotesSchemaInitialization } from "./db-schema-visitor-notes";
import { runUserSchemaInitialization } from "./db-schema-users";
import { runVisitorPresenceSchemaInitialization } from "./db-schema-visitor-presence";

export async function runSchemaInitialization(pool: Pool) {
  await runSchedulerRunWindowSchemaInitialization(pool);
  await runUserSchemaInitialization(pool);
  await runNotificationSchemaInitialization(pool);
  await runReferralSchemaInitialization(pool);
  await runBillingSchemaInitialization(pool);
  await runSiteSchemaInitialization(pool);
  await runConversationSchemaInitialization(pool);
  await runVisitorPresenceSchemaInitialization(pool);
  await runVisitorNotesSchemaInitialization(pool);
  await runMarketingSchemaInitialization(pool);
  await runIndexSchemaInitialization(pool);
}
