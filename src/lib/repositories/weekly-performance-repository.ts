import { query } from "@/lib/db";
import { listEmailReportRecipientRows } from "@/lib/email-report-timezone";

export async function listWeeklyPerformanceRecipientRows() {
  return listEmailReportRecipientRows();
}

export async function hasWeeklyPerformanceDelivery(userId: string, weekStart: string) {
  const result = await query<{ user_id: string }>(
    `
      SELECT user_id
      FROM weekly_performance_deliveries
      WHERE user_id = $1
        AND week_start = $2::date
      LIMIT 1
    `,
    [userId, weekStart]
  );

  return Boolean(result.rowCount);
}

export async function insertWeeklyPerformanceDelivery(userId: string, weekStart: string) {
  await query(
    `
      INSERT INTO weekly_performance_deliveries (user_id, week_start)
      VALUES ($1, $2::date)
      ON CONFLICT (user_id, week_start) DO NOTHING
    `,
    [userId, weekStart]
  );
}
