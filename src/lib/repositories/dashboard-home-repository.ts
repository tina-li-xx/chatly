import { query } from "@/lib/db";

export type DashboardHomeOverviewRow = {
  open_conversations: string;
  opened_today: string;
  resolved_today: string;
  resolved_yesterday: string;
};

export type DashboardHomeResponseRow = {
  current_avg_seconds: string | null;
  previous_avg_seconds: string | null;
};

export type DashboardHomeSatisfactionRow = {
  current_rate: string | null;
  previous_rate: string | null;
};

export type DashboardHomeChartRow = {
  day_index: string;
  day_label: string;
  count: string;
};

export async function getDashboardHomeOverview(userId: string) {
  const result = await query<DashboardHomeOverviewRow>(
    `
      SELECT
        COUNT(*) FILTER (WHERE c.status = 'open')::text AS open_conversations,
        COUNT(*) FILTER (WHERE c.created_at >= CURRENT_DATE)::text AS opened_today,
        COUNT(*) FILTER (
          WHERE c.status = 'resolved'
            AND c.updated_at >= CURRENT_DATE
        )::text AS resolved_today,
        COUNT(*) FILTER (
          WHERE c.status = 'resolved'
            AND c.updated_at >= CURRENT_DATE - INTERVAL '1 day'
            AND c.updated_at < CURRENT_DATE
        )::text AS resolved_yesterday
      FROM conversations c
      INNER JOIN sites s
        ON s.id = c.site_id
      WHERE s.user_id = $1
    `,
    [userId]
  );

  return result.rows[0] ?? null;
}

export async function getDashboardHomeResponseMetrics(userId: string) {
  const result = await query<DashboardHomeResponseRow>(
    `
      WITH first_user_messages AS (
        SELECT
          c.id AS conversation_id,
          MIN(m.created_at) AS first_user_at
        FROM conversations c
        INNER JOIN sites s
          ON s.id = c.site_id
        INNER JOIN messages m
          ON m.conversation_id = c.id
        WHERE s.user_id = $1
          AND m.sender = 'user'
        GROUP BY c.id
      ),
      first_team_replies AS (
        SELECT
          c.id AS conversation_id,
          MIN(m.created_at) AS first_reply_at
        FROM conversations c
        INNER JOIN sites s
          ON s.id = c.site_id
        INNER JOIN messages m
          ON m.conversation_id = c.id
        WHERE s.user_id = $1
          AND m.sender = 'founder'
        GROUP BY c.id
      ),
      paired AS (
        SELECT
          fu.first_user_at,
          EXTRACT(EPOCH FROM (fr.first_reply_at - fu.first_user_at)) AS response_seconds
        FROM first_user_messages fu
        INNER JOIN first_team_replies fr
          ON fr.conversation_id = fu.conversation_id
        WHERE fr.first_reply_at > fu.first_user_at
      )
      SELECT
        AVG(response_seconds) FILTER (
          WHERE first_user_at >= NOW() - INTERVAL '7 days'
        )::text AS current_avg_seconds,
        AVG(response_seconds) FILTER (
          WHERE first_user_at >= NOW() - INTERVAL '14 days'
            AND first_user_at < NOW() - INTERVAL '7 days'
        )::text AS previous_avg_seconds
      FROM paired
    `,
    [userId]
  );

  return result.rows[0] ?? null;
}

export async function getDashboardHomeSatisfactionMetrics(userId: string) {
  const result = await query<DashboardHomeSatisfactionRow>(
    `
      SELECT
        (AVG(CASE WHEN f.helpful THEN 1 ELSE 0 END) FILTER (
          WHERE f.created_at >= NOW() - INTERVAL '30 days'
        ) * 100)::text AS current_rate,
        (AVG(CASE WHEN f.helpful THEN 1 ELSE 0 END) FILTER (
          WHERE f.created_at >= NOW() - INTERVAL '60 days'
            AND f.created_at < NOW() - INTERVAL '30 days'
        ) * 100)::text AS previous_rate
      FROM feedback f
      INNER JOIN conversations c
        ON c.id = f.conversation_id
      INNER JOIN sites s
        ON s.id = c.site_id
      WHERE s.user_id = $1
    `,
    [userId]
  );

  return result.rows[0] ?? null;
}

export async function listDashboardHomeChartPoints(userId: string) {
  const result = await query<DashboardHomeChartRow>(
    `
      WITH week_days AS (
        SELECT
          generate_series(
            date_trunc('week', CURRENT_DATE),
            date_trunc('week', CURRENT_DATE) + INTERVAL '6 days',
            INTERVAL '1 day'
          ) AS day
      )
      SELECT
        EXTRACT(ISODOW FROM wd.day)::text AS day_index,
        TO_CHAR(wd.day, 'Dy') AS day_label,
        COUNT(c.id) FILTER (WHERE s.id IS NOT NULL)::text AS count
      FROM week_days wd
      LEFT JOIN conversations c
        ON c.created_at >= wd.day
       AND c.created_at < wd.day + INTERVAL '1 day'
      LEFT JOIN sites s
        ON s.id = c.site_id
       AND s.user_id = $1
      GROUP BY wd.day
      ORDER BY wd.day ASC
    `,
    [userId]
  );

  return result.rows;
}

export async function getPreviousWeekConversationCount(userId: string) {
  const result = await query<{ count: string }>(
    `
      SELECT COUNT(*)::text AS count
      FROM conversations c
      INNER JOIN sites s
        ON s.id = c.site_id
      WHERE s.user_id = $1
        AND c.created_at >= date_trunc('week', CURRENT_DATE) - INTERVAL '7 days'
        AND c.created_at < date_trunc('week', CURRENT_DATE)
    `,
    [userId]
  );

  return result.rows[0]?.count ?? "0";
}
