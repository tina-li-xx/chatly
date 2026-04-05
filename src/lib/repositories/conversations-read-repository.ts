import { query } from "@/lib/db";
import type { WidgetFaqSuggestions } from "@/lib/public-widget-automation";
import type { ConversationStatus } from "@/lib/types";
import type { MessageRow } from "@/lib/repositories/shared-repository";

function parseFaqSuggestionsSnapshot(value: string | null): WidgetFaqSuggestions | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as WidgetFaqSuggestions | null;
    if (!parsed || !Array.isArray(parsed.items) || typeof parsed.fallbackMessage !== "string") {
      return null;
    }

    const items = parsed.items
      .filter((item) => item && typeof item.question === "string" && typeof item.answer === "string")
      .map((item) => ({
        id: typeof item.id === "string" ? item.id : "",
        question: item.question,
        answer: item.answer,
        link: typeof item.link === "string" ? item.link : ""
      }));

    return items.length
      ? {
          items,
          fallbackMessage: parsed.fallbackMessage
        }
      : null;
  } catch {
    return null;
  }
}

export async function findConversationById(conversationId: string) {
  const result = await query<{ id: string; site_id: string; email: string | null; session_id: string }>(
    `
      SELECT id, site_id, email, session_id
      FROM conversations
      WHERE id = $1
      LIMIT 1
    `,
    [conversationId]
  );

  return result.rows[0] ?? null;
}

export async function findConversationFaqHandoffState(conversationId: string) {
  const result = await query<{
    faq_handoff_pending: boolean;
    faq_handoff_preview: string | null;
    faq_handoff_attachments_count: number;
    faq_handoff_is_new_visitor: boolean;
    faq_handoff_high_intent: boolean;
    faq_handoff_suggestions_json: string | null;
  }>(
    `
      SELECT
        faq_handoff_pending,
        faq_handoff_preview,
        faq_handoff_attachments_count,
        faq_handoff_is_new_visitor,
        faq_handoff_high_intent,
        faq_handoff_suggestions_json
      FROM conversations
      WHERE id = $1
      LIMIT 1
    `,
    [conversationId]
  );

  const row = result.rows[0];
  if (!row) {
    return null;
  }

  return {
    pending: Boolean(row.faq_handoff_pending),
    preview: row.faq_handoff_preview,
    attachmentsCount: Number(row.faq_handoff_attachments_count ?? 0),
    isNewVisitor: Boolean(row.faq_handoff_is_new_visitor),
    highIntent: Boolean(row.faq_handoff_high_intent),
    suggestions: parseFaqSuggestionsSnapshot(row.faq_handoff_suggestions_json)
  };
}

export async function findPreviousConversationByIdentity(input: {
  siteId: string;
  conversationId: string;
  useEmail: boolean;
  matchValue: string;
}) {
  const matchClause = input.useEmail ? "LOWER(email) = LOWER($3)" : "session_id = $3";
  const result = await query<{ id: string }>(
    `
      SELECT id
      FROM conversations
      WHERE site_id = $1
        AND id <> $2
        AND ${matchClause}
      LIMIT 1
    `,
    [input.siteId, input.conversationId, input.matchValue]
  );

  return Boolean(result.rowCount);
}

export async function hasPublicConversationAccessRecord(input: {
  siteId: string;
  sessionId: string;
  conversationId: string;
}) {
  const result = await query<{ id: string }>(
    `
      SELECT id
      FROM conversations
      WHERE id = $1
        AND site_id = $2
        AND session_id = $3
      LIMIT 1
    `,
    [input.conversationId, input.siteId, input.sessionId]
  );

  return Boolean(result.rowCount);
}

export async function findConversationIdentityForActivity(conversationId: string, userId: string) {
  const result = await query<{
    site_id: string;
    email: string | null;
    session_id: string;
  }>(
    `
      SELECT c.site_id, c.email, c.session_id
      FROM conversations c
      INNER JOIN sites s
        ON s.id = c.site_id
      WHERE c.id = $1
        AND s.user_id = $2
      LIMIT 1
    `,
    [conversationId, userId]
  );

  return result.rows[0] ?? null;
}

