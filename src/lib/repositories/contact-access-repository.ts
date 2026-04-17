import type { ContactConversationHistoryEntry } from "@/lib/contact-types";
import { query } from "@/lib/db";
import { workspaceAccessClause } from "@/lib/repositories/workspace-access-repository";

export async function listContactConversationHistoryRows(input: {
  ownerUserId: string;
  viewerUserId: string;
  siteId: string;
  email: string;
}) {
  const result = await query<ContactConversationHistoryEntry>(
    `
      WITH matching_conversations AS (
        SELECT
          c.id,
          c.status,
          c.created_at,
          c.assigned_user_id
        FROM conversations c
        INNER JOIN sites s
          ON s.id = c.site_id
        WHERE c.site_id = $1
          AND LOWER(COALESCE(c.email, '')) = LOWER($2)
          AND ${workspaceAccessClause("s.user_id", "$3", "$4")}
      ),
      message_counts AS (
        SELECT
          m.conversation_id,
          COUNT(*)::int AS message_count
        FROM messages m
        INNER JOIN matching_conversations mc
          ON mc.id = m.conversation_id
        GROUP BY m.conversation_id
      ),
      first_user_messages AS (
        SELECT DISTINCT ON (m.conversation_id)
          m.conversation_id,
          LEFT(NULLIF(TRIM(m.content), ''), 80) AS title
        FROM messages m
        INNER JOIN matching_conversations mc
          ON mc.id = m.conversation_id
        WHERE m.sender = 'user'
        ORDER BY m.conversation_id, m.created_at ASC
      )
      SELECT
        mc.id,
        COALESCE(fum.title, 'Conversation') AS title,
        mc.status,
        mc.created_at AS "createdAt",
        mc.assigned_user_id AS "assignedUserId",
        COALESCE(counts.message_count, 0) AS "messageCount"
      FROM matching_conversations mc
      LEFT JOIN first_user_messages fum
        ON fum.conversation_id = mc.id
      LEFT JOIN message_counts counts
        ON counts.conversation_id = mc.id
      ORDER BY mc.created_at DESC
    `,
    [input.siteId, input.email, input.ownerUserId, input.viewerUserId]
  );

  return result.rows;
}

export async function hasAccessibleSiteRow(input: {
  ownerUserId: string;
  viewerUserId: string;
  siteId: string;
}) {
  const result = await query<{ id: string }>(
    `
      SELECT s.id
      FROM sites s
      WHERE s.id = $1
        AND ${workspaceAccessClause("s.user_id", "$2", "$3")}
      LIMIT 1
    `,
    [input.siteId, input.ownerUserId, input.viewerUserId]
  );

  return Boolean(result.rows[0]?.id);
}
