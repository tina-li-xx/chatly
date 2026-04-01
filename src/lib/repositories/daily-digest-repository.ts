import { query } from "@/lib/db";
import { listEmailReportRecipientRows } from "@/lib/email-report-timezone";

export async function listDailyDigestRecipientRows() {
  return listEmailReportRecipientRows();
}

export async function hasDailyDigestDelivery(userId: string, digestDate: string) {
  const result = await query<{ user_id: string }>(
    `
      SELECT user_id
      FROM daily_digest_deliveries
      WHERE user_id = $1
        AND digest_date = $2::date
      LIMIT 1
    `,
    [userId, digestDate]
  );

  return Boolean(result.rowCount);
}

export async function insertDailyDigestDelivery(userId: string, digestDate: string) {
  await query(
    `
      INSERT INTO daily_digest_deliveries (user_id, digest_date)
      VALUES ($1, $2::date)
      ON CONFLICT (user_id, digest_date) DO NOTHING
    `,
    [userId, digestDate]
  );
}
