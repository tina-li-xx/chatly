import { query } from "@/lib/db";
import { workspaceAccessClause } from "@/lib/repositories/workspace-access-repository";
import type { UserSettingsRow } from "@/lib/repositories/settings-repository";

export type DashboardShellRow = Pick<
  UserSettingsRow,
  | "browser_notifications"
  | "sound_alerts"
  | "email_notifications"
  | "new_visitor_alerts"
  | "high_intent_alerts"
> & {
  unread_count: string;
  ai_assist_requests_used: string | null;
};

function dashboardUnreadCountSql(ownerParam: string, viewerParam: string) {
  return `
    SELECT COALESCE(SUM(COALESCE(cr.unread_count, 0)), 0)::text AS unread_count
    FROM conversations c
    INNER JOIN sites s
      ON s.id = c.site_id
    LEFT JOIN conversation_reads cr
      ON cr.user_id = ${viewerParam}
     AND cr.conversation_id = c.id
    WHERE ${workspaceAccessClause("s.user_id", ownerParam, viewerParam)}
  `;
}

export async function findDashboardUnreadCount(input: {
  viewerUserId: string;
  ownerUserId: string;
}) {
  const result = await query<{ unread_count: string }>(
    dashboardUnreadCountSql("$1", "$2"),
    [input.ownerUserId, input.viewerUserId]
  );

  return Number(result.rows[0]?.unread_count ?? 0);
}

export async function findDashboardShellRow(input: {
  viewerUserId: string;
  ownerUserId: string;
  includeAiAssistWarning: boolean;
  cycleStart: string | null;
  cycleEnd: string | null;
}) {
  const result = await query<DashboardShellRow>(
    `
      SELECT
        us.browser_notifications,
        us.sound_alerts,
        us.email_notifications,
        us.new_visitor_alerts,
        us.high_intent_alerts,
        (
          ${dashboardUnreadCountSql("$2", "$1")}
        ) AS unread_count,
        CASE
          WHEN $3::boolean THEN (
            SELECT COUNT(*)::text
            FROM ai_assist_events e
            WHERE e.owner_user_id = $2
              AND e.created_at >= $4::timestamptz
              AND e.created_at < $5::timestamptz
          )
          ELSE NULL
        END AS ai_assist_requests_used
      FROM users u
      LEFT JOIN user_settings us
        ON us.user_id = u.id
      WHERE u.id = $1
      LIMIT 1
    `,
    [
      input.viewerUserId,
      input.ownerUserId,
      input.includeAiAssistWarning,
      input.cycleStart,
      input.cycleEnd
    ]
  );

  return result.rows[0] ?? null;
}
