import { query } from "@/lib/db";
import { conversationAccessClause } from "@/lib/repositories/workspace-access-repository";
import type { Sender } from "@/lib/types";
import { optionalText } from "@/lib/utils";
import { enrichConversationSummaryRows } from "./conversation-summary-enrichment";
import {
  CONVERSATION_SUMMARY_FROM,
  CONVERSATION_SUMMARY_SELECT,
  INBOX_CONVERSATION_SUMMARY_FROM,
  INBOX_CONVERSATION_SUMMARY_SELECT,
  type SummaryRow
} from "./shared-conversation-select";

export type { SummaryRow } from "./shared-conversation-select";

export type MessageRow = {
  id: string;
  conversation_id: string;
  sender: Sender;
  author_user_id?: string | null;
  content: string;
  created_at: string;
};

export type AttachmentRow = {
  id: string;
  message_id: string;
  file_name: string;
  content_type: string;
  size_bytes: number;
};

export async function queryConversationSummaries(
  whereClause: string,
  values: unknown[],
  suffix: string,
  viewerUserId: string
) {
  // Callers append the workspace owner id last so we can gate member visibility here.
  const ownerUserParam = `$${values.length}`;
  const viewerUserParam = `$${values.length + 1}`;

  const result = await query<SummaryRow>(
    `
      SELECT
        ${CONVERSATION_SUMMARY_SELECT}
      ${CONVERSATION_SUMMARY_FROM.replaceAll("$VIEWER_USER_PARAM", viewerUserParam)}
      WHERE ${whereClause}
        AND ${conversationAccessClause("s.user_id", "c.assigned_user_id", ownerUserParam, viewerUserParam)}
      ${suffix}
    `,
    [...values, viewerUserId]
  );

  if (!result.rows.length) {
    return result;
  }

  return {
    ...result,
    rows: await enrichConversationSummaryRows(result.rows)
  };
}

export async function queryInboxConversationSummaries(
  whereClause: string,
  values: unknown[],
  suffix: string,
  viewerUserId: string
) {
  // Callers append the workspace owner id last so we can gate member visibility here.
  const ownerUserParam = `$${values.length}`;
  const viewerUserParam = `$${values.length + 1}`;

  return query<SummaryRow>(
    `
      SELECT
        ${INBOX_CONVERSATION_SUMMARY_SELECT}
      ${INBOX_CONVERSATION_SUMMARY_FROM.replaceAll("$VIEWER_USER_PARAM", viewerUserParam)}
      WHERE ${whereClause}
        AND ${conversationAccessClause("s.user_id", "c.assigned_user_id", ownerUserParam, viewerUserParam)}
      ${suffix}
    `,
    [...values, viewerUserId]
  );
}

export async function queryMessageAttachmentRows(messageIds: string[]) {
  if (!messageIds.length) {
    return [] as AttachmentRow[];
  }

  const result = await query<AttachmentRow>(
    `
      SELECT id, message_id, file_name, content_type, size_bytes
      FROM message_attachments
      WHERE message_id = ANY($1::text[])
      ORDER BY created_at ASC
    `,
    [messageIds]
  );

  return result.rows;
}

export async function updateConversationEmailValue(
  conversationId: string,
  email: string | null | undefined,
  mode: "merge" | "replace"
) {
  const normalizedEmail = optionalText(email);
  if (!normalizedEmail) {
    return;
  }

  const assignment = mode === "replace" ? "email = $2" : "email = COALESCE(email, $2)";

  await query(
    `
      UPDATE conversations
      SET ${assignment},
          updated_at = NOW()
      WHERE id = $1
    `,
    [conversationId, normalizedEmail]
  );
}

export async function hasConversationAccess(conversationId: string, ownerUserId: string, userId: string) {
  const result = await query<{ id: string }>(
    `
      SELECT c.id
      FROM conversations c
      INNER JOIN sites s
        ON s.id = c.site_id
      WHERE c.id = $1
        AND ${conversationAccessClause("s.user_id", "c.assigned_user_id", "$2", "$3")}
      LIMIT 1
    `,
    [conversationId, ownerUserId, userId]
  );

  return Boolean(result.rowCount);
}

export async function listAssignedConversationIdsForMember(ownerUserId: string, userId: string) {
  const result = await query<{ id: string }>(
    `
      SELECT c.id
      FROM conversations c
      INNER JOIN sites s
        ON s.id = c.site_id
      WHERE s.user_id = $1
        AND c.assigned_user_id = $2
    `,
    [ownerUserId, userId]
  );

  return result.rows.map((row) => row.id);
}
