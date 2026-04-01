import { query } from "@/lib/db";
import { normalizeTimeZone } from "@/lib/timezones";

export type EmailReportRecipientRow = {
  user_id: string;
  email: string;
  notification_email: string | null;
  timezone: string | null;
};

export async function listEmailReportRecipientRows() {
  const result = await query<EmailReportRecipientRow>(
    `
      SELECT
        u.id AS user_id,
        u.email,
        us.notification_email,
        COALESCE(
          NULLIF(us.timezone, ''),
          NULLIF(primary_site.operating_hours_timezone, '')
        ) AS timezone
      FROM users u
      LEFT JOIN team_memberships tm
        ON tm.member_user_id = u.id
       AND tm.status = 'active'
      LEFT JOIN user_settings us
        ON us.user_id = u.id
      LEFT JOIN LATERAL (
        SELECT s.operating_hours_timezone
        FROM sites s
        WHERE s.user_id = COALESCE(tm.owner_user_id, u.id)
        ORDER BY s.created_at ASC
        LIMIT 1
      ) primary_site ON TRUE
      WHERE COALESCE(us.email_notifications, TRUE)
        AND EXISTS (
          SELECT 1
          FROM sites s
          WHERE s.user_id = COALESCE(tm.owner_user_id, u.id)
        )
      ORDER BY u.created_at ASC
    `
  );

  return result.rows.map((row) => ({
    ...row,
    timezone: normalizeTimeZone(row.timezone)
  }));
}
