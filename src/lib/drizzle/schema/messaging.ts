import { check, customType, foreignKey, index, integer, pgTable, primaryKey, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { desc, sql } from "drizzle-orm";
import { conversations } from "./conversations";
import { users } from "./core";
import { sites } from "./sites";

export const messages = pgTable("messages", {
    id: text("id").primaryKey(),
    conversationId: text("conversation_id").notNull(),
    sender: text("sender").notNull(),
    content: text("content").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
    authorUserId: text("author_user_id"),
  }, (table) => ({
    messagesAuthorUserIdFkey: foreignKey({ name: "messages_author_user_id_fkey", columns: [table.authorUserId], foreignColumns: [users.id] }).onDelete("set null"),
    messagesConversationIdFkey: foreignKey({ name: "messages_conversation_id_fkey", columns: [table.conversationId], foreignColumns: [conversations.id] }).onDelete("cascade"),
    messagesSenderCheck: check("messages_sender_check", sql.raw("(sender = ANY (ARRAY['user'::text, 'team'::text]))")),
    idxMessagesConversationCreatedAt: index("idx_messages_conversation_created_at").on(table.conversationId, desc(table.createdAt)),
  }));

export const messageAttachments = pgTable("message_attachments", {
    id: text("id").primaryKey(),
    messageId: text("message_id").notNull(),
    fileName: text("file_name").notNull(),
    contentType: text("content_type").notNull(),
    sizeBytes: integer("size_bytes").notNull(),
    content: customType<{ data: Uint8Array; driverData: Uint8Array }>({ dataType() { return "bytea"; } })("content").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  }, (table) => ({
    messageAttachmentsMessageIdFkey: foreignKey({ name: "message_attachments_message_id_fkey", columns: [table.messageId], foreignColumns: [messages.id] }).onDelete("cascade"),
    idxMessageAttachmentsMessageId: index("idx_message_attachments_message_id").on(table.messageId, table.createdAt),
  }));

export const conversationTyping = pgTable("conversation_typing", {
    userId: text("user_id").notNull(),
    conversationId: text("conversation_id").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  }, (table) => ({
    conversationTypingPkey: primaryKey({ name: "conversation_typing_pkey", columns: [table.userId, table.conversationId] }),
    conversationTypingConversationIdFkey: foreignKey({ name: "conversation_typing_conversation_id_fkey", columns: [table.conversationId], foreignColumns: [conversations.id] }).onDelete("cascade"),
    conversationTypingUserIdFkey: foreignKey({ name: "conversation_typing_user_id_fkey", columns: [table.userId], foreignColumns: [users.id] }).onDelete("cascade"),
    idxConversationTypingLookup: index("idx_conversation_typing_lookup").on(table.conversationId, desc(table.expiresAt)),
  }));

export const visitorTyping = pgTable("visitor_typing", {
    conversationId: text("conversation_id").notNull(),
    sessionId: text("session_id").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  }, (table) => ({
    visitorTypingPkey: primaryKey({ name: "visitor_typing_pkey", columns: [table.conversationId, table.sessionId] }),
    visitorTypingConversationIdFkey: foreignKey({ name: "visitor_typing_conversation_id_fkey", columns: [table.conversationId], foreignColumns: [conversations.id] }).onDelete("cascade"),
    idxVisitorTypingLookup: index("idx_visitor_typing_lookup").on(table.conversationId, desc(table.expiresAt)),
  }));

export const conversationReads = pgTable("conversation_reads", {
    userId: text("user_id").notNull(),
    conversationId: text("conversation_id").notNull(),
    lastReadAt: timestamp("last_read_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
    unreadCount: integer("unread_count").notNull().default(0),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  }, (table) => ({
    conversationReadsPkey: primaryKey({ name: "conversation_reads_pkey", columns: [table.userId, table.conversationId] }),
    conversationReadsConversationIdFkey: foreignKey({ name: "conversation_reads_conversation_id_fkey", columns: [table.conversationId], foreignColumns: [conversations.id] }).onDelete("cascade"),
    conversationReadsUserIdFkey: foreignKey({ name: "conversation_reads_user_id_fkey", columns: [table.userId], foreignColumns: [users.id] }).onDelete("cascade"),
    idxConversationReadsUserId: index("idx_conversation_reads_user_id").on(table.userId, desc(table.updatedAt)),
  }));

export const emailTemplateDeliveries = pgTable("email_template_deliveries", {
    id: text("id").primaryKey(),
    conversationId: text("conversation_id").notNull(),
    templateKey: text("template_key").notNull(),
    deliveryKey: text("delivery_key").notNull(),
    recipientEmail: text("recipient_email").notNull(),
    status: text("status").notNull().default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
    sentAt: timestamp("sent_at", { withTimezone: true, mode: "date" }),
    userId: text("user_id"),
    attemptCount: integer("attempt_count").notNull().default(0),
    lastError: text("last_error"),
    lastAttemptAt: timestamp("last_attempt_at", { withTimezone: true, mode: "date" }),
    nextAttemptAt: timestamp("next_attempt_at", { withTimezone: true, mode: "date" }),
  }, (table) => ({
    emailTemplateDeliveriesConversationIdFkey: foreignKey({ name: "email_template_deliveries_conversation_id_fkey", columns: [table.conversationId], foreignColumns: [conversations.id] }).onDelete("cascade"),
    emailTemplateDeliveriesStatusCheck: check("email_template_deliveries_status_check", sql.raw("(status = ANY (ARRAY['pending'::text, 'failed'::text, 'sent'::text]))")),
    emailTemplateDeliveriesUserIdFkey: foreignKey({ name: "email_template_deliveries_user_id_fkey", columns: [table.userId], foreignColumns: [users.id] }).onDelete("cascade"),
    emailTemplateDeliveriesDeliveryKeyKey: uniqueIndex("email_template_deliveries_delivery_key_key").on(table.deliveryKey),
    idxEmailTemplateDeliveriesConversation: index("idx_email_template_deliveries_conversation").on(table.conversationId, desc(table.createdAt)),
    idxEmailTemplateDeliveriesRetryQueue: index("idx_email_template_deliveries_retry_queue").on(table.status, table.nextAttemptAt),
  }));

export const mobilePushRegistrations = pgTable("mobile_push_registrations", {
    id: text("id").primaryKey(),
    siteId: text("site_id").notNull(),
    conversationId: text("conversation_id"),
    sessionId: text("session_id").notNull(),
    provider: text("provider").notNull().default("expo"),
    platform: text("platform"),
    appId: text("app_id"),
    bundleId: text("bundle_id"),
    environment: text("environment"),
    pushToken: text("push_token").notNull(),
    disabledAt: timestamp("disabled_at", { withTimezone: true, mode: "date" }),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  }, (table) => ({
    mobilePushRegistrationsConversationIdFkey: foreignKey({ name: "mobile_push_registrations_conversation_id_fkey", columns: [table.conversationId], foreignColumns: [conversations.id] }).onDelete("set null"),
    mobilePushRegistrationsProviderCheck: check("mobile_push_registrations_provider_check", sql.raw("(provider = ANY (ARRAY['expo'::text, 'apns'::text]))")),
    mobilePushRegistrationsEnvironmentCheck: check("mobile_push_registrations_environment_check", sql.raw("(environment IS NULL OR environment = ANY (ARRAY['sandbox'::text, 'production'::text]))")),
    mobilePushRegistrationsSiteIdFkey: foreignKey({ name: "mobile_push_registrations_site_id_fkey", columns: [table.siteId], foreignColumns: [sites.id] }).onDelete("cascade"),
    mobilePushRegistrationsPushTokenKey: uniqueIndex("mobile_push_registrations_push_token_key").on(table.pushToken),
    idxMobilePushRegistrationsConversation: index("idx_mobile_push_registrations_conversation").on(table.conversationId, desc(table.updatedAt)),
    idxMobilePushRegistrationsSiteSession: index("idx_mobile_push_registrations_site_session").on(table.siteId, table.sessionId, desc(table.updatedAt)),
  }));

export const tags = pgTable("tags", {
    conversationId: text("conversation_id").notNull(),
    tag: text("tag").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  }, (table) => ({
    tagsPkey: primaryKey({ name: "tags_pkey", columns: [table.conversationId, table.tag] }),
    tagsConversationIdFkey: foreignKey({ name: "tags_conversation_id_fkey", columns: [table.conversationId], foreignColumns: [conversations.id] }).onDelete("cascade"),
    idxTagsConversationId: index("idx_tags_conversation_id").on(table.conversationId),
  }));
