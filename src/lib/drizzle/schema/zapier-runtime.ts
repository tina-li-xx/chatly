import {
  foreignKey,
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex
} from "drizzle-orm/pg-core";
import { users } from "./core";
import {
  workspaceZapierApiKeys,
  workspaceZapierWebhooks
} from "./zapier";

export const workspaceZapierDeliveries = pgTable(
  "workspace_zapier_deliveries",
  {
    id: text("id").notNull(),
    ownerUserId: text("owner_user_id").notNull(),
    webhookId: text("webhook_id").notNull(),
    eventType: text("event_type").notNull(),
    eventKey: text("event_key").notNull(),
    payloadJson: text("payload_json").notNull(),
    attemptCount: integer("attempt_count").notNull().default(0),
    nextAttemptAt: timestamp("next_attempt_at", {
      withTimezone: true,
      mode: "date"
    }),
    deliveredAt: timestamp("delivered_at", {
      withTimezone: true,
      mode: "date"
    }),
    lastAttemptAt: timestamp("last_attempt_at", {
      withTimezone: true,
      mode: "date"
    }),
    lastResponseCode: integer("last_response_code"),
    lastResponseBody: text("last_response_body"),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "date"
    })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "date"
    })
      .notNull()
      .defaultNow()
  },
  (table) => ({
    workspaceZapierDeliveriesPkey: primaryKey({
      name: "workspace_zapier_deliveries_pkey",
      columns: [table.id]
    }),
    workspaceZapierDeliveriesOwnerUserIdFkey: foreignKey({
      name: "workspace_zapier_deliveries_owner_user_id_fkey",
      columns: [table.ownerUserId],
      foreignColumns: [users.id]
    }).onDelete("cascade"),
    workspaceZapierDeliveriesWebhookIdFkey: foreignKey({
      name: "workspace_zapier_deliveries_webhook_id_fkey",
      columns: [table.webhookId],
      foreignColumns: [workspaceZapierWebhooks.id]
    }).onDelete("cascade"),
    workspaceZapierDeliveriesWebhookEventKeyIdx: uniqueIndex(
      "workspace_zapier_deliveries_webhook_event_key_idx"
    ).on(table.webhookId, table.eventType, table.eventKey),
    workspaceZapierDeliveriesOwnerUpdatedAtIdx: index(
      "workspace_zapier_deliveries_owner_updated_at_idx"
    ).on(table.ownerUserId, table.updatedAt),
    workspaceZapierDeliveriesNextAttemptAtIdx: index(
      "workspace_zapier_deliveries_next_attempt_at_idx"
    ).on(table.nextAttemptAt, table.deliveredAt)
  })
);

export const workspaceZapierIdempotencyKeys = pgTable(
  "workspace_zapier_idempotency_keys",
  {
    apiKeyId: text("api_key_id").notNull(),
    ownerUserId: text("owner_user_id").notNull(),
    idempotencyKey: text("idempotency_key").notNull(),
    requestHash: text("request_hash").notNull(),
    responseStatus: integer("response_status").notNull(),
    responseJson: text("response_json").notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "date"
    })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "date"
    })
      .notNull()
      .defaultNow()
  },
  (table) => ({
    workspaceZapierIdempotencyKeysPkey: primaryKey({
      name: "workspace_zapier_idempotency_keys_pkey",
      columns: [table.apiKeyId, table.idempotencyKey]
    }),
    workspaceZapierIdempotencyKeysApiKeyIdFkey: foreignKey({
      name: "workspace_zapier_idempotency_keys_api_key_id_fkey",
      columns: [table.apiKeyId],
      foreignColumns: [workspaceZapierApiKeys.id]
    }).onDelete("cascade"),
    workspaceZapierIdempotencyKeysOwnerUserIdFkey: foreignKey({
      name: "workspace_zapier_idempotency_keys_owner_user_id_fkey",
      columns: [table.ownerUserId],
      foreignColumns: [users.id]
    }).onDelete("cascade"),
    workspaceZapierIdempotencyKeysOwnerUpdatedAtIdx: index(
      "workspace_zapier_idempotency_keys_owner_updated_at_idx"
    ).on(table.ownerUserId, table.updatedAt)
  })
);
