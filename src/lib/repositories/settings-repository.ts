import { query } from "@/lib/db";

export type UserSettingsRow = {
  user_id: string;
  email: string;
  created_at: string;
  first_name: string | null;
  last_name: string | null;
  job_title: string | null;
  avatar_data_url: string | null;
  notification_email: string | null;
  reply_to_email: string | null;
  email_templates_json: string | null;
  browser_notifications: boolean | null;
  sound_alerts: boolean | null;
  email_notifications: boolean | null;
  new_visitor_alerts: boolean | null;
  high_intent_alerts: boolean | null;
  email_signature: string | null;
  last_seen_at: string | null;
};

export type TeamInviteRow = {
  id: string;
  email: string;
  role: "admin" | "member";
  status: "pending" | "accepted" | "revoked";
  message: string;
  accepted_at: string | null;
  accepted_by_user_id: string | null;
  created_at: string;
  updated_at: string;
};

export type BillingSummaryRow = {
  conversation_count: string;
  site_count: string;
};

export async function findNotificationSettingsRow(userId: string) {
  const result = await query<
    Pick<
      UserSettingsRow,
      | "notification_email"
      | "browser_notifications"
      | "sound_alerts"
      | "email_notifications"
      | "new_visitor_alerts"
      | "high_intent_alerts"
    > & { email: string }
  >(
    `
      SELECT
        u.email,
        us.notification_email,
        us.browser_notifications,
        us.sound_alerts,
        us.email_notifications,
        us.new_visitor_alerts,
        us.high_intent_alerts
      FROM users u
      LEFT JOIN user_settings us
        ON us.user_id = u.id
      WHERE u.id = $1
      LIMIT 1
    `,
    [userId]
  );

  return result.rows[0] ?? null;
}

export async function findEmailTemplateSettingsRow(userId: string) {
  const result = await query<
    Pick<
      UserSettingsRow,
      | "email"
      | "first_name"
      | "last_name"
      | "avatar_data_url"
      | "notification_email"
      | "reply_to_email"
      | "email_templates_json"
      | "email_signature"
    >
  >(
    `
      SELECT
        u.email,
        us.first_name,
        us.last_name,
        us.avatar_data_url,
        us.notification_email,
        us.reply_to_email,
        us.email_templates_json,
        us.email_signature
      FROM users u
      LEFT JOIN user_settings us
        ON us.user_id = u.id
      WHERE u.id = $1
      LIMIT 1
    `,
    [userId]
  );

  return result.rows[0] ?? null;
}

export async function findDashboardSettingsRow(userId: string) {
  const result = await query<UserSettingsRow>(
    `
      SELECT
        u.id AS user_id,
        u.email,
        u.created_at,
        us.first_name,
        us.last_name,
        us.job_title,
        us.avatar_data_url,
        us.notification_email,
        us.reply_to_email,
        us.email_templates_json,
        us.browser_notifications,
        us.sound_alerts,
        us.email_notifications,
        us.new_visitor_alerts,
        us.high_intent_alerts,
        us.email_signature,
        up.last_seen_at
      FROM users u
      LEFT JOIN user_settings us
        ON us.user_id = u.id
      LEFT JOIN user_presence up
        ON up.user_id = u.id
      WHERE u.id = $1
      LIMIT 1
    `,
    [userId]
  );

  return result.rows[0] ?? null;
}

export async function listPendingTeamInviteRows(ownerUserId: string) {
  const result = await query<TeamInviteRow>(
    `
      SELECT
        id,
        email,
        role,
        status,
        message,
        accepted_at,
        accepted_by_user_id,
        created_at,
        updated_at
      FROM team_invites
      WHERE owner_user_id = $1
        AND status = 'pending'
      ORDER BY updated_at DESC
    `,
    [ownerUserId]
  );

  return result.rows;
}

export async function findBillingSummaryRow(userId: string) {
  const result = await query<BillingSummaryRow>(
    `
      SELECT
        COUNT(c.id)::text AS conversation_count,
        COUNT(DISTINCT s.id)::text AS site_count
      FROM sites s
      LEFT JOIN conversations c
        ON c.site_id = s.id
      WHERE s.user_id = $1
    `,
    [userId]
  );

  return result.rows[0] ?? { conversation_count: "0", site_count: "0" };
}

