import { query } from "@/lib/db";
import { isValidTimeZone, normalizeTimeZone } from "@/lib/timezones";

function normalizeOptionalTimeZone(value: string | null | undefined) {
  const candidate = value?.trim();
  return isValidTimeZone(candidate) ? candidate : null;
}

export async function upsertUserTimeZone(userId: string, timeZone: string) {
  await query(
    `
      INSERT INTO user_settings (user_id, timezone, updated_at)
      VALUES ($1, $2, NOW())
      ON CONFLICT (user_id) DO UPDATE SET
        timezone = EXCLUDED.timezone,
        updated_at = NOW()
      WHERE user_settings.timezone IS DISTINCT FROM EXCLUDED.timezone
    `,
    [userId, timeZone]
  );
}

export async function findSavedUserTimeZone(userId: string) {
  const result = await query<{ timezone: string | null }>(
    `
      SELECT NULLIF(us.timezone, '') AS timezone
      FROM users u
      LEFT JOIN user_settings us
        ON us.user_id = u.id
      WHERE u.id = $1
      LIMIT 1
    `,
    [userId]
  );

  return normalizeOptionalTimeZone(result.rows[0]?.timezone);
}

export async function findUserSiteTimeZone(userId: string) {
  const result = await query<{ timezone: string | null }>(
    `
      SELECT
        NULLIF(primary_site.operating_hours_timezone, '') AS timezone
      FROM users u
      LEFT JOIN team_memberships tm
        ON tm.member_user_id = u.id
       AND tm.status = 'active'
      LEFT JOIN LATERAL (
        SELECT s.operating_hours_timezone
        FROM sites s
        WHERE s.user_id = COALESCE(tm.owner_user_id, u.id)
        ORDER BY s.created_at ASC
        LIMIT 1
      ) primary_site ON TRUE
      WHERE u.id = $1
      LIMIT 1
    `,
    [userId]
  );

  return normalizeOptionalTimeZone(result.rows[0]?.timezone);
}

export async function findUserTimeZone(userId: string) {
  const [savedTimeZone, siteTimeZone] = await Promise.all([
    findSavedUserTimeZone(userId),
    findUserSiteTimeZone(userId)
  ]);

  return normalizeTimeZone(savedTimeZone ?? siteTimeZone);
}
