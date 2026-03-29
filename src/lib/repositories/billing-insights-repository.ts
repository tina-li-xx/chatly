import { query } from "@/lib/db";

export type BillingInsightsRow = {
  conversation_count: string;
  site_count: string;
  message_count: string;
  avg_response_seconds: string | null;
};

export async function findBillingInsightsRow(userId: string) {
  const result = await query<BillingInsightsRow>(
    `
      WITH workspace_sites AS (
        SELECT id
        FROM sites
        WHERE user_id = $1
      ),
      month_conversations AS (
        SELECT c.id
        FROM conversations c
        INNER JOIN workspace_sites s
          ON s.id = c.site_id
        WHERE c.created_at >= DATE_TRUNC('month', NOW())
          AND c.created_at < DATE_TRUNC('month', NOW()) + INTERVAL '1 month'
      ),
      first_user_messages AS (
        SELECT
          c.id AS conversation_id,
          MIN(m.created_at) AS first_user_at
        FROM month_conversations c
        INNER JOIN messages m
          ON m.conversation_id = c.id
        WHERE m.sender = 'user'
        GROUP BY c.id
      ),
      first_team_replies AS (
        SELECT
          c.id AS conversation_id,
          MIN(m.created_at) AS first_reply_at
        FROM month_conversations c
        INNER JOIN messages m
          ON m.conversation_id = c.id
        WHERE m.sender = 'founder'
        GROUP BY c.id
      ),
      response_pairs AS (
        SELECT
          EXTRACT(EPOCH FROM (fr.first_reply_at - fu.first_user_at)) AS response_seconds
        FROM first_user_messages fu
        INNER JOIN first_team_replies fr
          ON fr.conversation_id = fu.conversation_id
        WHERE fr.first_reply_at > fu.first_user_at
      )
      SELECT
        (SELECT COUNT(*)::text FROM month_conversations) AS conversation_count,
        (SELECT COUNT(*)::text FROM workspace_sites) AS site_count,
        (
          SELECT COUNT(*)::text
          FROM messages m
          INNER JOIN month_conversations c
            ON c.id = m.conversation_id
        ) AS message_count,
        (SELECT AVG(response_seconds)::text FROM response_pairs) AS avg_response_seconds
    `,
    [userId]
  );

  return result.rows[0] ?? {
    conversation_count: "0",
    site_count: "0",
    message_count: "0",
    avg_response_seconds: null
  };
}