export async function findUserIdByEmailExcludingUser(email: string, userId: string) {
  const result = await query<{ id: string }>(
    `
      SELECT id
      FROM users
      WHERE email = $1
        AND id <> $2
      LIMIT 1
    `,
    [email, userId]
  );

  return result.rows[0]?.id ?? null;
}

export async function updateSettingsUserEmail(userId: string, email: string) {
  await query(
    `
      UPDATE users
      SET email = $2
      WHERE id = $1
    `,
    [userId, email]
  );
}

export async function upsertUserSettingsRecord(input: {
  userId: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  avatarDataUrl: string | null;
  notificationEmail: string | null;
  replyToEmail: string | null;
  emailTemplatesJson: string;
  browserNotifications: boolean;
  soundAlerts: boolean;
  emailNotifications: boolean;
  newVisitorAlerts: boolean;
  highIntentAlerts: boolean;
  emailSignature: string;
}) {
  await query(
    `
      INSERT INTO user_settings (
        user_id,
        first_name,
        last_name,
        job_title,
        avatar_data_url,
        notification_email,
        reply_to_email,
        email_templates_json,
        browser_notifications,
        sound_alerts,
        email_notifications,
        new_visitor_alerts,
        high_intent_alerts,
        email_signature,
        updated_at
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, NOW()
      )
      ON CONFLICT (user_id) DO UPDATE SET
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        job_title = EXCLUDED.job_title,
        avatar_data_url = EXCLUDED.avatar_data_url,
        notification_email = EXCLUDED.notification_email,
        reply_to_email = EXCLUDED.reply_to_email,
        email_templates_json = EXCLUDED.email_templates_json,
        browser_notifications = EXCLUDED.browser_notifications,
        sound_alerts = EXCLUDED.sound_alerts,
        email_notifications = EXCLUDED.email_notifications,
        new_visitor_alerts = EXCLUDED.new_visitor_alerts,
        high_intent_alerts = EXCLUDED.high_intent_alerts,
        email_signature = EXCLUDED.email_signature,
        updated_at = NOW()
    `,
    [
      input.userId,
      input.firstName,
      input.lastName,
      input.jobTitle,
      input.avatarDataUrl,
      input.notificationEmail,
      input.replyToEmail,
      input.emailTemplatesJson,
      input.browserNotifications,
      input.soundAlerts,
      input.emailNotifications,
      input.newVisitorAlerts,
      input.highIntentAlerts,
      input.emailSignature
    ]
  );
}

export async function insertTeamInviteRecord(input: {
  inviteId: string;
  ownerUserId: string;
  email: string;
  role: "admin" | "member";
  message: string;
}) {
  await query(
    `
      INSERT INTO team_invites (id, owner_user_id, email, role, message, status, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, 'pending', NOW(), NOW())
    `,
    [input.inviteId, input.ownerUserId, input.email, input.role, input.message]
  );
}

export async function touchPendingTeamInvite(ownerUserId: string, inviteId: string) {
  await query(
    `
      UPDATE team_invites
      SET updated_at = NOW()
      WHERE id = $1
        AND owner_user_id = $2
        AND status = 'pending'
    `,
    [inviteId, ownerUserId]
  );
}

export async function updatePendingTeamInviteRole(
  ownerUserId: string,
  inviteId: string,
  role: "admin" | "member"
) {
  await query(
    `
      UPDATE team_invites
      SET role = $3, updated_at = NOW()
      WHERE id = $1
        AND owner_user_id = $2
        AND status = 'pending'
    `,
    [inviteId, ownerUserId, role]
  );
}

export async function revokePendingTeamInvite(ownerUserId: string, inviteId: string) {
  await query(
    `
      UPDATE team_invites
      SET status = 'revoked', updated_at = NOW()
      WHERE id = $1
        AND owner_user_id = $2
        AND status = 'pending'
    `,
    [inviteId, ownerUserId]
  );
}
