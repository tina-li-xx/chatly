import { query } from "@/lib/db";
import { workspaceAccessClause } from "@/lib/repositories/workspace-access-repository";

export type DashboardContactRow = {
  site_id: string;
  site_name: string;
  email: string;
  latest_conversation_id: string | null;
  latest_session_id: string | null;
  tags_json: string[] | null;
  custom_fields_json: Record<string, string> | null;
  first_seen_at: string;
  last_seen_at: string;
  created_at: string;
  updated_at: string;
  name: string | null;
  phone: string | null;
  company: string | null;
  role: string | null;
  avatar_url: string | null;
  status_key: string | null;
  location_json: { city?: string | null; region?: string | null; country?: string | null } | null;
  source_json: {
    firstLandingPage?: string | null;
    referrer?: string | null;
    utmSource?: string | null;
    utmMedium?: string | null;
    utmCampaign?: string | null;
  } | null;
  notes_json: unknown[] | null;
  page_history_json: unknown[] | null;
  total_page_views: number | string | null;
  conversation_count: number | string | null;
  total_visits: number | string | null;
  avg_session_seconds: number | string | null;
};

type DashboardContactTagRow = {
  tag: string;
};

let visitorContactColumnsReady = false;

async function ensureVisitorContactColumns() {
  if (visitorContactColumnsReady) {
    return;
  }

  await query(
    `
      ALTER TABLE visitor_contacts
      ADD COLUMN IF NOT EXISTS name TEXT,
      ADD COLUMN IF NOT EXISTS phone TEXT,
      ADD COLUMN IF NOT EXISTS company TEXT,
      ADD COLUMN IF NOT EXISTS role TEXT,
      ADD COLUMN IF NOT EXISTS avatar_url TEXT,
      ADD COLUMN IF NOT EXISTS status_key TEXT NOT NULL DEFAULT '',
      ADD COLUMN IF NOT EXISTS location_json JSONB NOT NULL DEFAULT '{}'::jsonb,
      ADD COLUMN IF NOT EXISTS source_json JSONB NOT NULL DEFAULT '{}'::jsonb,
      ADD COLUMN IF NOT EXISTS notes_json JSONB NOT NULL DEFAULT '[]'::jsonb,
      ADD COLUMN IF NOT EXISTS page_history_json JSONB NOT NULL DEFAULT '[]'::jsonb,
      ADD COLUMN IF NOT EXISTS total_page_views INTEGER NOT NULL DEFAULT 0
    `
  );
  await query(`ALTER TABLE visitor_contacts ALTER COLUMN status_key SET DEFAULT ''`);
  visitorContactColumnsReady = true;
}

function contactStoredFields(alias: string) {
  return `
    ${alias}.site_id,
    ${alias}.site_name,
    ${alias}.email,
    ${alias}.latest_conversation_id,
    ${alias}.latest_session_id,
    ${alias}.tags_json,
    ${alias}.custom_fields_json,
    ${alias}.first_seen_at,
    ${alias}.last_seen_at,
    ${alias}.created_at,
    ${alias}.updated_at,
    ${alias}.name,
    ${alias}.phone,
    ${alias}.company,
    ${alias}.role,
    ${alias}.avatar_url,
    ${alias}.status_key,
    ${alias}.location_json,
    ${alias}.source_json,
    ${alias}.notes_json,
    ${alias}.page_history_json,
    ${alias}.total_page_views
  `;
}

