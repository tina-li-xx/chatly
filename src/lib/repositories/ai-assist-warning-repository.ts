import { query } from "@/lib/db";
import type { DashboardAiAssistWarningEmailKey } from "@/lib/ai-assist-warning";

export type AiAssistWarningRecipientRow = {
  user_id: string;
  owner_user_id: string;
  email: string;
  notification_email: string | null;
  team_name: string | null;
};

export async function listAiAssistWarningRecipientRows(ownerUserId: string) {
  const result = await query<AiAssistWarningRecipientRow>(
    `
      WITH recipients AS (
        SELECT u.id AS user_id, u.id AS owner_user_id
        FROM users u
        WHERE u.id = $1

        UNION ALL

        SELECT tm.member_user_id AS user_id, tm.owner_user_id
        FROM team_memberships tm
        WHERE tm.owner_user_id = $1
          AND tm.role = 'admin'
          AND tm.status = 'active'
      )
      SELECT
        r.user_id,
        r.owner_user_id,
        u.email,
        us.notification_email,
        primary_site.name AS team_name
      FROM recipients r
      INNER JOIN users u
        ON u.id = r.user_id
      LEFT JOIN user_settings us
        ON us.user_id = r.user_id
      LEFT JOIN LATERAL (
        SELECT s.name
        FROM sites s
        WHERE s.user_id = r.owner_user_id
        ORDER BY s.created_at ASC
        LIMIT 1
      ) primary_site ON TRUE
      WHERE u.email_verified_at IS NOT NULL
      ORDER BY r.user_id ASC
    `,
    [ownerUserId]
  );

  return result.rows;
}

export async function claimAiAssistWarningDelivery(input: {
  userId: string;
  ownerUserId: string;
  cycleStart: string;
  warningKey: DashboardAiAssistWarningEmailKey;
}) {
  const result = await query<{ claimed: number }>(
    `
      INSERT INTO ai_assist_warning_deliveries (
        user_id,
        owner_user_id,
        cycle_start,
        warning_key
      )
      VALUES ($1, $2, $3::date, $4)
      ON CONFLICT (user_id, owner_user_id, cycle_start, warning_key) DO NOTHING
      RETURNING 1 AS claimed
    `,
    [input.userId, input.ownerUserId, input.cycleStart, input.warningKey]
  );

  return Boolean(result.rowCount);
}

export async function releaseAiAssistWarningDelivery(input: {
  userId: string;
  ownerUserId: string;
  cycleStart: string;
  warningKey: DashboardAiAssistWarningEmailKey;
}) {
  await query(
    `
      DELETE FROM ai_assist_warning_deliveries
      WHERE user_id = $1
        AND owner_user_id = $2
        AND cycle_start = $3::date
        AND warning_key = $4
    `,
    [input.userId, input.ownerUserId, input.cycleStart, input.warningKey]
  );
}
