import { query } from "@/lib/db";
import type { ConversationRating, ConversationStatus } from "@/lib/types";
import type { MessageRow } from "@/lib/repositories/shared-repository";

export async function insertConversationRecord(input: {
  conversationId: string;
  siteId: string;
  email: string | null;
  sessionId: string;
}) {
  await query(
    `
      INSERT INTO conversations (id, site_id, email, session_id)
      VALUES ($1, $2, $3, $4)
    `,
    [input.conversationId, input.siteId, input.email, input.sessionId]
  );
}

export async function setConversationFaqHandoffState(input: {
  conversationId: string;
  preview: string;
  attachmentsCount: number;
  isNewVisitor: boolean;
  highIntent: boolean;
  suggestionsJson: string | null;
}) {
  await query(
    `
      UPDATE conversations
      SET faq_handoff_pending = TRUE,
          faq_handoff_preview = $2,
          faq_handoff_attachments_count = $3,
          faq_handoff_is_new_visitor = $4,
          faq_handoff_high_intent = $5,
          faq_handoff_suggestions_json = $6,
          updated_at = NOW()
      WHERE id = $1
    `,
    [
      input.conversationId,
      input.preview,
      input.attachmentsCount,
      input.isNewVisitor,
      input.highIntent,
      input.suggestionsJson
    ]
  );
}

export async function clearConversationFaqHandoffState(conversationId: string) {
  await query(
    `
      UPDATE conversations
      SET faq_handoff_pending = FALSE,
          faq_handoff_preview = NULL,
          faq_handoff_attachments_count = 0,
          faq_handoff_is_new_visitor = FALSE,
          faq_handoff_high_intent = FALSE,
          faq_handoff_suggestions_json = NULL,
          updated_at = NOW()
      WHERE id = $1
    `,
    [conversationId]
  );
}

export async function upsertConversationMetadataRecord(input: {
  conversationId: string;
  pageUrl: string | null;
  referrer: string | null;
  userAgent: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  timezone: string | null;
  locale: string | null;
}) {
  await query(
    `
      INSERT INTO conversation_metadata (
        conversation_id,
        page_url,
        referrer,
        user_agent,
        country,
        region,
        city,
        timezone,
        locale
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (conversation_id)
      DO UPDATE SET
        page_url = COALESCE(conversation_metadata.page_url, EXCLUDED.page_url),
        referrer = EXCLUDED.referrer,
        user_agent = EXCLUDED.user_agent,
        country = COALESCE(EXCLUDED.country, conversation_metadata.country),
        region = COALESCE(EXCLUDED.region, conversation_metadata.region),
        city = COALESCE(EXCLUDED.city, conversation_metadata.city),
        timezone = COALESCE(EXCLUDED.timezone, conversation_metadata.timezone),
        locale = COALESCE(EXCLUDED.locale, conversation_metadata.locale)
    `,
    [
      input.conversationId,
      input.pageUrl,
      input.referrer,
      input.userAgent,
      input.country,
      input.region,
      input.city,
      input.timezone,
      input.locale
    ]
  );
}

export async function insertMessageRecord(input: {
  messageId: string;
  conversationId: string;
  sender: "user" | "team";
  authorUserId?: string | null;
  content: string;
}) {
  const result = await query<MessageRow>(
    `
      INSERT INTO messages (id, conversation_id, sender, author_user_id, content)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, conversation_id, sender, author_user_id, content, created_at
    `,
    [input.messageId, input.conversationId, input.sender, input.authorUserId ?? null, input.content]
  );

  return result.rows[0];
}

export async function touchConversationAfterMessage(conversationId: string, reopenConversation: boolean) {
  await query(
    `
      UPDATE conversations
      SET updated_at = NOW()
        ${reopenConversation ? ", status = 'open'" : ""}
      WHERE id = $1
    `,
    [conversationId]
  );
}

