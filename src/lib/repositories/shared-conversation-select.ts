export type SummaryRow = {
  id: string;
  site_id: string;
  site_name: string;
  email: string | null;
  assigned_user_id: string | null;
  session_id: string;
  status: "open" | "resolved";
  created_at: string;
  updated_at: string;
  page_url: string | null;
  recorded_page_url: string | null;
  referrer: string | null;
  user_agent: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  timezone: string | null;
  locale: string | null;
  last_message_at: string | null;
  last_message_preview: string | null;
  unread_count: string;
  rating: number | null;
  tags: string[] | null;
};

export const INBOX_CONVERSATION_SUMMARY_SELECT = `
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
  NULL::text AS referrer,
  NULL::text AS user_agent,
  c.recorded_country AS country,
  c.recorded_region AS region,
  c.recorded_city AS city,
  c.recorded_timezone AS timezone,
  c.recorded_locale AS locale,
  c.last_message_at,
  c.last_message_preview,
  COALESCE(cr.unread_count, 0)::text AS unread_count,
  NULL::int AS rating,
  '{}'::text[] AS tags
`;

export const INBOX_CONVERSATION_SUMMARY_FROM = `
  FROM conversations c
  INNER JOIN sites s
    ON s.id = c.site_id
  LEFT JOIN conversation_reads cr
    ON cr.conversation_id = c.id
   AND cr.user_id = $VIEWER_USER_PARAM
`;

export const CONVERSATION_SUMMARY_SELECT = `
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
  COALESCE(cr.unread_count, 0)::text AS unread_count,
  NULL::int AS rating,
  '{}'::text[] AS tags
`;

export const CONVERSATION_SUMMARY_FROM = `
  FROM conversations c
  INNER JOIN sites s
    ON s.id = c.site_id
  LEFT JOIN conversation_reads cr
    ON cr.conversation_id = c.id
   AND cr.user_id = $VIEWER_USER_PARAM
`;
