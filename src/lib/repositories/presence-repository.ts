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