export async function getConversationVisitorActivityAggregate(input: {
  siteId: string;
  conversationId: string;
  useEmail: boolean;
  matchValue: string;
}) {
  const matchClause = input.useEmail ? "LOWER(c.email) = LOWER($3)" : "c.session_id = $3";
  const result = await query<{
    other_questions_last_month: string;
    other_conversations_last_month: string;
    other_conversations_total: string;
    last_seen_at: string | null;
  }>(
    `
      WITH matched_conversations AS (
        SELECT c.id, c.created_at, c.updated_at
        FROM conversations c
        WHERE c.site_id = $1
          AND c.id <> $2
          AND ${matchClause}
      )
      SELECT
        COUNT(*)::text AS other_conversations_total,
        COUNT(*) FILTER (
          WHERE created_at >= date_trunc('month', NOW()) - INTERVAL '1 month'
            AND created_at < date_trunc('month', NOW())
        )::text AS other_conversations_last_month,
        COALESCE((
          SELECT COUNT(*)::text
          FROM messages m
          INNER JOIN matched_conversations mc
            ON mc.id = m.conversation_id
          WHERE m.sender = 'user'
            AND m.created_at >= date_trunc('month', NOW()) - INTERVAL '1 month'
            AND m.created_at < date_trunc('month', NOW())
        ), '0') AS other_questions_last_month,
        MAX(updated_at) AS last_seen_at
      FROM matched_conversations
    `,
    [input.siteId, input.conversationId, input.matchValue]
  );

  return result.rows[0] ?? null;
}

export async function listConversationMessageRows(conversationId: string) {
  const result = await query<MessageRow>(
    `
      SELECT id, conversation_id, sender, author_user_id, content, created_at
      FROM messages
      WHERE conversation_id = $1
      ORDER BY created_at ASC
    `,
    [conversationId]
  );

  return result.rows;
}

export async function findActiveConversationTyping(conversationId: string) {
  const result = await query<{ typing: boolean }>(
    `
      SELECT EXISTS (
        SELECT 1
        FROM conversation_typing ct
        WHERE ct.conversation_id = $1
          AND ct.expires_at > NOW()
      ) AS typing
    `,
    [conversationId]
  );

  return Boolean(result.rows[0]?.typing);
}

export async function findVisitorConversationEmailState(input: {
  conversationId: string;
  siteId: string;
  sessionId: string;
}) {
  const result = await query<{ email: string | null; user_id: string }>(
    `
      SELECT c.email, s.user_id
      FROM conversations c
      INNER JOIN sites s
        ON s.id = c.site_id
      WHERE c.id = $1
        AND c.site_id = $2
        AND c.session_id = $3
      LIMIT 1
    `,
    [input.conversationId, input.siteId, input.sessionId]
  );

  return result.rows[0] ?? null;
}

export async function findConversationNotificationContextRow(conversationId: string) {
  const result = await query<{
    user_id: string;
    owner_user_id: string;
    site_name: string;
  }>(
    `
      SELECT
        COALESCE(c.assigned_user_id, s.user_id) AS user_id,
        s.user_id AS owner_user_id,
        s.name AS site_name
      FROM conversations c
      INNER JOIN sites s
        ON s.id = c.site_id
      WHERE c.id = $1
      LIMIT 1
    `,
    [conversationId]
  );

  return result.rows[0] ?? null;
}

export async function findConversationTag(conversationId: string, tag: string) {
  const result = await query<{ conversation_id: string }>(
    `
      SELECT conversation_id
      FROM tags
      WHERE conversation_id = $1 AND tag = $2
      LIMIT 1
    `,
    [conversationId, tag]
  );

  return Boolean(result.rowCount);
}

export async function findConversationEmailStateForUser(conversationId: string, userId: string) {
  const result = await query<{
    email: string | null;
    site_id: string;
    site_name: string;
    status: ConversationStatus;
  }>(
    `
      SELECT c.email, c.site_id, s.name AS site_name, c.status
      FROM conversations c
      INNER JOIN sites s
        ON s.id = c.site_id
      WHERE c.id = $1
        AND s.user_id = $2
      LIMIT 1
    `,
    [conversationId, userId]
  );

  return result.rows[0] ?? null;
}

export async function findConversationEmailById(conversationId: string) {
  const result = await query<{ email: string | null }>(
    `
      SELECT email
      FROM conversations
      WHERE id = $1
      LIMIT 1
    `,
    [conversationId]
  );

  return result.rows[0]?.email ?? null;
}

export async function findPublicAttachmentRecord(attachmentId: string, conversationId: string) {
  const result = await query<{
    id: string;
    file_name: string;
    content_type: string;
    size_bytes: number;
    content: Buffer;
  }>(
    `
      SELECT ma.id, ma.file_name, ma.content_type, ma.size_bytes, ma.content
      FROM message_attachments ma
      INNER JOIN messages m
        ON m.id = ma.message_id
      WHERE ma.id = $1
        AND m.conversation_id = $2
      LIMIT 1
    `,
    [attachmentId, conversationId]
  );

  return result.rows[0] ?? null;
}
