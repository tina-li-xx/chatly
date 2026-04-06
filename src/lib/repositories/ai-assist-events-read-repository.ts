import { query } from "@/lib/db";

export async function countWorkspaceAiAssistRequestsForRange(
  ownerUserId: string,
  rangeStart: string,
  rangeEnd: string
) {
  const result = await query<{ count: string }>(
    `
      SELECT COUNT(*)::text AS count
      FROM ai_assist_events
      WHERE owner_user_id = $1
        AND action = 'requested'
        AND created_at >= $2::timestamptz
        AND created_at < $3::timestamptz
    `,
    [ownerUserId, rangeStart, rangeEnd]
  );

  return Number(result.rows[0]?.count ?? "0");
}
