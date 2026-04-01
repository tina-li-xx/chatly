import { query } from "@/lib/db";
import type {
  DashboardHomeChartRow,
  DashboardHomeRangeDays
} from "@/lib/data/dashboard-home-chart";

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

type DashboardHomeConversationRangeRow = {
  day_key: string;
  day_label: string;
  count: string;
  previous_total: string;
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
        ((AVG(f.rating) FILTER (
          WHERE f.created_at >= NOW() - INTERVAL '30 days'
        )) / 5 * 100)::text AS current_rate,
        ((AVG(f.rating) FILTER (
          WHERE f.created_at >= NOW() - INTERVAL '60 days'
            AND f.created_at < NOW() - INTERVAL '30 days'
        )) / 5 * 100)::text AS previous_rate
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

export async function getDashboardHomeConversationRange(
  userId: string,
  timeZone: string,
  rangeDays: DashboardHomeRangeDays
) {
  const result = await query<DashboardHomeConversationRangeRow>(
    `
      WITH date_bounds AS (
        SELECT
          timezone($2, NOW())::date AS local_today,
          (timezone($2, NOW())::date - ($3::int - 1))::date AS current_start,
          (timezone($2, NOW())::date - (($3::int * 2) - 1))::date AS previous_start
      ),
      range_days AS (
        SELECT
          generate_series(
            (SELECT current_start FROM date_bounds),
            (SELECT local_today FROM date_bounds),
            INTERVAL '1 day'
          )::date AS local_day
      ),
      filtered_conversations AS (
        SELECT
          (c.created_at AT TIME ZONE $2)::date AS local_day
        FROM conversations c
        INNER JOIN sites s
          ON s.id = c.site_id
        WHERE s.user_id = $1
      ),
      previous_total AS (
        SELECT COUNT(*)::text AS value
        FROM filtered_conversations fc
        WHERE fc.local_day >= (SELECT previous_start FROM date_bounds)
          AND fc.local_day < (SELECT current_start FROM date_bounds)
      )
      SELECT
        TO_CHAR(rd.local_day, 'YYYY-MM-DD') AS day_key,
        TO_CHAR(rd.local_day, 'Dy') AS day_label,
        COUNT(fc.local_day)::text AS count,
        previous_total.value AS previous_total
      FROM range_days rd
      LEFT JOIN filtered_conversations fc
        ON fc.local_day = rd.local_day
      CROSS JOIN previous_total
      GROUP BY rd.local_day, previous_total.value
      ORDER BY rd.local_day ASC
    `,
    [userId, timeZone, rangeDays]
  );

  return {
    previousTotal: Number(result.rows[0]?.previous_total ?? 0),
    rows: result.rows.map<DashboardHomeChartRow>((row) => ({
      dayKey: row.day_key,
      dayLabel: row.day_label,
      count: row.count
    }))
  };
}
