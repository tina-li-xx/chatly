import { query } from "@/lib/db";

const WIDGET_TOUCH_THROTTLE_MS = 5 * 60 * 1000;

export async function findSiteTeamPhotoRecord(siteId: string, userId: string) {
  const result = await query<{
    id: string;
    team_photo_url: string | null;
    team_photo_key: string | null;
  }>(
    `
      SELECT id, team_photo_url, team_photo_key
      FROM sites
      WHERE id = $1
        AND user_id = $2
      LIMIT 1
    `,
    [siteId, userId]
  );

  return result.rows[0] ?? null;
}

export async function updateSiteTeamPhotoRecord(
  siteId: string,
  userId: string,
  teamPhotoUrl: string,
  teamPhotoKey: string
) {
  const result = await query<{ id: string }>(
    `
      UPDATE sites
      SET
        team_photo_url = $3,
        team_photo_key = $4
      WHERE id = $1
        AND user_id = $2
      RETURNING id
    `,
    [siteId, userId, teamPhotoUrl, teamPhotoKey]
  );

  return Boolean(result.rows[0]);
}

export async function clearSiteTeamPhotoRecord(siteId: string, userId: string) {
  const result = await query<{ id: string }>(
    `
      UPDATE sites
      SET
        team_photo_url = NULL,
        team_photo_key = NULL
      WHERE id = $1
        AND user_id = $2
      RETURNING id
    `,
    [siteId, userId]
  );

  return Boolean(result.rows[0]);
}

export async function markSiteWidgetInstallVerifiedRecord(siteId: string, userId: string, verifiedUrl: string | null) {
  const result = await query<{ id: string }>(
    `
      UPDATE sites
      SET
        widget_install_verified_at = NOW(),
        widget_install_verified_url = $3
      WHERE id = $1
        AND user_id = $2
      RETURNING id
    `,
    [siteId, userId, verifiedUrl]
  );

  return Boolean(result.rows[0]);
}

export async function findSitePresenceRow(siteId: string) {
  const result = await query<{ last_seen_at: string | null }>(
    `
      SELECT MAX(up.last_seen_at) AS last_seen_at
      FROM sites s
      LEFT JOIN LATERAL (
        SELECT s.user_id AS user_id
        UNION ALL
        SELECT tm.member_user_id AS user_id
        FROM team_memberships tm
        WHERE tm.owner_user_id = s.user_id
          AND tm.status = 'active'
      ) workspace_members ON TRUE
      LEFT JOIN user_presence up
        ON up.user_id = workspace_members.user_id
      WHERE s.id = $1
      GROUP BY s.id
      LIMIT 1
    `,
    [siteId]
  );

  return result.rows[0] ?? null;
}

export async function touchSiteWidgetSeenRecord(siteId: string, pageUrl: string | null) {
  const oldestAllowedTouch = new Date(Date.now() - WIDGET_TOUCH_THROTTLE_MS).toISOString();
  await query(
    `
      UPDATE sites
      SET
        widget_last_seen_at = NOW(),
        widget_last_seen_url = COALESCE($2, widget_last_seen_url)
      WHERE id = $1
        AND (
          widget_last_seen_at IS NULL
          OR widget_last_seen_at <= $3
          OR COALESCE($2, widget_last_seen_url) IS DISTINCT FROM widget_last_seen_url
        )
    `,
    [siteId, pageUrl, oldestAllowedTouch]
  );
}
