import { date, foreignKey, index, jsonb, pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./core";
import { sites } from "./sites";

export const schedulerRunWindows = pgTable("scheduler_run_windows", {
    jobKey: text("job_key").notNull(),
    windowKey: text("window_key").notNull(),
    status: text("status").notNull().default("running"),
    startedAt: timestamp("started_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
    finishedAt: timestamp("finished_at", { withTimezone: true, mode: "date" }),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
    metadata: jsonb("metadata").notNull().default(sql.raw("'{}'::jsonb")),
  }, (table) => ({
    schedulerRunWindowsJobWindowPk: primaryKey({ name: "scheduler_run_windows_job_window_pk", columns: [table.jobKey, table.windowKey] }),
    schedulerRunWindowsStartedAtIdx: index("scheduler_run_windows_started_at_idx").on(table.startedAt),
  }));

export const growthEmailNudges = pgTable("growth_email_nudges", {
    userId: text("user_id").notNull(),
    nudgeKey: text("nudge_key").notNull(),
    lastSentAt: timestamp("last_sent_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  }, (table) => ({
    growthEmailNudgesPkey: primaryKey({ name: "growth_email_nudges_pkey", columns: [table.userId, table.nudgeKey] }),
    growthEmailNudgesUserIdFkey: foreignKey({ name: "growth_email_nudges_user_id_fkey", columns: [table.userId], foreignColumns: [users.id] }).onDelete("cascade"),
  }));

export const dailyDigestDeliveries = pgTable("daily_digest_deliveries", {
    userId: text("user_id").notNull(),
    digestDate: date("digest_date", { mode: "string" }).notNull(),
    sentAt: timestamp("sent_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
    ownerUserId: text("owner_user_id").notNull(),
  }, (table) => ({
    dailyDigestDeliveriesPkey: primaryKey({ name: "daily_digest_deliveries_pkey", columns: [table.userId, table.ownerUserId, table.digestDate] }),
    dailyDigestDeliveriesOwnerUserIdFkey: foreignKey({ name: "daily_digest_deliveries_owner_user_id_fkey", columns: [table.ownerUserId], foreignColumns: [users.id] }).onDelete("cascade"),
    dailyDigestDeliveriesUserIdFkey: foreignKey({ name: "daily_digest_deliveries_user_id_fkey", columns: [table.userId], foreignColumns: [users.id] }).onDelete("cascade"),
  }));

export const weeklyPerformanceDeliveries = pgTable("weekly_performance_deliveries", {
    userId: text("user_id").notNull(),
    weekStart: date("week_start", { mode: "string" }).notNull(),
    sentAt: timestamp("sent_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
    ownerUserId: text("owner_user_id").notNull(),
  }, (table) => ({
    weeklyPerformanceDeliveriesPkey: primaryKey({ name: "weekly_performance_deliveries_pkey", columns: [table.userId, table.ownerUserId, table.weekStart] }),
    weeklyPerformanceDeliveriesOwnerUserIdFkey: foreignKey({ name: "weekly_performance_deliveries_owner_user_id_fkey", columns: [table.ownerUserId], foreignColumns: [users.id] }).onDelete("cascade"),
    weeklyPerformanceDeliveriesUserIdFkey: foreignKey({ name: "weekly_performance_deliveries_user_id_fkey", columns: [table.userId], foreignColumns: [users.id] }).onDelete("cascade"),
  }));

export const weeklyPerformanceSnapshots = pgTable("weekly_performance_snapshots", {
    ownerUserId: text("owner_user_id").notNull(),
    weekStart: date("week_start", { mode: "string" }).notNull(),
    snapshotJson: text("snapshot_json").notNull(),
    generatedAt: timestamp("generated_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  }, (table) => ({
    weeklyPerformanceSnapshotsPkey: primaryKey({ name: "weekly_performance_snapshots_pkey", columns: [table.ownerUserId, table.weekStart] }),
    weeklyPerformanceSnapshotsOwnerUserIdFkey: foreignKey({ name: "weekly_performance_snapshots_owner_user_id_fkey", columns: [table.ownerUserId], foreignColumns: [users.id] }).onDelete("cascade"),
  }));

export const contactEvents = pgTable("contact_events", {
    id: text("id").notNull(),
    ownerUserId: text("owner_user_id").notNull(),
    siteId: text("site_id"),
    contactEmail: text("contact_email"),
    eventType: text("event_type").notNull(),
    actorUserId: text("actor_user_id"),
    metadataJson: jsonb("metadata_json").notNull().default(sql.raw("'{}'::jsonb")),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  }, (table) => ({
    contactEventsPkey: primaryKey({ name: "contact_events_pkey", columns: [table.id] }),
    contactEventsActorUserIdFkey: foreignKey({ name: "contact_events_actor_user_id_fkey", columns: [table.actorUserId], foreignColumns: [users.id] }).onDelete("set null"),
    contactEventsOwnerUserIdFkey: foreignKey({ name: "contact_events_owner_user_id_fkey", columns: [table.ownerUserId], foreignColumns: [users.id] }).onDelete("cascade"),
    contactEventsSiteIdFkey: foreignKey({ name: "contact_events_site_id_fkey", columns: [table.siteId], foreignColumns: [sites.id] }).onDelete("set null"),
    contactEventsOwnerCreatedAtIdx: index("contact_events_owner_created_at_idx").on(table.ownerUserId, table.createdAt),
    contactEventsEventTypeCreatedAtIdx: index("contact_events_event_type_created_at_idx").on(table.eventType, table.createdAt),
    contactEventsSiteEmailCreatedAtIdx: index("contact_events_site_email_created_at_idx").on(table.siteId, table.contactEmail, table.createdAt),
  }));

export const aiAssistEvents = pgTable("ai_assist_events", {
    id: text("id").notNull(),
    ownerUserId: text("owner_user_id").notNull(),
    actorUserId: text("actor_user_id"),
    conversationId: text("conversation_id"),
    feature: text("feature").notNull(),
    action: text("action").notNull(),
    metadataJson: jsonb("metadata_json").notNull().default(sql.raw("'{}'::jsonb")),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  }, (table) => ({
    aiAssistEventsPkey: primaryKey({ name: "ai_assist_events_pkey", columns: [table.id] }),
    aiAssistEventsActorUserIdFkey: foreignKey({ name: "ai_assist_events_actor_user_id_fkey", columns: [table.actorUserId], foreignColumns: [users.id] }).onDelete("set null"),
    aiAssistEventsOwnerUserIdFkey: foreignKey({ name: "ai_assist_events_owner_user_id_fkey", columns: [table.ownerUserId], foreignColumns: [users.id] }).onDelete("cascade"),
    aiAssistEventsOwnerCreatedAtIdx: index("ai_assist_events_owner_created_at_idx").on(table.ownerUserId, table.createdAt),
    aiAssistEventsOwnerActorCreatedAtIdx: index("ai_assist_events_owner_actor_created_at_idx").on(table.ownerUserId, table.actorUserId, table.createdAt),
    aiAssistEventsOwnerFeatureCreatedAtIdx: index("ai_assist_events_owner_feature_created_at_idx").on(table.ownerUserId, table.feature, table.createdAt),
    aiAssistEventsConversationCreatedAtIdx: index("ai_assist_events_conversation_created_at_idx").on(table.conversationId, table.createdAt),
  }));

export const aiAssistWarningDeliveries = pgTable("ai_assist_warning_deliveries", {
    userId: text("user_id").notNull(),
    ownerUserId: text("owner_user_id").notNull(),
    cycleStart: date("cycle_start", { mode: "string" }).notNull(),
    warningKey: text("warning_key").notNull(),
    sentAt: timestamp("sent_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  }, (table) => ({
    aiAssistWarningDeliveriesPkey: primaryKey({ name: "ai_assist_warning_deliveries_pkey", columns: [table.userId, table.ownerUserId, table.cycleStart, table.warningKey] }),
    aiAssistWarningDeliveriesOwnerUserIdFkey: foreignKey({ name: "ai_assist_warning_deliveries_owner_user_id_fkey", columns: [table.ownerUserId], foreignColumns: [users.id] }).onDelete("cascade"),
    aiAssistWarningDeliveriesUserIdFkey: foreignKey({ name: "ai_assist_warning_deliveries_user_id_fkey", columns: [table.userId], foreignColumns: [users.id] }).onDelete("cascade"),
    aiAssistWarningDeliveriesOwnerCycleIdx: index("ai_assist_warning_deliveries_owner_cycle_idx").on(table.ownerUserId, table.cycleStart, table.warningKey),
  }));