export async function insertAttachmentRecord(input: {
  attachmentId: string;
  messageId: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  content: Buffer;
}) {
  await query(
    `
      INSERT INTO message_attachments (id, message_id, file_name, content_type, size_bytes, content)
      VALUES ($1, $2, $3, $4, $5, $6)
    `,
    [
      input.attachmentId,
      input.messageId,
      input.fileName,
      input.contentType,
      input.sizeBytes,
      input.content
    ]
  );
}

export async function updateVisitorConversationEmailRecord(input: {
  conversationId: string;
  siteId: string;
  sessionId: string;
  email: string;
}) {
  const result = await query<{ id: string }>(
    `
      UPDATE conversations
      SET email = $4,
          updated_at = NOW()
      WHERE id = $1
        AND site_id = $2
        AND session_id = $3
      RETURNING id
    `,
    [input.conversationId, input.siteId, input.sessionId, input.email]
  );

  return Boolean(result.rowCount);
}

export async function deleteConversationTag(conversationId: string, tag: string) {
  await query(
    `
      DELETE FROM tags
      WHERE conversation_id = $1 AND tag = $2
    `,
    [conversationId, tag]
  );
}

export async function insertConversationTag(conversationId: string, tag: string) {
  await query(
    `
      INSERT INTO tags (conversation_id, tag)
      VALUES ($1, $2)
      ON CONFLICT (conversation_id, tag) DO NOTHING
    `,
    [conversationId, tag]
  );
}

export async function upsertConversationFeedback(conversationId: string, rating: ConversationRating) {
  await query(
    `
      INSERT INTO feedback (conversation_id, rating)
      VALUES ($1, $2)
      ON CONFLICT (conversation_id)
      DO UPDATE SET rating = EXCLUDED.rating, created_at = NOW()
    `,
    [conversationId, rating]
  );
}

export async function upsertConversationRead(userId: string, conversationId: string) {
  await query(
    `
      INSERT INTO conversation_reads (user_id, conversation_id, last_read_at, updated_at)
      VALUES ($1, $2, NOW(), NOW())
      ON CONFLICT (user_id, conversation_id)
      DO UPDATE SET
        last_read_at = NOW(),
        updated_at = NOW()
    `,
    [userId, conversationId]
  );
}

export async function updateConversationStatusRecord(
  conversationId: string,
  userId: string,
  status: ConversationStatus
) {
  const result = await query<{ status: ConversationStatus }>(
    `
      UPDATE conversations c
      SET status = $3,
          updated_at = NOW()
      FROM sites s
      WHERE c.id = $1
        AND s.id = c.site_id
        AND s.user_id = $2
      RETURNING c.status
    `,
    [conversationId, userId, status]
  );

  return result.rows[0]?.status ?? null;
}

export async function deleteConversationTypingRecord(userId: string, conversationId: string) {
  await query(
    `
      DELETE FROM conversation_typing
      WHERE user_id = $1
        AND conversation_id = $2
    `,
    [userId, conversationId]
  );
}

export async function upsertConversationTypingRecord(userId: string, conversationId: string) {
  await query(
    `
      INSERT INTO conversation_typing (user_id, conversation_id, expires_at, updated_at)
      VALUES ($1, $2, NOW() + INTERVAL '6 seconds', NOW())
      ON CONFLICT (user_id, conversation_id)
      DO UPDATE SET
        expires_at = NOW() + INTERVAL '6 seconds',
        updated_at = NOW()
    `,
    [userId, conversationId]
  );
}

export async function deleteVisitorTypingRecord(conversationId: string, sessionId: string) {
  await query(
    `
      DELETE FROM visitor_typing
      WHERE conversation_id = $1
        AND session_id = $2
    `,
    [conversationId, sessionId]
  );
}

export async function upsertVisitorTypingRecord(conversationId: string, sessionId: string) {
  await query(
    `
      INSERT INTO visitor_typing (conversation_id, session_id, expires_at, updated_at)
      VALUES ($1, $2, NOW() + INTERVAL '6 seconds', NOW())
      ON CONFLICT (conversation_id, session_id)
      DO UPDATE SET
        expires_at = NOW() + INTERVAL '6 seconds',
        updated_at = NOW()
    `,
    [conversationId, sessionId]
  );
}
