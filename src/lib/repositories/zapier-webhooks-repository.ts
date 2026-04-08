import { query } from "@/lib/db";

export type ZapierEventType =
  | "conversation.created"
  | "conversation.resolved"
  | "contact.created"
  | "tag.added";

export type WorkspaceZapierWebhookRow = {
  id: string;
  owner_user_id: string;
  event_type: ZapierEventType;
  target_url: string;
  active: boolean;
  last_triggered_at: string | null;
  last_response_code: number | null;
  last_response_body: string | null;
  created_at: string;
  updated_at: string;
};

const WEBHOOK_COLUMNS = `
  id,
  owner_user_id,
  event_type,
  target_url,
  active,
  last_triggered_at,
  last_response_code,
  last_response_body,
  created_at,
  updated_at
`;

export async function countActiveWorkspaceZapierWebhookRows(
  ownerUserId: string
) {
  const result = await query<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM workspace_zapier_webhooks WHERE owner_user_id = $1 AND active = TRUE`,
    [ownerUserId]
  );

  return Number(result.rows[0]?.count ?? "0");
}

export async function listActiveWorkspaceZapierWebhookRows(input: {
  ownerUserId: string;
  eventType: ZapierEventType;
}) {
  const result = await query<WorkspaceZapierWebhookRow>(
    `SELECT ${WEBHOOK_COLUMNS} FROM workspace_zapier_webhooks WHERE owner_user_id = $1 AND event_type = $2 AND active = TRUE ORDER BY created_at ASC`,
    [input.ownerUserId, input.eventType]
  );

  return result.rows;
}

export async function upsertWorkspaceZapierWebhookRow(input: {
  id: string;
  ownerUserId: string;
  eventType: ZapierEventType;
  targetUrl: string;
}) {
  const result = await query<WorkspaceZapierWebhookRow>(
    `INSERT INTO workspace_zapier_webhooks (id, owner_user_id, event_type, target_url, active, created_at, updated_at) VALUES ($1, $2, $3, $4, TRUE, NOW(), NOW()) ON CONFLICT (owner_user_id, event_type, target_url) DO UPDATE SET active = TRUE, updated_at = NOW() RETURNING ${WEBHOOK_COLUMNS}`,
    [input.id, input.ownerUserId, input.eventType, input.targetUrl]
  );

  return result.rows[0] ?? null;
}

export async function recordWorkspaceZapierWebhookDelivery(input: {
  id: string;
  ownerUserId: string;
  lastTriggeredAt?: string | null;
  lastResponseCode?: number | null;
  lastResponseBody?: string | null;
}) {
  const result = await query<WorkspaceZapierWebhookRow>(
    `UPDATE workspace_zapier_webhooks SET last_triggered_at = COALESCE($3::timestamptz, NOW()), last_response_code = $4, last_response_body = $5, updated_at = NOW() WHERE id = $1 AND owner_user_id = $2 RETURNING ${WEBHOOK_COLUMNS}`,
    [
      input.id,
      input.ownerUserId,
      input.lastTriggeredAt ?? null,
      input.lastResponseCode ?? null,
      input.lastResponseBody ?? null
    ]
  );

  return result.rows[0] ?? null;
}

export async function deactivateWorkspaceZapierWebhookRow(
  id: string,
  ownerUserId: string
) {
  const result = await query<WorkspaceZapierWebhookRow>(
    `UPDATE workspace_zapier_webhooks SET active = FALSE, updated_at = NOW() WHERE id = $1 AND owner_user_id = $2 RETURNING ${WEBHOOK_COLUMNS}`,
    [id, ownerUserId]
  );

  return result.rows[0] ?? null;
}

export async function deactivateWorkspaceZapierWebhookRows(
  ownerUserId: string
) {
  const result = await query<WorkspaceZapierWebhookRow>(
    `UPDATE workspace_zapier_webhooks SET active = FALSE, updated_at = NOW() WHERE owner_user_id = $1 AND active = TRUE RETURNING ${WEBHOOK_COLUMNS}`,
    [ownerUserId]
  );

  return result.rows;
}
