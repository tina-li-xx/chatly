import { query } from "@/lib/db";

export async function upsertUserPresence(userId: string) {
  await query(
    `
      INSERT INTO user_presence (user_id, last_seen_at)
      VALUES ($1, NOW())
      ON CONFLICT (user_id)
      DO UPDATE SET last_seen_at = NOW()
    `,
    [userId]
  );
}

export async function findUserLastSeenAt(userId: string) {
  const result = await query<{ last_seen_at: string | null }>(
    `
      SELECT last_seen_at
      FROM user_presence
      WHERE user_id = $1
      LIMIT 1
    `,
    [userId]
  );

  return result.rows[0]?.last_seen_at ?? null;
}

export async function markUserOffline(userId: string) {
  await query(
    `
      INSERT INTO user_presence (user_id, last_seen_at)
      VALUES ($1, NOW() - INTERVAL '10 minutes')
      ON CONFLICT (user_id)
      DO UPDATE SET last_seen_at = NOW() - INTERVAL '10 minutes'
    `,
    [userId]
  );
}
