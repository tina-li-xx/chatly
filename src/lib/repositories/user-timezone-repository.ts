import { query } from "@/lib/db";

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
