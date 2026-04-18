import { query } from "@/lib/db";

export async function syncConversationRecordedSummaryRecord(input: {
  conversationId: string;
  pageUrl: string | null;
  referrer: string | null;
  userAgent: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  timezone: string | null;
  locale: string | null;
}) {
  await query(
    `
      UPDATE conversations
      SET
        recorded_page_url = COALESCE(recorded_page_url, $2),
        recorded_referrer = $3,
        recorded_user_agent = $4,
        recorded_country = COALESCE($5, recorded_country),
        recorded_region = COALESCE($6, recorded_region),
        recorded_city = COALESCE($7, recorded_city),
        recorded_timezone = COALESCE($8, recorded_timezone),
        recorded_locale = COALESCE($9, recorded_locale)
      WHERE id = $1
    `,
    [
      input.conversationId,
      input.pageUrl,
      input.referrer,
      input.userAgent,
      input.country,
      input.region,
      input.city,
      input.timezone,
      input.locale
    ]
  );
}

export async function syncConversationMessageSummaryRecord(input: {
  conversationId: string;
  createdAt: string;
  preview: string;
  reopenConversation: boolean;
}) {
  await query(
    `
      UPDATE conversations
      SET
        updated_at = NOW(),
        last_message_at = $2,
        last_message_preview = $3
        ${input.reopenConversation ? ", status = 'open'" : ""}
      WHERE id = $1
    `,
    [input.conversationId, input.createdAt, input.preview]
  );
}
