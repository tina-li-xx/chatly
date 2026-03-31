import { query } from "@/lib/db";

export type WorkspaceMentionNotificationRow = {
  user_id: string;
  email: string;
  notification_email: string | null;
  first_name: string | null;
  last_name: string | null;
  email_notifications: boolean | null;
  mention_notifications: boolean | null;
};

export async function listWorkspaceMentionNotificationRows(ownerUserId: string) {
  const result = await query<WorkspaceMentionNotificationRow>(
    `
      WITH workspace_users AS (
        SELECT $1::text AS user_id
        UNION
        SELECT tm.member_user_id AS user_id
        FROM team_memberships tm
        WHERE tm.owner_user_id = $1
          AND tm.status = 'active'
      )
      SELECT
        u.id AS user_id,
        u.email,
        us.notification_email,
        us.first_name,
        us.last_name,
        us.email_notifications,
        us.mention_notifications
      FROM workspace_users wu
      INNER JOIN users u
        ON u.id = wu.user_id
      LEFT JOIN user_settings us
        ON us.user_id = u.id
      ORDER BY u.created_at ASC
    `,
    [ownerUserId]
  );

  return result.rows;
}
