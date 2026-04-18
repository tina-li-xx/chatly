import { query } from "@/lib/db";
import { syncAssignedConversationUnreadSnapshot } from "@/lib/repositories/conversation-unread-repository";

export async function updateConversationAssignmentRecord(input: {
  conversationId: string;
  ownerUserId: string;
  assignedUserId: string | null;
}) {
  const result = await query<{ assigned_user_id: string | null }>(
    `
      UPDATE conversations c
      SET assigned_user_id = $3,
          updated_at = NOW()
      FROM sites s
      WHERE c.id = $1
        AND s.id = c.site_id
        AND s.user_id = $2
      RETURNING c.assigned_user_id
    `,
    [input.conversationId, input.ownerUserId, input.assignedUserId]
  );

  const assignedUserId = result.rows[0]?.assigned_user_id ?? null;

  if (assignedUserId) {
    await syncAssignedConversationUnreadSnapshot({
      conversationId: input.conversationId,
      ownerUserId: input.ownerUserId,
      assignedUserId
    });
  }

  return assignedUserId;
}

export async function findNextRoundRobinAssigneeUserId(ownerUserId: string) {
  const result = await query<{ user_id: string }>(
    `
      WITH candidates AS (
        SELECT $1::text AS user_id

        UNION

        SELECT tm.member_user_id AS user_id
        FROM team_memberships tm
        WHERE tm.owner_user_id = $1
          AND tm.status = 'active'
      ),
      last_assignments AS (
        SELECT
          c.assigned_user_id AS user_id,
          MAX(c.created_at) AS last_assigned_at
        FROM conversations c
        INNER JOIN sites s
          ON s.id = c.site_id
        WHERE s.user_id = $1
          AND c.assigned_user_id IS NOT NULL
        GROUP BY c.assigned_user_id
      )
      SELECT candidates.user_id
      FROM candidates
      LEFT JOIN last_assignments
        ON last_assignments.user_id = candidates.user_id
      ORDER BY last_assignments.last_assigned_at ASC NULLS FIRST, candidates.user_id ASC
      LIMIT 1
    `,
    [ownerUserId]
  );

  return result.rows[0]?.user_id ?? null;
}
