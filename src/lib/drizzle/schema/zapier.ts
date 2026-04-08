import {
  boolean,
  check,
  foreignKey,
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./core";

export const workspaceZapierApiKeys = pgTable(
  "workspace_zapier_api_keys",
  {
    id: text("id").notNull(),
    ownerUserId: text("owner_user_id").notNull(),
    keyPrefix: text("key_prefix").notNull(),
    keyHash: text("key_hash").notNull(),
    keySalt: text("key_salt").notNull(),
    lastUsedAt: timestamp("last_used_at", {
      withTimezone: true,
      mode: "date"
    }),
    revokedAt: timestamp("revoked_at", {
      withTimezone: true,
      mode: "date"
    }),
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
    workspaceZapierApiKeysPkey: primaryKey({
      name: "workspace_zapier_api_keys_pkey",
      columns: [table.id]
    }),
    workspaceZapierApiKeysOwnerUserIdFkey: foreignKey({
      name: "workspace_zapier_api_keys_owner_user_id_fkey",
      columns: [table.ownerUserId],
      foreignColumns: [users.id]
    }).onDelete("cascade"),
    workspaceZapierApiKeysOwnerUpdatedAtIdx: index(
      "workspace_zapier_api_keys_owner_updated_at_idx"
    ).on(table.ownerUserId, table.updatedAt),
    workspaceZapierApiKeysPrefixRevokedAtIdx: index(
      "workspace_zapier_api_keys_prefix_revoked_at_idx"
    ).on(table.keyPrefix, table.revokedAt),
    workspaceZapierApiKeysOwnerRevokedAtIdx: index(
      "workspace_zapier_api_keys_owner_revoked_at_idx"
    ).on(table.ownerUserId, table.revokedAt)
  })
);

export const workspaceZapierWebhooks = pgTable(
  "workspace_zapier_webhooks",
  {
    id: text("id").notNull(),
    ownerUserId: text("owner_user_id").notNull(),
    eventType: text("event_type").notNull(),
    targetUrl: text("target_url").notNull(),
    active: boolean("active").notNull().default(true),
    lastTriggeredAt: timestamp("last_triggered_at", {
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
    workspaceZapierWebhooksPkey: primaryKey({
      name: "workspace_zapier_webhooks_pkey",
      columns: [table.id]
    }),
    workspaceZapierWebhooksOwnerUserIdFkey: foreignKey({
      name: "workspace_zapier_webhooks_owner_user_id_fkey",
      columns: [table.ownerUserId],
      foreignColumns: [users.id]
    }).onDelete("cascade"),
    workspaceZapierWebhooksEventTypeCheck: check(
      "workspace_zapier_webhooks_event_type_check",
      sql.raw(
        "(event_type = ANY (ARRAY['conversation.created'::text, 'conversation.resolved'::text, 'contact.created'::text, 'tag.added'::text]))"
      )
    ),
    workspaceZapierWebhooksOwnerActiveUpdatedAtIdx: index(
      "workspace_zapier_webhooks_owner_active_updated_at_idx"
    ).on(table.ownerUserId, table.active, table.updatedAt),
    workspaceZapierWebhooksOwnerEventActiveIdx: index(
      "workspace_zapier_webhooks_owner_event_active_idx"
    ).on(table.ownerUserId, table.eventType, table.active),
    workspaceZapierWebhooksOwnerEventTargetUrlIdx: uniqueIndex(
      "workspace_zapier_webhooks_owner_event_target_url_idx"
    ).on(table.ownerUserId, table.eventType, table.targetUrl)
  })
);
