import { query } from "@/lib/db";

type AiAssistSettingsRow = {
  workspace_ai_assist_settings_json: string | null;
};

let aiAssistSettingsColumnReady = false;

async function ensureAiAssistSettingsColumn() {
  if (aiAssistSettingsColumnReady) {
    return;
  }

  await query(
    `
      ALTER TABLE user_settings
      ADD COLUMN IF NOT EXISTS workspace_ai_assist_settings_json TEXT NOT NULL DEFAULT ''
    `
  );
  aiAssistSettingsColumnReady = true;
}

export async function findWorkspaceAiAssistSettingsValue(userId: string) {
  await ensureAiAssistSettingsColumn();
  const result = await query<AiAssistSettingsRow>(
    `
      SELECT workspace_ai_assist_settings_json
      FROM user_settings
      WHERE user_id = $1
      LIMIT 1
    `,
    [userId]
  );

  return result.rows[0]?.workspace_ai_assist_settings_json ?? "";
}

export async function upsertWorkspaceAiAssistSettings(
  ownerUserId: string,
  value: string
) {
  await ensureAiAssistSettingsColumn();
  await query(
    `
      INSERT INTO user_settings (
        user_id,
        workspace_ai_assist_settings_json
      )
      VALUES ($1, $2)
      ON CONFLICT (user_id)
      DO UPDATE SET
        workspace_ai_assist_settings_json = EXCLUDED.workspace_ai_assist_settings_json
    `,
    [ownerUserId, value]
  );
}
