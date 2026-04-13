import { query } from "@/lib/db";
import { workspaceAccessClause } from "@/lib/repositories/workspace-access-repository";

export type VisitorPresenceRow = {
  site_id: string;
  session_id: string;
  conversation_id: string | null;
  email: string | null;
  current_page_url: string | null;
  referrer: string | null;
  user_agent: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  timezone: string | null;
  locale: string | null;
  tags_json: string[] | null;
  custom_fields_json: Record<string, string> | null;
  started_at: string;
  last_seen_at: string;
};

export async function findSiteOwnerRow(siteId: string) {
  const result = await query<{ user_id: string }>(
    `
      SELECT user_id
      FROM sites
      WHERE id = $1
      LIMIT 1
    `,
    [siteId]
  );

  return result.rows[0] ?? null;
}

export async function findVisitorPresenceSessionRow(siteId: string, sessionId: string) {
  const result = await query<VisitorPresenceRow>(
    `
      SELECT
        site_id,
        session_id,
        conversation_id,
        email,
        current_page_url,
        referrer,
        user_agent,
        country,
        region,
        city,
        timezone,
        locale,
        tags_json,
        custom_fields_json,
        started_at,
        last_seen_at
      FROM visitor_presence_sessions
      WHERE site_id = $1
        AND session_id = $2
      LIMIT 1
    `,
    [siteId, sessionId]
  );

  return result.rows[0] ?? null;
}

export async function upsertVisitorPresenceSessionRow(input: {
  siteId: string;
  sessionId: string;
  conversationId: string | null;
  email: string | null;
  currentPageUrl: string | null;
  referrer: string | null;
  userAgent: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  timezone: string | null;
  locale: string | null;
  visitorTags?: string[];
  customFields?: Record<string, string>;
}) {
  const result = await query<VisitorPresenceRow>(
    `
      INSERT INTO visitor_presence_sessions (
        site_id,
        session_id,
        conversation_id,
        email,
        current_page_url,
        referrer,
        user_agent,
        country,
        region,
        city,
        timezone,
        locale,
        tags_json,
        custom_fields_json,
        started_at,
        last_seen_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13::jsonb, $14::jsonb, NOW(), NOW())
      ON CONFLICT (site_id, session_id)
      DO UPDATE SET
        conversation_id = COALESCE(EXCLUDED.conversation_id, visitor_presence_sessions.conversation_id),
        email = COALESCE(EXCLUDED.email, visitor_presence_sessions.email),
        current_page_url = COALESCE(EXCLUDED.current_page_url, visitor_presence_sessions.current_page_url),
        referrer = COALESCE(EXCLUDED.referrer, visitor_presence_sessions.referrer),
        user_agent = COALESCE(EXCLUDED.user_agent, visitor_presence_sessions.user_agent),
        country = COALESCE(EXCLUDED.country, visitor_presence_sessions.country),
        region = COALESCE(EXCLUDED.region, visitor_presence_sessions.region),
        city = COALESCE(EXCLUDED.city, visitor_presence_sessions.city),
        timezone = COALESCE(EXCLUDED.timezone, visitor_presence_sessions.timezone),
        locale = COALESCE(EXCLUDED.locale, visitor_presence_sessions.locale),
        tags_json = CASE
          WHEN EXCLUDED.tags_json <> '[]'::jsonb
            THEN EXCLUDED.tags_json
          ELSE visitor_presence_sessions.tags_json
        END,
        custom_fields_json = CASE
          WHEN EXCLUDED.custom_fields_json <> '{}'::jsonb
            THEN visitor_presence_sessions.custom_fields_json || EXCLUDED.custom_fields_json
          ELSE visitor_presence_sessions.custom_fields_json
        END,
        last_seen_at = NOW()
      RETURNING
        site_id,
        session_id,
        conversation_id,
        email,
        current_page_url,
        referrer,
        user_agent,
        country,
        region,
        city,
        timezone,
        locale,
        tags_json,
        custom_fields_json,
        started_at,
        last_seen_at
    `,
    [
      input.siteId,
      input.sessionId,
      input.conversationId,
      input.email,
      input.currentPageUrl,
      input.referrer,
      input.userAgent,
      input.country,
      input.region,
      input.city,
      input.timezone,
      input.locale,
      JSON.stringify(input.visitorTags ?? []),
      JSON.stringify(input.customFields ?? {})
    ]
  );

  return result.rows[0] ?? null;
}

export async function listVisitorPresenceRowsForUser(ownerUserId: string, viewerUserId: string) {
  const result = await query<VisitorPresenceRow>(
    `
      SELECT
        vps.site_id,
        vps.session_id,
        vps.conversation_id,
        vps.email,
        vps.current_page_url,
        vps.referrer,
        vps.user_agent,
        vps.country,
        vps.region,
        vps.city,
        vps.timezone,
        vps.locale,
        vps.tags_json,
        vps.custom_fields_json,
        vps.started_at,
        vps.last_seen_at
      FROM visitor_presence_sessions vps
      INNER JOIN sites s
        ON s.id = vps.site_id
      WHERE ${workspaceAccessClause("s.user_id", "$1", "$2")}
      ORDER BY vps.last_seen_at DESC
    `,
    [ownerUserId, viewerUserId]
  );

  return result.rows;
}

export async function updateVisitorPresenceSessionEmail(input: {
  siteId: string;
  sessionId: string;
  email: string;
}) {
  await query(
    `
      UPDATE visitor_presence_sessions
      SET email = $3
      WHERE site_id = $1
        AND session_id = $2
    `,
    [input.siteId, input.sessionId, input.email.trim().toLowerCase()]
  );
}
