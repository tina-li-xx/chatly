import { check, foreignKey, index, integer, pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./core";
import { conversations } from "./conversations";

export const workspaceIntegrations = pgTable("workspace_integrations", {
    ownerUserId: text("owner_user_id").notNull(),
    provider: text("provider").notNull(),
    status: text("status").notNull().default("connected"),
    accountLabel: text("account_label"),
    externalAccountId: text("external_account_id"),
    settingsJson: text("settings_json").notNull().default(""),
    credentialsJson: text("credentials_json").notNull().default(""),
    errorMessage: text("error_message"),
    connectedAt: timestamp("connected_at", { withTimezone: true, mode: "date" }),
    lastValidatedAt: timestamp("last_validated_at", { withTimezone: true, mode: "date" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  }, (table) => ({
    workspaceIntegrationsPkey: primaryKey({ name: "workspace_integrations_pkey", columns: [table.ownerUserId, table.provider] }),
    workspaceIntegrationsOwnerUserIdFkey: foreignKey({ name: "workspace_integrations_owner_user_id_fkey", columns: [table.ownerUserId], foreignColumns: [users.id] }).onDelete("cascade"),
    workspaceIntegrationsProviderCheck: check("workspace_integrations_provider_check", sql.raw("(provider = ANY (ARRAY['slack'::text, 'zapier'::text, 'shopify'::text]))")),
    workspaceIntegrationsStatusCheck: check("workspace_integrations_status_check", sql.raw("(status = ANY (ARRAY['connected'::text, 'reconnect'::text, 'error'::text]))")),
    workspaceIntegrationsOwnerUpdatedAtIdx: index("workspace_integrations_owner_updated_at_idx").on(table.ownerUserId, table.updatedAt),
  }));

export const workspaceWebhooks = pgTable("workspace_webhooks", {
    id: text("id").notNull(),
    ownerUserId: text("owner_user_id").notNull(),
    url: text("url").notNull(),
    eventsJson: text("events_json").notNull().default("[]"),
    secret: text("secret").notNull().default(""),
    status: text("status").notNull().default("active"),
    lastTriggeredAt: timestamp("last_triggered_at", { withTimezone: true, mode: "date" }),
    lastResponseCode: integer("last_response_code"),
    lastResponseBody: text("last_response_body"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  }, (table) => ({
    workspaceWebhooksPkey: primaryKey({ name: "workspace_webhooks_pkey", columns: [table.id] }),
    workspaceWebhooksOwnerUserIdFkey: foreignKey({ name: "workspace_webhooks_owner_user_id_fkey", columns: [table.ownerUserId], foreignColumns: [users.id] }).onDelete("cascade"),
    workspaceWebhooksStatusCheck: check("workspace_webhooks_status_check", sql.raw("(status = ANY (ARRAY['active'::text, 'disabled'::text]))")),
    workspaceWebhooksOwnerUpdatedAtIdx: index("workspace_webhooks_owner_updated_at_idx").on(table.ownerUserId, table.updatedAt),
    workspaceWebhooksOwnerStatusUpdatedAtIdx: index("workspace_webhooks_owner_status_updated_at_idx").on(table.ownerUserId, table.status, table.updatedAt),
  }));

export const workspaceSlackThreads = pgTable("workspace_slack_threads", {
    conversationId: text("conversation_id").notNull(),
    ownerUserId: text("owner_user_id").notNull(),
    slackTeamId: text("slack_team_id").notNull(),
    slackChannelId: text("slack_channel_id").notNull(),
    slackChannelName: text("slack_channel_name"),
    slackMessageTs: text("slack_message_ts").notNull(),
    slackThreadTs: text("slack_thread_ts").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  }, (table) => ({
    workspaceSlackThreadsPkey: primaryKey({ name: "workspace_slack_threads_pkey", columns: [table.conversationId] }),
    workspaceSlackThreadsConversationIdFkey: foreignKey({ name: "workspace_slack_threads_conversation_id_fkey", columns: [table.conversationId], foreignColumns: [conversations.id] }).onDelete("cascade"),
    workspaceSlackThreadsOwnerUserIdFkey: foreignKey({ name: "workspace_slack_threads_owner_user_id_fkey", columns: [table.ownerUserId], foreignColumns: [users.id] }).onDelete("cascade"),
    workspaceSlackThreadsTeamChannelThreadIdx: index("workspace_slack_threads_team_channel_thread_idx").on(table.slackTeamId, table.slackChannelId, table.slackThreadTs),
    workspaceSlackThreadsOwnerUpdatedAtIdx: index("workspace_slack_threads_owner_updated_at_idx").on(table.ownerUserId, table.updatedAt),
  }));
