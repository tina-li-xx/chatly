import { query } from "@/lib/db";

export async function getConversationTotalsForUser(userId: string) {
  const result = await query<{ total: string; answered: string }>(
    `
      SELECT
        COUNT(*)::text AS total,
        COUNT(*) FILTER (
          WHERE EXISTS (
            SELECT 1
            FROM messages m
            WHERE m.conversation_id = c.id
              AND m.sender = 'founder'
          )
        )::text AS answered
      FROM conversations c
      INNER JOIN sites s
        ON s.id = c.site_id
      WHERE s.user_id = $1
    `,
    [userId]
  );

  return result.rows[0] ?? { total: "0", answered: "0" };
}

export async function getHelpfulConversationCountForUser(userId: string) {
  const result = await query<{ helpful: string }>(
    `
      SELECT COUNT(*) FILTER (WHERE f.helpful = TRUE)::text AS helpful
      FROM feedback f
      INNER JOIN conversations c
        ON c.id = f.conversation_id
      INNER JOIN sites s
        ON s.id = c.site_id
      WHERE s.user_id = $1
    `,
    [userId]
  );

  return result.rows[0]?.helpful ?? "0";
}

export async function listTopTagsForUser(userId: string) {
  const result = await query<{ tag: string; count: string }>(
    `
      SELECT t.tag, COUNT(*)::text AS count
      FROM tags t
      INNER JOIN conversations c
        ON c.id = t.conversation_id
      INNER JOIN sites s
        ON s.id = c.site_id
      WHERE s.user_id = $1
      GROUP BY t.tag
      ORDER BY COUNT(*) DESC, t.tag ASC
      LIMIT 4
    `,
    [userId]
  );

  return result.rows;
}
