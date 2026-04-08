import { query } from "@/lib/db";

export type WorkspaceZapierApiKeyRow = {
  id: string;
  owner_user_id: string;
  key_prefix: string;
  key_hash: string;
  key_salt: string;
  last_used_at: string | null;
  revoked_at: string | null;
  created_at: string;
  updated_at: string;
};

const API_KEY_COLUMNS = `
  id,
  owner_user_id,
  key_prefix,
  key_hash,
  key_salt,
  last_used_at,
  revoked_at,
  created_at,
  updated_at
`;

export async function findActiveWorkspaceZapierApiKeyRow(ownerUserId: string) {
  const result = await query<WorkspaceZapierApiKeyRow>(
    `SELECT ${API_KEY_COLUMNS} FROM workspace_zapier_api_keys WHERE owner_user_id = $1 AND revoked_at IS NULL ORDER BY created_at DESC LIMIT 1`,
    [ownerUserId]
  );

  return result.rows[0] ?? null;
}

export async function listActiveWorkspaceZapierApiKeyRowsByPrefix(
  keyPrefix: string
) {
  const result = await query<WorkspaceZapierApiKeyRow>(
    `SELECT ${API_KEY_COLUMNS} FROM workspace_zapier_api_keys WHERE key_prefix = $1 AND revoked_at IS NULL ORDER BY created_at DESC`,
    [keyPrefix]
  );

  return result.rows;
}

export async function insertWorkspaceZapierApiKeyRow(input: {
  id: string;
  ownerUserId: string;
  keyPrefix: string;
  keyHash: string;
  keySalt: string;
}) {
  const result = await query<WorkspaceZapierApiKeyRow>(
    `INSERT INTO workspace_zapier_api_keys (id, owner_user_id, key_prefix, key_hash, key_salt, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING ${API_KEY_COLUMNS}`,
    [
      input.id,
      input.ownerUserId,
      input.keyPrefix,
      input.keyHash,
      input.keySalt
    ]
  );

  return result.rows[0] ?? null;
}

export async function markWorkspaceZapierApiKeyUsed(input: {
  id: string;
  ownerUserId: string;
  usedAt?: string | null;
}) {
  const result = await query<WorkspaceZapierApiKeyRow>(
    `UPDATE workspace_zapier_api_keys SET last_used_at = COALESCE($3::timestamptz, NOW()), updated_at = NOW() WHERE id = $1 AND owner_user_id = $2 RETURNING ${API_KEY_COLUMNS}`,
    [input.id, input.ownerUserId, input.usedAt ?? null]
  );

  return result.rows[0] ?? null;
}

export async function revokeWorkspaceZapierApiKeys(ownerUserId: string) {
  const result = await query<WorkspaceZapierApiKeyRow>(
    `UPDATE workspace_zapier_api_keys SET revoked_at = COALESCE(revoked_at, NOW()), updated_at = NOW() WHERE owner_user_id = $1 AND revoked_at IS NULL RETURNING ${API_KEY_COLUMNS}`,
    [ownerUserId]
  );

  return result.rows;
}