export async function findDashboardContactRow(siteId: string, email: string) {
  await ensureVisitorContactColumns();
  const result = await query<DashboardContactRow>(
    `
      WITH target_contact AS (
        SELECT
          vc.site_id,
          s.name AS site_name,
          vc.email,
          vc.latest_conversation_id,
          vc.latest_session_id,
          vc.tags_json,
          vc.custom_fields_json,
          vc.first_seen_at,
          vc.last_seen_at,
          vc.created_at,
          vc.updated_at,
          vc.name,
          vc.phone,
          vc.company,
          vc.role,
          vc.avatar_url,
          vc.status_key,
          vc.location_json,
          vc.source_json,
          vc.notes_json,
          vc.page_history_json,
          vc.total_page_views,
          LOWER(vc.email) AS email_key
        FROM visitor_contacts vc
        INNER JOIN sites s
          ON s.id = vc.site_id
        WHERE vc.site_id = $1
          AND vc.email = $2
        LIMIT 1
      ),
      conversation_stats AS (
        SELECT COUNT(*)::int AS conversation_count
        FROM conversations c
        INNER JOIN target_contact tc
          ON tc.site_id = c.site_id
         AND tc.email_key = LOWER(COALESCE(c.email, ''))
      ),
      session_stats AS (
        SELECT
          COUNT(*)::int AS total_visits,
          COALESCE(ROUND(AVG(EXTRACT(EPOCH FROM (vps.last_seen_at - vps.started_at)))), 0)::int AS avg_session_seconds
        FROM visitor_presence_sessions vps
        INNER JOIN target_contact tc
          ON tc.site_id = vps.site_id
         AND tc.email_key = LOWER(COALESCE(vps.email, ''))
      )
      SELECT
        ${contactStoredFields("tc")},
        COALESCE(cs.conversation_count, 0) AS conversation_count,
        COALESCE(ss.total_visits, 0) AS total_visits,
        COALESCE(ss.avg_session_seconds, 0) AS avg_session_seconds
      FROM target_contact tc
      LEFT JOIN conversation_stats cs
        ON TRUE
      LEFT JOIN session_stats ss
        ON TRUE
    `,
    [siteId, email]
  );

  return result.rows[0] ?? null;
}

export async function findAccessibleDashboardContactRow(
  ownerUserId: string,
  viewerUserId: string,
  siteId: string,
  email: string
) {
  await ensureVisitorContactColumns();
  const result = await query<DashboardContactRow>(
    `
      WITH target_contact AS (
        SELECT
          vc.site_id,
          s.name AS site_name,
          vc.email,
          vc.latest_conversation_id,
          vc.latest_session_id,
          vc.tags_json,
          vc.custom_fields_json,
          vc.first_seen_at,
          vc.last_seen_at,
          vc.created_at,
          vc.updated_at,
          vc.name,
          vc.phone,
          vc.company,
          vc.role,
          vc.avatar_url,
          vc.status_key,
          vc.location_json,
          vc.source_json,
          vc.notes_json,
          vc.page_history_json,
          vc.total_page_views,
          LOWER(vc.email) AS email_key
        FROM visitor_contacts vc
        INNER JOIN sites s
          ON s.id = vc.site_id
        WHERE vc.site_id = $1
          AND vc.email = $2
          AND ${workspaceAccessClause("s.user_id", "$3", "$4")}
        LIMIT 1
      ),
      conversation_stats AS (
        SELECT COUNT(*)::int AS conversation_count
        FROM conversations c
        INNER JOIN target_contact tc
          ON tc.site_id = c.site_id
         AND tc.email_key = LOWER(COALESCE(c.email, ''))
      ),
      session_stats AS (
        SELECT
          COUNT(*)::int AS total_visits,
          COALESCE(ROUND(AVG(EXTRACT(EPOCH FROM (vps.last_seen_at - vps.started_at)))), 0)::int AS avg_session_seconds
        FROM visitor_presence_sessions vps
        INNER JOIN target_contact tc
          ON tc.site_id = vps.site_id
         AND tc.email_key = LOWER(COALESCE(vps.email, ''))
      )
      SELECT
        ${contactStoredFields("tc")},
        COALESCE(cs.conversation_count, 0) AS conversation_count,
        COALESCE(ss.total_visits, 0) AS total_visits,
        COALESCE(ss.avg_session_seconds, 0) AS avg_session_seconds
      FROM target_contact tc
      LEFT JOIN conversation_stats cs
        ON TRUE
      LEFT JOIN session_stats ss
        ON TRUE
    `,
    [siteId, email, ownerUserId, viewerUserId]
  );

  return result.rows[0] ?? null;
}

