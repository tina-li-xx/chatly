import { query } from "@/lib/db";

export async function incrementConversationUnreadSnapshots(conversationId: string) {
  await query(
    `
      WITH conversation_scope AS (
        SELECT
          c.id AS conversation_id,
          s.user_id AS owner_user_id,
          c.assigned_user_id
        FROM conversations c
        INNER JOIN sites s
          ON s.id = c.site_id
        WHERE c.id = $1
      ),
      target_users AS (
        SELECT DISTINCT user_id
        FROM (
          SELECT owner_user_id AS user_id
          FROM conversation_scope

          UNION ALL

          SELECT tm.member_user_id AS user_id
          FROM conversation_scope scope
          INNER JOIN team_memberships tm
            ON tm.owner_user_id = scope.owner_user_id
           AND tm.status = 'active'
           AND tm.role = 'admin'

          UNION ALL

          SELECT assigned_user_id AS user_id
          FROM conversation_scope
        ) target_rows
        WHERE user_id IS NOT NULL
      )
      INSERT INTO conversation_reads (user_id, conversation_id, last_read_at, unread_count, updated_at)
      SELECT user_id, $1, TO_TIMESTAMP(0), 1, NOW()
      FROM target_users
      ON CONFLICT (user_id, conversation_id)
      DO UPDATE SET
        unread_count = conversation_reads.unread_count + 1,
        updated_at = NOW()
    `,
    [conversationId]
  );
}

export async function upsertConversationRead(userId: string, conversationId: string) {
  await query(
    `
      INSERT INTO conversation_reads (user_id, conversation_id, last_read_at, unread_count, updated_at)
      VALUES ($1, $2, NOW(), 0, NOW())
      ON CONFLICT (user_id, conversation_id)
      DO UPDATE SET
        last_read_at = NOW(),
        unread_count = 0,
        updated_at = NOW()
    `,
    [userId, conversationId]
  );
}

export async function syncAssignedConversationUnreadSnapshot(input: {
  conversationId: string;
  ownerUserId: string;
  assignedUserId: string | null;
}) {
  if (!input.assignedUserId) {
    return;
  }

  await query(
    `
      INSERT INTO conversation_reads (user_id, conversation_id, last_read_at, unread_count, updated_at)
      SELECT
        $3,
        c.id,
        COALESCE(existing.last_read_at, TO_TIMESTAMP(0)),
        COALESCE(unread.unread_count, 0),
        NOW()
      FROM conversations c
      INNER JOIN sites s
        ON s.id = c.site_id
      LEFT JOIN conversation_reads existing
        ON existing.user_id = $3
       AND existing.conversation_id = c.id
      LEFT JOIN LATERAL (
        SELECT COUNT(*)::int AS unread_count
        FROM messages m
        WHERE m.conversation_id = c.id
          AND m.sender = 'user'
          AND m.created_at > COALESCE(existing.last_read_at, TO_TIMESTAMP(0))
      ) unread ON TRUE
      WHERE c.id = $1
        AND s.user_id = $2
      ON CONFLICT (user_id, conversation_id)
      DO UPDATE SET
        last_read_at = EXCLUDED.last_read_at,
        unread_count = EXCLUDED.unread_count,
        updated_at = NOW()
    `,
    [input.conversationId, input.ownerUserId, input.assignedUserId]
  );
}
