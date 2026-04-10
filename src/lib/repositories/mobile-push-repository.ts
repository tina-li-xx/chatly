import { query } from "@/lib/db";

export type MobilePushRegistrationRow = {
  id: string;
  site_id: string;
  conversation_id: string | null;
  session_id: string;
  provider: "expo" | "apns";
  platform: string | null;
  app_id: string | null;
  bundle_id: string | null;
  environment: "sandbox" | "production" | null;
  push_token: string;
  disabled_at: string | null;
  last_seen_at: string;
  created_at: string;
  updated_at: string;
};

export async function upsertMobilePushRegistrationRow(input: {
  id: string;
  siteId: string;
  sessionId: string;
  conversationId: string | null;
  provider: "expo" | "apns";
  platform: string | null;
  appId: string | null;
  bundleId: string | null;
  environment: "sandbox" | "production" | null;
  pushToken: string;
}) {
  const result = await query<MobilePushRegistrationRow>(
    `
      INSERT INTO mobile_push_registrations (
        id, site_id, session_id, conversation_id, provider, platform, app_id, bundle_id, environment, push_token, last_seen_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
      ON CONFLICT (push_token)
      DO UPDATE SET
        site_id = EXCLUDED.site_id,
        session_id = EXCLUDED.session_id,
        conversation_id = COALESCE(EXCLUDED.conversation_id, mobile_push_registrations.conversation_id),
        provider = EXCLUDED.provider,
        platform = COALESCE(EXCLUDED.platform, mobile_push_registrations.platform),
        app_id = COALESCE(EXCLUDED.app_id, mobile_push_registrations.app_id),
        bundle_id = COALESCE(EXCLUDED.bundle_id, mobile_push_registrations.bundle_id),
        environment = COALESCE(EXCLUDED.environment, mobile_push_registrations.environment),
        disabled_at = NULL,
        last_seen_at = NOW(),
        updated_at = NOW()
      RETURNING *
    `,
    [
      input.id,
      input.siteId,
      input.sessionId,
      input.conversationId,
      input.provider,
      input.platform,
      input.appId,
      input.bundleId,
      input.environment,
      input.pushToken
    ]
  );

  return result.rows[0] ?? null;
}

export async function disableMobilePushRegistrationRow(input: {
  siteId: string;
  sessionId: string;
  pushToken: string;
}) {
  await query(
    `
      UPDATE mobile_push_registrations
      SET disabled_at = NOW(),
          updated_at = NOW()
      WHERE site_id = $1
        AND session_id = $2
        AND push_token = $3
        AND disabled_at IS NULL
    `,
    [input.siteId, input.sessionId, input.pushToken]
  );
}

export async function bindMobilePushRegistrationsToConversationRow(input: {
  siteId: string;
  sessionId: string;
  conversationId: string;
}) {
  await query(
    `
      UPDATE mobile_push_registrations
      SET conversation_id = $3,
          disabled_at = NULL,
          last_seen_at = NOW(),
          updated_at = NOW()
      WHERE site_id = $1
        AND session_id = $2
        AND disabled_at IS NULL
    `,
    [input.siteId, input.sessionId, input.conversationId]
  );
}

export async function listConversationMobilePushRegistrationsRow(input: {
  ownerUserId: string;
  conversationId: string;
}) {
  const result = await query<Pick<MobilePushRegistrationRow, "provider" | "push_token" | "bundle_id" | "environment">>(
    `
      SELECT DISTINCT mpr.provider, mpr.push_token, mpr.bundle_id, mpr.environment
      FROM mobile_push_registrations mpr
      INNER JOIN conversations c
        ON c.id = mpr.conversation_id
      INNER JOIN sites s
        ON s.id = c.site_id
      WHERE c.id = $1
        AND s.user_id = $2
        AND mpr.disabled_at IS NULL
      ORDER BY mpr.provider ASC, mpr.push_token ASC
    `,
    [input.conversationId, input.ownerUserId]
  );

  return result.rows.map((row) => ({
    provider: row.provider,
    pushToken: row.push_token,
    bundleId: row.bundle_id,
    environment: row.environment
  }));
}

export async function disableMobilePushTokensRow(pushTokens: string[]) {
  if (!pushTokens.length) {
    return;
  }

  await query(
    `
      UPDATE mobile_push_registrations
      SET disabled_at = NOW(),
          updated_at = NOW()
      WHERE push_token = ANY ($1::text[])
        AND disabled_at IS NULL
    `,
    [pushTokens]
  );
}