export async function listDashboardContactRows(ownerUserId: string, viewerUserId: string) {
  await ensureVisitorContactColumns();
  const result = await query<DashboardContactRow>(
    `
      WITH accessible_contacts AS (
        SELECT
          vc.site_id,
          s.name AS site_name,
          vc.email,
          vc.latest_conversation_id,
          vc.latest_session_id,
          vc.tags_json,
          vc.custom_fields_json,
          vc.first_seen_at,
          vc.last_seen_at,
          vc.created_at,
          vc.updated_at,
          vc.name,
          vc.phone,
          vc.company,
          vc.role,
          vc.avatar_url,
          vc.status_key,
          vc.location_json,
          vc.source_json,
          NULL::jsonb AS notes_json,
          NULL::jsonb AS page_history_json,
          vc.total_page_views,
          LOWER(vc.email) AS email_key
        FROM visitor_contacts vc
        INNER JOIN sites s
          ON s.id = vc.site_id
        WHERE ${workspaceAccessClause("s.user_id", "$1", "$2")}
      ),
      contact_keys AS (
        SELECT DISTINCT site_id, email_key
        FROM accessible_contacts
      ),
      conversation_stats AS (
        SELECT
          c.site_id,
          LOWER(COALESCE(c.email, '')) AS email_key,
          COUNT(*)::int AS conversation_count
        FROM conversations c
        INNER JOIN contact_keys ck
          ON ck.site_id = c.site_id
         AND ck.email_key = LOWER(COALESCE(c.email, ''))
        GROUP BY c.site_id, LOWER(COALESCE(c.email, ''))
      ),
      session_stats AS (
        SELECT
          vps.site_id,
          LOWER(COALESCE(vps.email, '')) AS email_key,
          COUNT(*)::int AS total_visits,
          COALESCE(ROUND(AVG(EXTRACT(EPOCH FROM (vps.last_seen_at - vps.started_at)))), 0)::int AS avg_session_seconds
        FROM visitor_presence_sessions vps
        INNER JOIN contact_keys ck
          ON ck.site_id = vps.site_id
         AND ck.email_key = LOWER(COALESCE(vps.email, ''))
        GROUP BY vps.site_id, LOWER(COALESCE(vps.email, ''))
      )
      SELECT
        ac.site_id,
        ac.site_name,
        ac.email,
        ac.latest_conversation_id,
        ac.latest_session_id,
        ac.tags_json,
        ac.custom_fields_json,
        ac.first_seen_at,
        ac.last_seen_at,
        ac.created_at,
        ac.updated_at,
        ac.name,
        ac.phone,
        ac.company,
        ac.role,
        ac.avatar_url,
        ac.status_key,
        ac.location_json,
        ac.source_json,
        ac.notes_json,
        ac.page_history_json,
        ac.total_page_views,
        COALESCE(cs.conversation_count, 0) AS conversation_count,
        COALESCE(ss.total_visits, 0) AS total_visits,
        COALESCE(ss.avg_session_seconds, 0) AS avg_session_seconds
      FROM accessible_contacts ac
      LEFT JOIN conversation_stats cs
        ON cs.site_id = ac.site_id
       AND cs.email_key = ac.email_key
      LEFT JOIN session_stats ss
        ON ss.site_id = ac.site_id
       AND ss.email_key = ac.email_key
      ORDER BY ac.last_seen_at DESC, ac.email ASC
    `,
    [ownerUserId, viewerUserId]
  );

  return result.rows;
}

