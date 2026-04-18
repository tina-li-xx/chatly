import { boolean, check, foreignKey, index, integer, pgTable, smallint, text, timestamp } from "drizzle-orm/pg-core";
import { desc, sql } from "drizzle-orm";
import { users } from "./core";
import { sites } from "./sites";

export const conversations = pgTable("conversations", {
    id: text("id").primaryKey(),
    siteId: text("site_id").notNull(),
    email: text("email"),
    sessionId: text("session_id").notNull(),
    recordedPageUrl: text("recorded_page_url"),
    recordedReferrer: text("recorded_referrer"),
    recordedUserAgent: text("recorded_user_agent"),
    recordedCountry: text("recorded_country"),
    recordedRegion: text("recorded_region"),
    recordedCity: text("recorded_city"),
    recordedTimezone: text("recorded_timezone"),
    recordedLocale: text("recorded_locale"),
    lastMessageAt: timestamp("last_message_at", { withTimezone: true, mode: "date" }),
    lastMessagePreview: text("last_message_preview"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
    status: text("status").notNull().default("open"),
    assignedUserId: text("assigned_user_id"),
    faqHandoffPending: boolean("faq_handoff_pending").notNull().default(false),
    faqHandoffPreview: text("faq_handoff_preview"),
    faqHandoffAttachmentsCount: integer("faq_handoff_attachments_count").notNull().default(0),
    faqHandoffIsNewVisitor: boolean("faq_handoff_is_new_visitor").notNull().default(false),
    faqHandoffHighIntent: boolean("faq_handoff_high_intent").notNull().default(false),
    faqHandoffSuggestionsJson: text("faq_handoff_suggestions_json"),
  }, (table) => ({
    conversationsAssignedUserIdFkey: foreignKey({ name: "conversations_assigned_user_id_fkey", columns: [table.assignedUserId], foreignColumns: [users.id] }).onDelete("set null"),
    conversationsSiteIdFkey: foreignKey({ name: "conversations_site_id_fkey", columns: [table.siteId], foreignColumns: [sites.id] }).onDelete("cascade"),
    conversationsStatusCheck: check("conversations_status_check", sql.raw("(status = ANY (ARRAY['open'::text, 'resolved'::text]))")),
    idxConversationsSiteId: index("idx_conversations_site_id").on(table.siteId, desc(table.updatedAt)),
    idxConversationsUpdatedAt: index("idx_conversations_updated_at").on(desc(table.updatedAt)),
  }));

export const conversationMetadata = pgTable("conversation_metadata", {
    conversationId: text("conversation_id").primaryKey(),
    pageUrl: text("page_url"),
    referrer: text("referrer"),
    userAgent: text("user_agent"),
    country: text("country"),
    region: text("region"),
    city: text("city"),
    timezone: text("timezone"),
    locale: text("locale"),
  }, (table) => ({
    conversationMetadataConversationIdFkey: foreignKey({ name: "conversation_metadata_conversation_id_fkey", columns: [table.conversationId], foreignColumns: [conversations.id] }).onDelete("cascade"),
  }));

export const feedback = pgTable("feedback", {
    conversationId: text("conversation_id").primaryKey(),
    helpful: boolean("helpful").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
    rating: smallint("rating"),
  }, (table) => ({
    feedbackConversationIdFkey: foreignKey({ name: "feedback_conversation_id_fkey", columns: [table.conversationId], foreignColumns: [conversations.id] }).onDelete("cascade"),
    feedbackRatingCheck: check("feedback_rating_check", sql.raw("((rating >= 1) AND (rating <= 5))")),
  }));
