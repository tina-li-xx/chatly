import "server-only";

import { jsonError } from "@/lib/route-helpers";
import { displayNameFromEmail } from "@/lib/user-display";
import { findWorkspaceAccessRow } from "@/lib/repositories/workspace-access-repository";
import {
  findActiveWorkspaceZapierApiKeyRow,
  listActiveWorkspaceZapierApiKeyRowsByPrefix,
  markWorkspaceZapierApiKeyUsed
} from "@/lib/repositories/zapier-api-keys-repository";
import {
  buildZapierApiKeyPrefix,
  verifyZapierApiKey
} from "@/lib/zapier-integration";

export type ZapierApiAuthContext = {
  apiKeyId: string;
  ownerUserId: string;
  ownerEmail: string;
  teamName: string;
};

type ZapierApiAuthResult =
  | {
      auth: ZapierApiAuthContext;
    }
  | {
      response: Response;
    };

async function loadWorkspacePreview(ownerUserId: string) {
  const workspace = await findWorkspaceAccessRow(ownerUserId, ownerUserId);
  const ownerEmail = workspace?.owner_email ?? "";

  return {
    ownerEmail,
    teamName:
      workspace?.team_name ??
      (ownerEmail ? `${displayNameFromEmail(ownerEmail)} Team` : "Chatting")
  };
}

export async function requireZapierApiAuth(
  request: Request
): Promise<ZapierApiAuthResult> {
  const apiKey = request.headers.get("x-api-key")?.trim() ?? "";
  if (!apiKey) {
    return { response: jsonError("api-key-missing", 401) };
  }

  const candidates = await listActiveWorkspaceZapierApiKeyRowsByPrefix(
    buildZapierApiKeyPrefix(apiKey)
  );
  const row = candidates.find((candidate) =>
    verifyZapierApiKey({
      apiKey,
      keyHash: candidate.key_hash,
      keySalt: candidate.key_salt
    })
  );

  if (!row) {
    return { response: jsonError("api-key-invalid", 401) };
  }

  await markWorkspaceZapierApiKeyUsed({
    id: row.id,
    ownerUserId: row.owner_user_id
  });

  const workspace = await loadWorkspacePreview(row.owner_user_id);
  return {
    auth: {
      apiKeyId: row.id,
      ownerUserId: row.owner_user_id,
      ownerEmail: workspace.ownerEmail,
      teamName: workspace.teamName
    }
  };
}

export async function hasActiveZapierApiKey(ownerUserId: string) {
  return Boolean(await findActiveWorkspaceZapierApiKeyRow(ownerUserId));
}