export async function listDashboardContactTagOptions(ownerUserId: string, viewerUserId: string) {
  await ensureVisitorContactColumns();
  const result = await query<DashboardContactTagRow>(
    `
      SELECT DISTINCT tag.value AS tag
      FROM visitor_contacts vc
      INNER JOIN sites s
        ON s.id = vc.site_id
      CROSS JOIN LATERAL jsonb_array_elements_text(
        CASE
          WHEN jsonb_typeof(COALESCE(vc.tags_json, '[]'::jsonb)) = 'array'
            THEN COALESCE(vc.tags_json, '[]'::jsonb)
          ELSE '[]'::jsonb
        END
      ) AS tag(value)
      WHERE ${workspaceAccessClause("s.user_id", "$1", "$2")}
      ORDER BY tag.value ASC
    `,
    [ownerUserId, viewerUserId]
  );

  return result.rows.map((row) => row.tag).filter(Boolean);
}

export async function saveDashboardContactRow(input: {
  siteId: string;
  email: string;
  latestConversationId: string | null;
  latestSessionId: string | null;
  tagsJson: string[];
  customFieldsJson: Record<string, string>;
  firstSeenAt: string;
  lastSeenAt: string;
  name: string | null;
  phone: string | null;
  company: string | null;
  role: string | null;
  avatarUrl: string | null;
  statusKey: string;
  locationJson: Record<string, string | null>;
  sourceJson: Record<string, string | null>;
  notesJson: unknown[];
  pageHistoryJson: unknown[];
  totalPageViews: number;
}) {
  await ensureVisitorContactColumns();
  await query(
    `
      INSERT INTO visitor_contacts (
        site_id,
        email,
        latest_conversation_id,
        latest_session_id,
        tags_json,
        custom_fields_json,
        first_seen_at,
        last_seen_at,
        created_at,
        updated_at,
        name,
        phone,
        company,
        role,
        avatar_url,
        status_key,
        location_json,
        source_json,
        notes_json,
        page_history_json,
        total_page_views
      )
      VALUES (
        $1, $2, $3, $4, $5::jsonb, $6::jsonb, $7, $8, NOW(), NOW(),
        $9, $10, $11, $12, $13, $14, $15::jsonb, $16::jsonb, $17::jsonb, $18::jsonb, $19
      )
      ON CONFLICT (site_id, email)
      DO UPDATE SET
        latest_conversation_id = EXCLUDED.latest_conversation_id,
        latest_session_id = EXCLUDED.latest_session_id,
        tags_json = EXCLUDED.tags_json,
        custom_fields_json = EXCLUDED.custom_fields_json,
        first_seen_at = EXCLUDED.first_seen_at,
        last_seen_at = EXCLUDED.last_seen_at,
        updated_at = NOW(),
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        company = EXCLUDED.company,
        role = EXCLUDED.role,
        avatar_url = EXCLUDED.avatar_url,
        status_key = EXCLUDED.status_key,
        location_json = EXCLUDED.location_json,
        source_json = EXCLUDED.source_json,
        notes_json = EXCLUDED.notes_json,
        page_history_json = EXCLUDED.page_history_json,
        total_page_views = EXCLUDED.total_page_views
    `,
    [
      input.siteId,
      input.email,
      input.latestConversationId,
      input.latestSessionId,
      JSON.stringify(input.tagsJson),
      JSON.stringify(input.customFieldsJson),
      input.firstSeenAt,
      input.lastSeenAt,
      input.name,
      input.phone,
      input.company,
      input.role,
      input.avatarUrl,
      input.statusKey,
      JSON.stringify(input.locationJson),
      JSON.stringify(input.sourceJson),
      JSON.stringify(input.notesJson),
      JSON.stringify(input.pageHistoryJson),
      input.totalPageViews
    ]
  );
}

export async function deleteDashboardContactRow(siteId: string, email: string) {
  await ensureVisitorContactColumns();
  await query(
    `
      DELETE FROM visitor_contacts
      WHERE site_id = $1
        AND email = $2
    `,
    [siteId, email]
  );
}
