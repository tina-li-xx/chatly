import { query } from "@/lib/db";

type TeamMobilePushRegistrationRow = {
  provider: "expo" | "apns" | "fcm";
  push_token: string;
  bundle_id: string | null;
  environment: "sandbox" | "production" | null;
};

export async function upsertTeamMobileDeviceRow(input: {
  id: string;
  userId: string;
  provider: "expo" | "apns" | "fcm";
  pushToken: string;
  platform: string | null;
  appId: string | null;
  bundleId: string | null;
  environment: "sandbox" | "production" | null;
}) {
  await query(
    `
      INSERT INTO team_mobile_devices (
        id, user_id, provider, push_token, platform, app_id, bundle_id, environment, last_seen_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
      ON CONFLICT (push_token)
      DO UPDATE SET
        user_id = EXCLUDED.user_id,
        provider = EXCLUDED.provider,
        platform = COALESCE(EXCLUDED.platform, team_mobile_devices.platform),
        app_id = COALESCE(EXCLUDED.app_id, team_mobile_devices.app_id),
        bundle_id = COALESCE(EXCLUDED.bundle_id, team_mobile_devices.bundle_id),
        environment = COALESCE(EXCLUDED.environment, team_mobile_devices.environment),
        disabled_at = NULL,
        last_seen_at = NOW(),
        updated_at = NOW()
    `,
    [
      input.id,
      input.userId,
      input.provider,
      input.pushToken,
      input.platform,
      input.appId,
      input.bundleId,
      input.environment
    ]
  );
}

export async function disableTeamMobileDeviceRow(input: {
  userId: string;
  pushToken: string;
}) {
  await query(
    `
      UPDATE team_mobile_devices
      SET disabled_at = NOW(),
          updated_at = NOW()
      WHERE user_id = $1
        AND push_token = $2
        AND disabled_at IS NULL
    `,
    [input.userId, input.pushToken]
  );
}

export async function disableTeamMobilePushTokens(pushTokens: string[]) {
  if (!pushTokens.length) {
    return;
  }

  await query(
    `
      UPDATE team_mobile_devices
      SET disabled_at = NOW(),
          updated_at = NOW()
      WHERE push_token = ANY ($1::text[])
        AND disabled_at IS NULL
    `,
    [pushTokens]
  );
}

export async function listActiveTeamMobilePushRegistrations(userId: string) {
  const result = await query<TeamMobilePushRegistrationRow>(
    `
      SELECT provider, push_token, bundle_id, environment
      FROM team_mobile_devices
      WHERE user_id = $1
        AND disabled_at IS NULL
      ORDER BY updated_at DESC
    `,
    [userId]
  );

  return result.rows.map((row) => ({
    provider: row.provider,
    pushToken: row.push_token,
    bundleId: row.bundle_id,
    environment: row.environment
  }));
}
