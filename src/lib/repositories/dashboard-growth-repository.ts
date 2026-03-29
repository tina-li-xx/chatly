import { query } from "@/lib/db";

export type DashboardGrowthSnapshotRow = {
  total_conversations: string;
  first_conversation_at: string | null;
  conversations_last_7_days: string;
  conversations_previous_7_days: string;
  login_sessions_last_7_days: string;
  last_login_at: string | null;
};

export async function getDashboardGrowthSnapshot(userId: string) {
  const result = await query<DashboardGrowthSnapshotRow>(
    `
      SELECT
        COALESCE(conversation_totals.total_conversations, 0)::text AS total_conversations,
        conversation_totals.first_conversation_at,
        COALESCE(conversation_totals.conversations_last_7_days, 0)::text AS conversations_last_7_days,
        COALESCE(conversation_totals.conversations_previous_7_days, 0)::text AS conversations_previous_7_days,
        COALESCE(session_totals.login_sessions_last_7_days, 0)::text AS login_sessions_last_7_days,
        session_totals.last_login_at
      FROM (
        SELECT
          COUNT(*) AS total_conversations,
          MIN(c.created_at) AS first_conversation_at,
          COUNT(*) FILTER (
            WHERE c.created_at >= NOW() - INTERVAL '7 days'
          ) AS conversations_last_7_days,
          COUNT(*) FILTER (
            WHERE c.created_at >= NOW() - INTERVAL '14 days'
              AND c.created_at < NOW() - INTERVAL '7 days'
          ) AS conversations_previous_7_days
        FROM conversations c
        INNER JOIN sites s
          ON s.id = c.site_id
        WHERE s.user_id = $1
      ) AS conversation_totals
      CROSS JOIN (
        SELECT
          COUNT(*) FILTER (
            WHERE created_at >= NOW() - INTERVAL '7 days'
          ) AS login_sessions_last_7_days,
          MAX(created_at) AS last_login_at
        FROM auth_sessions
        WHERE user_id = $1
      ) AS session_totals
    `,
    [userId]
  );

  return (
    result.rows[0] ?? {
      total_conversations: "0",
      first_conversation_at: null,
      conversations_last_7_days: "0",
      conversations_previous_7_days: "0",
      login_sessions_last_7_days: "0",
      last_login_at: null
    }
  );
}
