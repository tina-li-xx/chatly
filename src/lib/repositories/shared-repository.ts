import { query } from "@/lib/db";
import type { Sender } from "@/lib/types";
import { optionalText } from "@/lib/utils";
import { workspaceAccessClause } from "@/lib/repositories/workspace-repository";

export type SiteRow = {
  id: string;
  user_id: string;
  name: string;
  domain: string | null;
  brand_color: string;
  widget_title: string;
  greeting_text: string;
  launcher_position: string | null;
  avatar_style: string | null;
  team_photo_url: string | null;
  show_online_status: boolean | null;
  require_email_offline: boolean | null;
  offline_title: string | null;
  offline_message: string | null;
  away_title: string | null;
  away_message: string | null;
  sound_notifications: boolean | null;
  auto_open_paths: string[] | null;
  response_time_mode: string | null;
  operating_hours_enabled: boolean | null;
  operating_hours_timezone: string | null;
  operating_hours_json: string | null;
  widget_install_verified_at: string | null;
  widget_install_verified_url: string | null;
  widget_last_seen_at: string | null;
  widget_last_seen_url: string | null;
  created_at: string;
  conversation_count: string;
};

export type SummaryRow = {
  id: string;
  site_id: string;
  site_name: string;
  email: string | null;
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

export type MessageRow = {
  id: string;
  conversation_id: string;
  sender: Sender;
  content: string;
  created_at: string;
};

export type AttachmentRow = {
  id: string;
  message_id: string;
  file_name: string;
  content_type: string;
  size_bytes: number;
};

const SITE_SELECT = `
  s.id,
  s.user_id,
  s.name,
  s.domain,
  s.brand_color,
  s.widget_title,
  s.greeting_text,
  s.launcher_position,
  s.avatar_style,
  s.team_photo_url,
  s.show_online_status,
  s.require_email_offline,
  s.offline_title,
  s.offline_message,
  s.away_title,
  s.away_message,
  s.sound_notifications,
  s.auto_open_paths,
  s.response_time_mode,
  s.operating_hours_enabled,
  s.operating_hours_timezone,
  s.operating_hours_json,
  s.widget_install_verified_at,
  s.widget_install_verified_url,
  s.widget_last_seen_at,
  s.widget_last_seen_url,
  s.created_at,
  COUNT(c.id)::text AS conversation_count
`;

const SITE_GROUP_BY = `
  s.id,
  s.user_id,
  s.name,
  s.domain,
  s.brand_color,
  s.widget_title,
  s.greeting_text,
  s.launcher_position,
  s.avatar_style,
  s.team_photo_url,
  s.show_online_status,
  s.require_email_offline,
  s.offline_title,
  s.offline_message,
  s.away_title,
  s.away_message,
  s.sound_notifications,
  s.auto_open_paths,
  s.response_time_mode,
  s.operating_hours_enabled,
  s.operating_hours_timezone,
  s.operating_hours_json,
  s.widget_install_verified_at,
  s.widget_install_verified_url,
  s.widget_last_seen_at,
  s.widget_last_seen_url,
  s.created_at
`;

const CONVERSATION_SUMMARY_SELECT = `
  c.id,
  c.site_id,
  s.name AS site_name,
  COALESCE(live_visitor.email, c.email) AS email,
  c.session_id,
  c.status,
  c.created_at,
  c.updated_at,
  COALESCE(live_visitor.current_page_url, cm.page_url) AS page_url,
  cm.page_url AS recorded_page_url,
  COALESCE(live_visitor.referrer, cm.referrer) AS referrer,
  COALESCE(live_visitor.user_agent, cm.user_agent) AS user_agent,
  COALESCE(live_visitor.country, cm.country) AS country,
  COALESCE(live_visitor.region, cm.region) AS region,
  COALESCE(live_visitor.city, cm.city) AS city,
  COALESCE(live_visitor.timezone, cm.timezone) AS timezone,
  COALESCE(live_visitor.locale, cm.locale) AS locale,
  latest.created_at AS last_message_at,
  latest.content AS last_message_preview,
  unread.unread_count,
  f.rating,
  COALESCE(ARRAY_AGG(t.tag ORDER BY t.tag) FILTER (WHERE t.tag IS NOT NULL), '{}') AS tags
`;

const CONVERSATION_SUMMARY_FROM = `
  FROM conversations c
  INNER JOIN sites s
    ON s.id = c.site_id
  LEFT JOIN conversation_metadata cm
    ON cm.conversation_id = c.id
  LEFT JOIN LATERAL (
    SELECT
      vps.email,
      vps.current_page_url,
      vps.referrer,
      vps.user_agent,
      vps.country,
      vps.region,
      vps.city,
      vps.timezone,
      vps.locale
    FROM visitor_presence_sessions vps
    WHERE vps.site_id = c.site_id
      AND vps.last_seen_at > NOW() - INTERVAL '5 minutes'
      AND (vps.conversation_id = c.id OR vps.session_id = c.session_id)
    ORDER BY
      CASE WHEN vps.conversation_id = c.id THEN 0 ELSE 1 END,
      vps.last_seen_at DESC
    LIMIT 1
  ) live_visitor ON TRUE
  LEFT JOIN feedback f
    ON f.conversation_id = c.id
  LEFT JOIN LATERAL (
    SELECT m.content, m.created_at
    FROM messages m
    WHERE m.conversation_id = c.id
    ORDER BY m.created_at DESC
    LIMIT 1
  ) latest ON TRUE
  LEFT JOIN LATERAL (
    SELECT COUNT(*)::text AS unread_count
    FROM messages unread_messages
    LEFT JOIN conversation_reads cr
      ON cr.conversation_id = c.id
     AND cr.user_id = $VIEWER_USER_PARAM
    WHERE unread_messages.conversation_id = c.id
      AND unread_messages.sender = 'user'
      AND unread_messages.created_at > COALESCE(cr.last_read_at, TO_TIMESTAMP(0))
  ) unread ON TRUE
  LEFT JOIN tags t
    ON t.conversation_id = c.id
`;

const CONVERSATION_SUMMARY_GROUP_BY = `
  c.id,
  c.site_id,
  s.name,
  c.email,
  live_visitor.email,
  c.session_id,
  c.status,
  c.created_at,
  c.updated_at,
  cm.page_url,
  live_visitor.current_page_url,
  cm.referrer,
  live_visitor.referrer,
  cm.user_agent,
  live_visitor.user_agent,
  cm.country,
  live_visitor.country,
  cm.region,
  live_visitor.region,
  cm.city,
  live_visitor.city,
  cm.timezone,
  live_visitor.timezone,
  cm.locale,
  live_visitor.locale,
  latest.created_at,
  latest.content,
  unread.unread_count,
  f.rating
`;

export async function querySites(whereClause: string, values: unknown[], suffix: string) {
  return query<SiteRow>(
    `
      SELECT
        ${SITE_SELECT}
      FROM sites s
      LEFT JOIN conversations c
        ON c.site_id = s.id
      WHERE ${whereClause}
      GROUP BY
        ${SITE_GROUP_BY}
      ${suffix}
    `,
    values
  );
}

export async function queryConversationSummaries(
  whereClause: string,
  values: unknown[],
  suffix: string,
  viewerUserId: string
) {
  const viewerUserParam = `$${values.length + 1}`;

  return query<SummaryRow>(
    `
      SELECT
        ${CONVERSATION_SUMMARY_SELECT}
      ${CONVERSATION_SUMMARY_FROM.replaceAll("$VIEWER_USER_PARAM", viewerUserParam)}
      WHERE ${whereClause}
      GROUP BY
        ${CONVERSATION_SUMMARY_GROUP_BY}
      ${suffix}
    `,
    [...values, viewerUserId]
  );
}

export async function queryMessageAttachmentRows(messageIds: string[]) {
  if (!messageIds.length) {
    return [] as AttachmentRow[];
  }

  const result = await query<AttachmentRow>(
    `
      SELECT id, message_id, file_name, content_type, size_bytes
      FROM message_attachments
      WHERE message_id = ANY($1::text[])
      ORDER BY created_at ASC
    `,
    [messageIds]
  );

  return result.rows;
}

export async function updateConversationEmailValue(
  conversationId: string,
  email: string | null | undefined,
  mode: "merge" | "replace"
) {
  const normalizedEmail = optionalText(email);

  if (!normalizedEmail) {
    return;
  }

  const assignment = mode === "replace" ? "email = $2" : "email = COALESCE(email, $2)";

  await query(
    `
      UPDATE conversations
      SET ${assignment},
          updated_at = NOW()
      WHERE id = $1
    `,
    [conversationId, normalizedEmail]
  );
}

export async function hasConversationAccess(conversationId: string, userId: string) {
  const result = await query<{ id: string }>(
    `
      SELECT c.id
      FROM conversations c
      INNER JOIN sites s
        ON s.id = c.site_id
      WHERE c.id = $1
        AND ${workspaceAccessClause("s.user_id", "$2")}
      LIMIT 1
    `,
    [conversationId, userId]
  );

  return Boolean(result.rowCount);
}
