import { query } from "@/lib/db";

type MobileNotificationPreferencesRow = {
  mobile_push_all_message_alerts: boolean | null;
  mobile_push_assignment_alerts: boolean | null;
  mobile_push_enabled: boolean | null;
  mobile_push_new_conversation_alerts: boolean | null;
  mobile_push_sound: string | null;
  mobile_push_sound_alerts: boolean | null;
  mobile_push_vibration_alerts: boolean | null;
};

export async function findMobileNotificationPreferencesRow(userId: string) {
  const result = await query<MobileNotificationPreferencesRow>(
    `
      SELECT
        mobile_push_all_message_alerts,
        mobile_push_assignment_alerts,
        mobile_push_enabled,
        mobile_push_new_conversation_alerts,
        mobile_push_sound,
        mobile_push_sound_alerts,
        mobile_push_vibration_alerts
      FROM user_settings
      WHERE user_id = $1
      LIMIT 1
    `,
    [userId]
  );

  return result.rows[0] ?? null;
}

export async function upsertMobileNotificationPreferencesRow(input: {
  allMessagesEnabled: boolean;
  assignedEnabled: boolean;
  newConversationEnabled: boolean;
  pushEnabled: boolean;
  soundName: string;
  userId: string;
  vibrationEnabled: boolean;
}) {
  await query(
    `
      INSERT INTO user_settings (
        user_id,
        mobile_push_all_message_alerts,
        mobile_push_assignment_alerts,
        mobile_push_enabled,
        mobile_push_new_conversation_alerts,
        mobile_push_sound,
        mobile_push_sound_alerts,
        mobile_push_vibration_alerts,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      ON CONFLICT (user_id) DO UPDATE SET
        mobile_push_all_message_alerts = EXCLUDED.mobile_push_all_message_alerts,
        mobile_push_assignment_alerts = EXCLUDED.mobile_push_assignment_alerts,
        mobile_push_enabled = EXCLUDED.mobile_push_enabled,
        mobile_push_new_conversation_alerts = EXCLUDED.mobile_push_new_conversation_alerts,
        mobile_push_sound = EXCLUDED.mobile_push_sound,
        mobile_push_sound_alerts = EXCLUDED.mobile_push_sound_alerts,
        mobile_push_vibration_alerts = EXCLUDED.mobile_push_vibration_alerts,
        updated_at = NOW()
    `,
    [
      input.userId,
      input.allMessagesEnabled,
      input.assignedEnabled,
      input.pushEnabled,
      input.newConversationEnabled,
      input.soundName,
      input.soundName !== "none",
      input.vibrationEnabled
    ]
  );
}
