import { query } from "@/lib/db";

export async function insertSiteRecord(input: {
  siteId: string;
  userId: string;
  name: string;
  domain: string | null;
  brandColor: string;
  widgetTitle: string;
  greetingText: string;
}) {
  await query(
    `
      INSERT INTO sites (id, user_id, name, domain, brand_color, widget_title, greeting_text)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `,
    [
      input.siteId,
      input.userId,
      input.name,
      input.domain,
      input.brandColor,
      input.widgetTitle,
      input.greetingText
    ]
  );
}

export async function findCreatedSiteRow(siteId: string) {
  const result = await query<{
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
  }>(
    `
      SELECT
        id,
        user_id,
        name,
        domain,
        brand_color,
        widget_title,
        greeting_text,
        launcher_position,
        avatar_style,
        team_photo_url,
        show_online_status,
        require_email_offline,
        offline_title,
        offline_message,
        away_title,
        away_message,
        sound_notifications,
        auto_open_paths,
        response_time_mode,
        operating_hours_enabled,
        operating_hours_timezone,
        operating_hours_json,
        widget_install_verified_at,
        widget_install_verified_url,
        widget_last_seen_at,
        widget_last_seen_url,
        created_at,
        '0'::text AS conversation_count
      FROM sites
      WHERE id = $1
      LIMIT 1
    `,
    [siteId]
  );

  return result.rows[0] ?? null;
}

export async function updateSiteWidgetTitleRecord(siteId: string, userId: string, widgetTitle: string) {
  const result = await query<{ widget_title: string }>(
    `
      UPDATE sites
      SET widget_title = $3
      WHERE id = $1
        AND user_id = $2
      RETURNING widget_title
    `,
    [siteId, userId, widgetTitle]
  );

  return result.rows[0]?.widget_title ?? null;
}

export async function updateSiteOnboardingSetupRecord(input: {
  siteId: string;
  userId: string;
  name: string;
  domain: string;
  widgetTitle: string;
}) {
  const result = await query<{ id: string }>(
    `
      UPDATE sites
      SET
        name = $3,
        domain = $4,
        widget_title = $5
      WHERE id = $1
        AND user_id = $2
      RETURNING id
    `,
    [input.siteId, input.userId, input.name, input.domain, input.widgetTitle]
  );

  return Boolean(result.rows[0]);
}

export async function updateSiteWidgetSettingsRecord(input: {
  siteId: string;
  userId: string;
  domain: string | null;
  brandColor: string;
  widgetTitle: string;
  greetingText: string;
  launcherPosition: string;
  avatarStyle: string;
  showOnlineStatus: boolean;
  requireEmailOffline: boolean;
  offlineTitle: string;
  offlineMessage: string;
  awayTitle: string;
  awayMessage: string;
  soundNotifications: boolean;
  autoOpenPaths: string[];
  responseTimeMode: string;
  operatingHoursEnabled: boolean;
  operatingHoursTimezone: string;
  operatingHoursJson: string;
}) {
  const result = await query<{ id: string }>(
    `
      UPDATE sites
      SET
        domain = $3,
        brand_color = $4,
        widget_title = $5,
        greeting_text = $6,
        launcher_position = $7,
        avatar_style = $8,
        show_online_status = $9,
        require_email_offline = $10,
        offline_title = $11,
        offline_message = $12,
        away_title = $13,
        away_message = $14,
        sound_notifications = $15,
        auto_open_paths = $16,
        response_time_mode = $17,
        operating_hours_enabled = $18,
        operating_hours_timezone = $19,
        operating_hours_json = $20
      WHERE id = $1
        AND user_id = $2
      RETURNING id
    `,
    [
      input.siteId,
      input.userId,
      input.domain,
      input.brandColor,
      input.widgetTitle,
      input.greetingText,
      input.launcherPosition,
      input.avatarStyle,
      input.showOnlineStatus,
      input.requireEmailOffline,
      input.offlineTitle,
      input.offlineMessage,
      input.awayTitle,
      input.awayMessage,
      input.soundNotifications,
      input.autoOpenPaths,
      input.responseTimeMode,
      input.operatingHoursEnabled,
      input.operatingHoursTimezone,
      input.operatingHoursJson
    ]
  );

  return Boolean(result.rows[0]);
}

export async function findSiteTeamPhotoRecord(siteId: string, userId: string) {
  const result = await query<{
    id: string;
    team_photo_url: string | null;
    team_photo_key: string | null;
  }>(
    `
      SELECT id, team_photo_url, team_photo_key
      FROM sites
      WHERE id = $1
        AND user_id = $2
      LIMIT 1
    `,
    [siteId, userId]
  );

  return result.rows[0] ?? null;
}

export async function updateSiteTeamPhotoRecord(
  siteId: string,
  userId: string,
  teamPhotoUrl: string,
  teamPhotoKey: string
) {
  const result = await query<{ id: string }>(
    `
      UPDATE sites
      SET
        team_photo_url = $3,
        team_photo_key = $4
      WHERE id = $1
        AND user_id = $2
      RETURNING id
    `,
    [siteId, userId, teamPhotoUrl, teamPhotoKey]
  );

  return Boolean(result.rows[0]);
}

export async function clearSiteTeamPhotoRecord(siteId: string, userId: string) {
  const result = await query<{ id: string }>(
    `
      UPDATE sites
      SET
        team_photo_url = NULL,
        team_photo_key = NULL
      WHERE id = $1
        AND user_id = $2
      RETURNING id
    `,
    [siteId, userId]
  );

  return Boolean(result.rows[0]);
}

export async function markSiteWidgetInstallVerifiedRecord(siteId: string, userId: string, verifiedUrl: string | null) {
  const result = await query<{ id: string }>(
    `
      UPDATE sites
      SET
        widget_install_verified_at = NOW(),
        widget_install_verified_url = $3
      WHERE id = $1
        AND user_id = $2
      RETURNING id
    `,
    [siteId, userId, verifiedUrl]
  );

  return Boolean(result.rows[0]);
}

export async function findSitePresenceRow(siteId: string) {
  const result = await query<{ last_seen_at: string | null }>(
    `
      SELECT MAX(up.last_seen_at) AS last_seen_at
      FROM sites s
      LEFT JOIN LATERAL (
        SELECT s.user_id AS user_id
        UNION ALL
        SELECT tm.member_user_id AS user_id
        FROM team_memberships tm
        WHERE tm.owner_user_id = s.user_id
          AND tm.status = 'active'
      ) workspace_members ON TRUE
      LEFT JOIN user_presence up
        ON up.user_id = workspace_members.user_id
      WHERE s.id = $1
      GROUP BY s.id
      LIMIT 1
    `,
    [siteId]
  );

  return result.rows[0] ?? null;
}

export async function touchSiteWidgetSeenRecord(siteId: string, pageUrl: string | null) {
  await query(
    `
      UPDATE sites
      SET
        widget_last_seen_at = NOW(),
        widget_last_seen_url = COALESCE($2, widget_last_seen_url)
      WHERE id = $1
    `,
    [siteId, pageUrl]
  );
}
