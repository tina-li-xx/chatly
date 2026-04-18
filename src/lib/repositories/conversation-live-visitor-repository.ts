import { query } from "@/lib/db";
import { conversationAccessClause } from "@/lib/repositories/workspace-access-repository";

export type ConversationLiveVisitorRow = {
  email: string | null;
  current_page_url: string | null;
  referrer: string | null;
  user_agent: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  timezone: string | null;
  locale: string | null;
};

export type ConversationLiveVisitorSummaryRow = ConversationLiveVisitorRow & {
  conversation_id: string;
};

const CONVERSATION_LIVE_VISITOR_SELECT = `
  vps.email,
  vps.current_page_url,
  vps.referrer,
  vps.user_agent,
  vps.country,
  vps.region,
  vps.city,
  vps.timezone,
  vps.locale
`;

const CONVERSATION_LIVE_VISITOR_FROM = `
  FROM conversations c
  INNER JOIN sites s
    ON s.id = c.site_id
  INNER JOIN visitor_presence_sessions vps
    ON vps.site_id = c.site_id
`;

const CONVERSATION_LIVE_VISITOR_WHERE = `
  AND vps.last_seen_at > NOW() - INTERVAL '5 minutes'
  AND (vps.conversation_id = c.id OR vps.session_id = c.session_id)
`;

export async function findConversationLiveVisitorRow(input: {
  conversationId: string;
  ownerUserId: string;
  viewerUserId: string;
}) {
  const result = await query<ConversationLiveVisitorRow>(
    `
      SELECT
        ${CONVERSATION_LIVE_VISITOR_SELECT}
      ${CONVERSATION_LIVE_VISITOR_FROM}
      WHERE c.id = $1
        AND s.user_id = $2
        AND ${conversationAccessClause("s.user_id", "c.assigned_user_id", "$2", "$3")}
        ${CONVERSATION_LIVE_VISITOR_WHERE}
      ORDER BY
        CASE WHEN vps.conversation_id = c.id THEN 0 ELSE 1 END,
        vps.last_seen_at DESC
      LIMIT 1
    `,
    [input.conversationId, input.ownerUserId, input.viewerUserId]
  );

  return result.rows[0] ?? null;
}

export async function listConversationLiveVisitorRows(input: {
  conversationIds: string[];
  ownerUserId: string;
  viewerUserId: string;
}) {
  if (!input.conversationIds.length) {
    return [] as ConversationLiveVisitorSummaryRow[];
  }

  const result = await query<ConversationLiveVisitorSummaryRow>(
    `
      SELECT DISTINCT ON (c.id)
        c.id AS conversation_id,
        ${CONVERSATION_LIVE_VISITOR_SELECT}
      ${CONVERSATION_LIVE_VISITOR_FROM}
      WHERE c.id = ANY($1::text[])
        AND s.user_id = $2
        AND ${conversationAccessClause("s.user_id", "c.assigned_user_id", "$2", "$3")}
        ${CONVERSATION_LIVE_VISITOR_WHERE}
      ORDER BY
        c.id,
        CASE WHEN vps.conversation_id = c.id THEN 0 ELSE 1 END,
        vps.last_seen_at DESC
    `,
    [input.conversationIds, input.ownerUserId, input.viewerUserId]
  );

  return result.rows;
}
