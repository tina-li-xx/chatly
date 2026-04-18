import { query } from "@/lib/db";
import type { SummaryRow } from "@/lib/repositories/shared-conversation-select";
import { conversationAccessClause } from "@/lib/repositories/workspace-access-repository";

const VISITORS_PAGE_CONVERSATION_SUMMARY_SELECT = `
  c.id,
  c.site_id,
  s.name AS site_name,
  c.email,
  c.assigned_user_id,
  c.session_id,
  c.status,
  c.created_at,
  c.updated_at,
  c.recorded_page_url AS page_url,
  c.recorded_page_url AS recorded_page_url,
  c.recorded_referrer AS referrer,
  c.recorded_user_agent AS user_agent,
  c.recorded_country AS country,
  c.recorded_region AS region,
  c.recorded_city AS city,
  c.recorded_timezone AS timezone,
  c.recorded_locale AS locale,
  c.last_message_at,
  c.last_message_preview,
  '0'::text AS unread_count,
  NULL::int AS rating,
  '{}'::text[] AS tags
`;

const VISITORS_PAGE_CONVERSATION_SUMMARY_FROM = `
  FROM conversations c
  INNER JOIN sites s
    ON s.id = c.site_id
`;

export async function queryVisitorsPageConversationSummaries(
  whereClause: string,
  values: unknown[],
  suffix: string,
  viewerUserId: string
) {
  const ownerUserParam = `$${values.length}`;
  const viewerUserParam = `$${values.length + 1}`;

  return query<SummaryRow>(
    `
      SELECT
        ${VISITORS_PAGE_CONVERSATION_SUMMARY_SELECT}
      ${VISITORS_PAGE_CONVERSATION_SUMMARY_FROM}
      WHERE ${whereClause}
        AND ${conversationAccessClause("s.user_id", "c.assigned_user_id", ownerUserParam, viewerUserParam)}
      ${suffix}
    `,
    [...values, viewerUserId]
  );
}
