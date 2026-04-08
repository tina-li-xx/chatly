import { query } from "@/lib/db";

export type WorkspaceZapierIdempotencyRow = {
  api_key_id: string;
  owner_user_id: string;
  idempotency_key: string;
  request_hash: string;
  response_status: number;
  response_json: string;
  created_at: string;
  updated_at: string;
};

const IDEMPOTENCY_COLUMNS = `
  api_key_id,
  owner_user_id,
  idempotency_key,
  request_hash,
  response_status,
  response_json,
  created_at,
  updated_at
`;

export async function findWorkspaceZapierIdempotencyRow(input: {
  apiKeyId: string;
  idempotencyKey: string;
}) {
  const result = await query<WorkspaceZapierIdempotencyRow>(
    `SELECT ${IDEMPOTENCY_COLUMNS} FROM workspace_zapier_idempotency_keys WHERE api_key_id = $1 AND idempotency_key = $2 LIMIT 1`,
    [input.apiKeyId, input.idempotencyKey]
  );

  return result.rows[0] ?? null;
}

export async function upsertWorkspaceZapierIdempotencyRow(input: {
  apiKeyId: string;
  ownerUserId: string;
  idempotencyKey: string;
  requestHash: string;
  responseStatus: number;
  responseJson: string;
}) {
  const result = await query<WorkspaceZapierIdempotencyRow>(
    `INSERT INTO workspace_zapier_idempotency_keys (api_key_id, owner_user_id, idempotency_key, request_hash, response_status, response_json, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) ON CONFLICT (api_key_id, idempotency_key) DO UPDATE SET request_hash = EXCLUDED.request_hash, response_status = EXCLUDED.response_status, response_json = EXCLUDED.response_json, updated_at = NOW() RETURNING ${IDEMPOTENCY_COLUMNS}`,
    [
      input.apiKeyId,
      input.ownerUserId,
      input.idempotencyKey,
      input.requestHash,
      input.responseStatus,
      input.responseJson
    ]
  );

  return result.rows[0] ?? null;
}
