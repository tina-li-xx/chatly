import { query } from "@/lib/db";

export type WorkspaceIntegrationProvider = "slack" | "zapier" | "shopify";
export type WorkspaceIntegrationStatus = "connected" | "reconnect" | "error";
export type WorkspaceWebhookStatus = "active" | "disabled";

export type WorkspaceIntegrationRow = {
  owner_user_id: string;
  provider: WorkspaceIntegrationProvider;
  status: WorkspaceIntegrationStatus;
  account_label: string | null;
  external_account_id: string | null;
  settings_json: string;
  credentials_json: string;
  error_message: string | null;
  connected_at: string | null;
  last_validated_at: string | null;
  created_at: string;
  updated_at: string;
};

export type WorkspaceWebhookRow = {
  id: string;
  owner_user_id: string;
  url: string;
  events_json: string;
  secret: string;
  status: WorkspaceWebhookStatus;
  last_triggered_at: string | null;
  last_response_code: number | null;
  last_response_body: string | null;
  created_at: string;
  updated_at: string;
};

const INTEGRATION_COLUMNS = `
  owner_user_id,
  provider,
  status,
  account_label,
  external_account_id,
  settings_json,
  credentials_json,
  error_message,
  connected_at,
  last_validated_at,
  created_at,
  updated_at
`;

const WEBHOOK_COLUMNS = `
  id,
  owner_user_id,
  url,
  events_json,
  secret,
  status,
  last_triggered_at,
  last_response_code,
  last_response_body,
  created_at,
  updated_at
`;

export async function listWorkspaceIntegrationRows(ownerUserId: string) {
  const result = await query<WorkspaceIntegrationRow>(`SELECT ${INTEGRATION_COLUMNS} FROM workspace_integrations WHERE owner_user_id = $1 ORDER BY provider ASC`, [ownerUserId]);
  return result.rows;
}

export async function findWorkspaceIntegrationRow(ownerUserId: string, provider: WorkspaceIntegrationProvider) {
  const result = await query<WorkspaceIntegrationRow>(`SELECT ${INTEGRATION_COLUMNS} FROM workspace_integrations WHERE owner_user_id = $1 AND provider = $2 LIMIT 1`, [ownerUserId, provider]);
  return result.rows[0] ?? null;
}

export async function findWorkspaceIntegrationRowByExternalAccountId(
  provider: WorkspaceIntegrationProvider,
  externalAccountId: string
) {
  const result = await query<WorkspaceIntegrationRow>(
    `SELECT ${INTEGRATION_COLUMNS} FROM workspace_integrations WHERE provider = $1 AND external_account_id = $2 LIMIT 1`,
    [provider, externalAccountId]
  );
  return result.rows[0] ?? null;
}

export async function upsertWorkspaceIntegrationRow(input: {
  ownerUserId: string;
  provider: WorkspaceIntegrationProvider;
  status: WorkspaceIntegrationStatus;
  accountLabel?: string | null;
  externalAccountId?: string | null;
  settingsJson: string;
  credentialsJson: string;
  errorMessage?: string | null;
  connectedAt?: string | null;
  lastValidatedAt?: string | null;
}) {
  const result = await query<WorkspaceIntegrationRow>(
    `INSERT INTO workspace_integrations (owner_user_id, provider, status, account_label, external_account_id, settings_json, credentials_json, error_message, connected_at, last_validated_at, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW()) ON CONFLICT (owner_user_id, provider) DO UPDATE SET status = EXCLUDED.status, account_label = EXCLUDED.account_label, external_account_id = EXCLUDED.external_account_id, settings_json = EXCLUDED.settings_json, credentials_json = EXCLUDED.credentials_json, error_message = EXCLUDED.error_message, connected_at = EXCLUDED.connected_at, last_validated_at = EXCLUDED.last_validated_at, updated_at = NOW() RETURNING ${INTEGRATION_COLUMNS}`,
    [input.ownerUserId, input.provider, input.status, input.accountLabel ?? null, input.externalAccountId ?? null, input.settingsJson, input.credentialsJson, input.errorMessage ?? null, input.connectedAt ?? null, input.lastValidatedAt ?? null]
  );

  return result.rows[0] ?? null;
}

export async function deleteWorkspaceIntegrationRow(ownerUserId: string, provider: WorkspaceIntegrationProvider) {
  const result = await query<{ owner_user_id: string }>(`DELETE FROM workspace_integrations WHERE owner_user_id = $1 AND provider = $2 RETURNING owner_user_id`, [ownerUserId, provider]);
  return Boolean(result.rowCount);
}

export async function listWorkspaceWebhookRows(ownerUserId: string) {
  const result = await query<WorkspaceWebhookRow>(`SELECT ${WEBHOOK_COLUMNS} FROM workspace_webhooks WHERE owner_user_id = $1 ORDER BY updated_at DESC, created_at DESC`, [ownerUserId]);
  return result.rows;
}

export async function findWorkspaceWebhookRow(id: string, ownerUserId: string) {
  const result = await query<WorkspaceWebhookRow>(`SELECT ${WEBHOOK_COLUMNS} FROM workspace_webhooks WHERE id = $1 AND owner_user_id = $2 LIMIT 1`, [id, ownerUserId]);
  return result.rows[0] ?? null;
}

export async function upsertWorkspaceWebhookRow(input: {
  id: string;
  ownerUserId: string;
  url: string;
  eventsJson: string;
  secret: string;
  status?: WorkspaceWebhookStatus;
  lastTriggeredAt?: string | null;
  lastResponseCode?: number | null;
  lastResponseBody?: string | null;
}) {
  const result = await query<WorkspaceWebhookRow>(
    `INSERT INTO workspace_webhooks (id, owner_user_id, url, events_json, secret, status, last_triggered_at, last_response_code, last_response_body, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW()) ON CONFLICT (id) DO UPDATE SET owner_user_id = EXCLUDED.owner_user_id, url = EXCLUDED.url, events_json = EXCLUDED.events_json, secret = EXCLUDED.secret, status = EXCLUDED.status, last_triggered_at = EXCLUDED.last_triggered_at, last_response_code = EXCLUDED.last_response_code, last_response_body = EXCLUDED.last_response_body, updated_at = NOW() RETURNING ${WEBHOOK_COLUMNS}`,
    [input.id, input.ownerUserId, input.url, input.eventsJson, input.secret, input.status ?? "active", input.lastTriggeredAt ?? null, input.lastResponseCode ?? null, input.lastResponseBody ?? null]
  );

  return result.rows[0] ?? null;
}

export async function updateWorkspaceWebhookDeliveryResult(input: {
  id: string;
  ownerUserId: string;
  lastTriggeredAt?: string | null;
  lastResponseCode?: number | null;
  lastResponseBody?: string | null;
}) {
  const result = await query<WorkspaceWebhookRow>(
    `UPDATE workspace_webhooks SET last_triggered_at = COALESCE($3::timestamptz, NOW()), last_response_code = $4, last_response_body = $5, updated_at = NOW() WHERE id = $1 AND owner_user_id = $2 RETURNING ${WEBHOOK_COLUMNS}`,
    [input.id, input.ownerUserId, input.lastTriggeredAt ?? null, input.lastResponseCode ?? null, input.lastResponseBody ?? null]
  );

  return result.rows[0] ?? null;
}

export async function deleteWorkspaceWebhookRow(id: string, ownerUserId: string) {
  const result = await query<{ id: string }>(`DELETE FROM workspace_webhooks WHERE id = $1 AND owner_user_id = $2 RETURNING id`, [id, ownerUserId]);
  return Boolean(result.rowCount);
}
