import { query } from "@/lib/db";

export type WorkspaceSlackThreadRow = {
  conversation_id: string;
  owner_user_id: string;
  slack_team_id: string;
  slack_channel_id: string;
  slack_channel_name: string | null;
  slack_message_ts: string;
  slack_thread_ts: string;
  created_at: string;
  updated_at: string;
};

const SLACK_THREAD_COLUMNS = `
  conversation_id,
  owner_user_id,
  slack_team_id,
  slack_channel_id,
  slack_channel_name,
  slack_message_ts,
  slack_thread_ts,
  created_at,
  updated_at
`;

export async function findSlackThreadByConversationId(
  conversationId: string
) {
  const result = await query<WorkspaceSlackThreadRow>(
    `SELECT ${SLACK_THREAD_COLUMNS} FROM workspace_slack_threads WHERE conversation_id = $1 LIMIT 1`,
    [conversationId]
  );
  return result.rows[0] ?? null;
}

export async function findSlackThreadByThreadKey(input: {
  slackTeamId: string;
  slackChannelId: string;
  slackThreadTs: string;
}) {
  const result = await query<WorkspaceSlackThreadRow>(
    `SELECT ${SLACK_THREAD_COLUMNS} FROM workspace_slack_threads WHERE slack_team_id = $1 AND slack_channel_id = $2 AND slack_thread_ts = $3 LIMIT 1`,
    [input.slackTeamId, input.slackChannelId, input.slackThreadTs]
  );
  return result.rows[0] ?? null;
}

export async function upsertSlackThreadRow(input: {
  conversationId: string;
  ownerUserId: string;
  slackTeamId: string;
  slackChannelId: string;
  slackChannelName?: string | null;
  slackMessageTs: string;
  slackThreadTs: string;
}) {
  const result = await query<WorkspaceSlackThreadRow>(
    `INSERT INTO workspace_slack_threads (conversation_id, owner_user_id, slack_team_id, slack_channel_id, slack_channel_name, slack_message_ts, slack_thread_ts, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW()) ON CONFLICT (conversation_id) DO UPDATE SET owner_user_id = EXCLUDED.owner_user_id, slack_team_id = EXCLUDED.slack_team_id, slack_channel_id = EXCLUDED.slack_channel_id, slack_channel_name = EXCLUDED.slack_channel_name, slack_message_ts = EXCLUDED.slack_message_ts, slack_thread_ts = EXCLUDED.slack_thread_ts, updated_at = NOW() RETURNING ${SLACK_THREAD_COLUMNS}`,
    [input.conversationId, input.ownerUserId, input.slackTeamId, input.slackChannelId, input.slackChannelName ?? null, input.slackMessageTs, input.slackThreadTs]
  );
  return result.rows[0] ?? null;
}
