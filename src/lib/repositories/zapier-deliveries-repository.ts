import { query } from "@/lib/db";
import type { ZapierEventType } from "@/lib/repositories/zapier-webhooks-repository";

export type WorkspaceZapierDeliveryRow = {
  id: string;
  owner_user_id: string;
  webhook_id: string;
  event_type: ZapierEventType;
  event_key: string;
  payload_json: string;
  attempt_count: number;
  next_attempt_at: string | null;
  delivered_at: string | null;
  last_attempt_at: string | null;
  last_response_code: number | null;
  last_response_body: string | null;
  created_at: string;
  updated_at: string;
};

const DELIVERY_COLUMNS = `
  id,
  owner_user_id,
  webhook_id,
  event_type,
  event_key,
  payload_json,
  attempt_count,
  next_attempt_at,
  delivered_at,
  last_attempt_at,
  last_response_code,
  last_response_body,
  created_at,
  updated_at
`;

const QUALIFIED_DELIVERY_COLUMNS = `
  workspace_zapier_deliveries.id,
  workspace_zapier_deliveries.owner_user_id,
  workspace_zapier_deliveries.webhook_id,
  workspace_zapier_deliveries.event_type,
  workspace_zapier_deliveries.event_key,
  workspace_zapier_deliveries.payload_json,
  workspace_zapier_deliveries.attempt_count,
  workspace_zapier_deliveries.next_attempt_at,
  workspace_zapier_deliveries.delivered_at,
  workspace_zapier_deliveries.last_attempt_at,
  workspace_zapier_deliveries.last_response_code,
  workspace_zapier_deliveries.last_response_body,
  workspace_zapier_deliveries.created_at,
  workspace_zapier_deliveries.updated_at
`;

export async function findWorkspaceZapierDeliveryRow(input: {
  webhookId: string;
  eventType: ZapierEventType;
  eventKey: string;
}) {
  const result = await query<WorkspaceZapierDeliveryRow>(
    `SELECT ${DELIVERY_COLUMNS} FROM workspace_zapier_deliveries WHERE webhook_id = $1 AND event_type = $2 AND event_key = $3 LIMIT 1`,
    [input.webhookId, input.eventType, input.eventKey]
  );

  return result.rows[0] ?? null;
}

export async function insertWorkspaceZapierDeliveryRow(input: {
  id: string;
  ownerUserId: string;
  webhookId: string;
  eventType: ZapierEventType;
  eventKey: string;
  payloadJson: string;
  nextAttemptAt?: string | null;
}) {
  const result = await query<WorkspaceZapierDeliveryRow>(
    `INSERT INTO workspace_zapier_deliveries (id, owner_user_id, webhook_id, event_type, event_key, payload_json, next_attempt_at, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7::timestamptz, NOW()), NOW(), NOW()) ON CONFLICT (webhook_id, event_type, event_key) DO NOTHING RETURNING ${DELIVERY_COLUMNS}`,
    [
      input.id,
      input.ownerUserId,
      input.webhookId,
      input.eventType,
      input.eventKey,
      input.payloadJson,
      input.nextAttemptAt ?? null
    ]
  );

  return result.rows[0] ?? null;
}

export async function updateWorkspaceZapierDeliveryRow(input: {
  id: string;
  ownerUserId: string;
  attemptCount: number;
  nextAttemptAt?: string | null;
  deliveredAt?: string | null;
  lastAttemptAt?: string | null;
  lastResponseCode?: number | null;
  lastResponseBody?: string | null;
}) {
  const result = await query<WorkspaceZapierDeliveryRow>(
    `UPDATE workspace_zapier_deliveries SET attempt_count = $3, next_attempt_at = $4, delivered_at = $5, last_attempt_at = COALESCE($6::timestamptz, NOW()), last_response_code = $7, last_response_body = $8, updated_at = NOW() WHERE id = $1 AND owner_user_id = $2 RETURNING ${DELIVERY_COLUMNS}`,
    [
      input.id,
      input.ownerUserId,
      input.attemptCount,
      input.nextAttemptAt ?? null,
      input.deliveredAt ?? null,
      input.lastAttemptAt ?? null,
      input.lastResponseCode ?? null,
      input.lastResponseBody ?? null
    ]
  );

  return result.rows[0] ?? null;
}

export type DueWorkspaceZapierDeliveryRow = WorkspaceZapierDeliveryRow & {
  target_url: string;
};

export async function listDueWorkspaceZapierDeliveryRows(limit = 25) {
  const result = await query<DueWorkspaceZapierDeliveryRow>(
    `SELECT ${QUALIFIED_DELIVERY_COLUMNS}, workspace_zapier_webhooks.target_url FROM workspace_zapier_deliveries INNER JOIN workspace_zapier_webhooks ON workspace_zapier_webhooks.id = workspace_zapier_deliveries.webhook_id WHERE workspace_zapier_webhooks.active = TRUE AND workspace_zapier_deliveries.delivered_at IS NULL AND workspace_zapier_deliveries.next_attempt_at IS NOT NULL AND workspace_zapier_deliveries.next_attempt_at <= NOW() ORDER BY workspace_zapier_deliveries.next_attempt_at ASC, workspace_zapier_deliveries.created_at ASC LIMIT $1`,
    [limit]
  );

  return result.rows;
}
