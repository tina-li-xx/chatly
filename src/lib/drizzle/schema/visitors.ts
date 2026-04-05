import { check, foreignKey, index, jsonb, pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";
import { desc, sql } from "drizzle-orm";
import { conversations } from "./conversations";
import { users } from "./core";
import { sites } from "./sites";

export const visitorPresenceSessions = pgTable("visitor_presence_sessions", {
    siteId: text("site_id").notNull(),
    sessionId: text("session_id").notNull(),
    conversationId: text("conversation_id"),
    email: text("email"),
    currentPageUrl: text("current_page_url"),
    referrer: text("referrer"),
    userAgent: text("user_agent"),
    country: text("country"),
    region: text("region"),
    city: text("city"),
    timezone: text("timezone"),
    locale: text("locale"),
    tagsJson: jsonb("tags_json").notNull().default(sql.raw("'[]'::jsonb")),
    customFieldsJson: jsonb("custom_fields_json").notNull().default(sql.raw("'{}'::jsonb")),
    startedAt: timestamp("started_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  }, (table) => ({
    visitorPresenceSessionsPkey: primaryKey({ name: "visitor_presence_sessions_pkey", columns: [table.siteId, table.sessionId] }),
    visitorPresenceSessionsConversationIdFkey: foreignKey({ name: "visitor_presence_sessions_conversation_id_fkey", columns: [table.conversationId], foreignColumns: [conversations.id] }).onDelete("set null"),
    visitorPresenceSessionsSiteIdFkey: foreignKey({ name: "visitor_presence_sessions_site_id_fkey", columns: [table.siteId], foreignColumns: [sites.id] }).onDelete("cascade"),
    idxVisitorPresenceConversationLastSeen: index("idx_visitor_presence_conversation_last_seen").on(table.conversationId, desc(table.lastSeenAt)),
    idxVisitorPresenceSiteLastSeen: index("idx_visitor_presence_site_last_seen").on(table.siteId, desc(table.lastSeenAt)),
  }));

export const visitorContacts = pgTable("visitor_contacts", {
    siteId: text("site_id").notNull(),
    email: text("email").notNull(),
    latestConversationId: text("latest_conversation_id"),
    latestSessionId: text("latest_session_id"),
    tagsJson: jsonb("tags_json").notNull().default(sql.raw("'[]'::jsonb")),
    customFieldsJson: jsonb("custom_fields_json").notNull().default(sql.raw("'{}'::jsonb")),
    firstSeenAt: timestamp("first_seen_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  }, (table) => ({
    visitorContactsPkey: primaryKey({ name: "visitor_contacts_pkey", columns: [table.siteId, table.email] }),
    visitorContactsLatestConversationIdFkey: foreignKey({ name: "visitor_contacts_latest_conversation_id_fkey", columns: [table.latestConversationId], foreignColumns: [conversations.id] }).onDelete("set null"),
    visitorContactsSiteIdFkey: foreignKey({ name: "visitor_contacts_site_id_fkey", columns: [table.siteId], foreignColumns: [sites.id] }).onDelete("cascade"),
    idxVisitorContactsConversationLastSeen: index("idx_visitor_contacts_conversation_last_seen").on(table.latestConversationId, desc(table.lastSeenAt)),
    idxVisitorContactsSiteLastSeen: index("idx_visitor_contacts_site_last_seen").on(table.siteId, desc(table.lastSeenAt)),
  }));

export const visitorNotes = pgTable("visitor_notes", {
    siteId: text("site_id").notNull(),
    identityType: text("identity_type").notNull(),
    identityValue: text("identity_value").notNull(),
    note: text("note").notNull(),
    updatedByUserId: text("updated_by_user_id"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
    mentionsJson: jsonb("mentions_json").notNull().default(sql.raw("'[]'::jsonb")),
  }, (table) => ({
    visitorNotesPkey: primaryKey({ name: "visitor_notes_pkey", columns: [table.siteId, table.identityType, table.identityValue] }),
    visitorNotesIdentityTypeCheck: check("visitor_notes_identity_type_check", sql.raw("(identity_type = ANY (ARRAY['email'::text, 'session'::text]))")),
    visitorNotesSiteIdFkey: foreignKey({ name: "visitor_notes_site_id_fkey", columns: [table.siteId], foreignColumns: [sites.id] }).onDelete("cascade"),
    visitorNotesUpdatedByUserIdFkey: foreignKey({ name: "visitor_notes_updated_by_user_id_fkey", columns: [table.updatedByUserId], foreignColumns: [users.id] }).onDelete("set null"),
    idxVisitorNotesSiteUpdatedAt: index("idx_visitor_notes_site_updated_at").on(table.siteId, desc(table.updatedAt)),
  }));
