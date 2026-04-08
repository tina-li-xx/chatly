import { randomUUID } from "node:crypto";
import { jsonError, jsonOk, requireJsonRouteUser } from "@/lib/route-helpers";
import {
  deleteWorkspaceIntegrationRow,
  findWorkspaceIntegrationRow,
  upsertWorkspaceIntegrationRow
} from "@/lib/repositories/integrations-repository";
import {
  findActiveWorkspaceZapierApiKeyRow,
  insertWorkspaceZapierApiKeyRow,
  revokeWorkspaceZapierApiKeys
} from "@/lib/repositories/zapier-api-keys-repository";
import {
  countActiveWorkspaceZapierWebhookRows,
  deactivateWorkspaceZapierWebhookRows
} from "@/lib/repositories/zapier-webhooks-repository";
import { withRouteErrorAlerting } from "@/lib/route-error-alerting";
import {
  buildZapierApiKeyPrefix,
  generateZapierApiKey,
  hashZapierApiKey
} from "@/lib/zapier-integration";
import {
  buildZapierIntegrationState,
  hasEncryptedZapierCredentials,
  readZapierCredentials,
  serializeZapierIntegrationCredentials,
  serializeZapierIntegrationSettings
} from "@/lib/zapier-integration-state";

async function requireZapierManager() {
  const auth = await requireJsonRouteUser();
  if ("response" in auth) {
    return auth;
  }
  if (auth.user.workspaceRole === "member") {
    return { response: jsonError("forbidden", 403) };
  }
  return auth;
}

async function ensureZapierApiKeyRecord(ownerUserId: string, apiKey: string) {
  const activeKey = await findActiveWorkspaceZapierApiKeyRow(ownerUserId);
  if (activeKey?.key_prefix === buildZapierApiKeyPrefix(apiKey)) {
    return;
  }

  if (activeKey) {
    await revokeWorkspaceZapierApiKeys(ownerUserId);
  }

  const hash = hashZapierApiKey(apiKey);
  await insertWorkspaceZapierApiKeyRow({
    id: randomUUID(),
    ownerUserId,
    keyPrefix: hash.keyPrefix,
    keyHash: hash.keyHash,
    keySalt: hash.keySalt
  });
}

async function handleGET() {
  const auth = await requireJsonRouteUser();
  if ("response" in auth) {
    return auth.response;
  }

  const existing = await findWorkspaceIntegrationRow(auth.user.workspaceOwnerId, "zapier");
  if (!existing) {
    return jsonOk({ zapier: buildZapierIntegrationState(null) });
  }

  const apiKey = readZapierCredentials(existing)?.apiKey ?? "";
  if (apiKey) {
    await ensureZapierApiKeyRecord(auth.user.workspaceOwnerId, apiKey);
  }

  const activeZapCount = await countActiveWorkspaceZapierWebhookRows(
    auth.user.workspaceOwnerId
  );

  if (hasEncryptedZapierCredentials(existing)) {
    return jsonOk({
      zapier: buildZapierIntegrationState(existing, { activeZapCount })
    });
  }

  const credentials = readZapierCredentials(existing);
  if (!credentials) {
    return jsonOk({
      zapier: buildZapierIntegrationState(existing, { activeZapCount })
    });
  }

  const upgraded = await upsertWorkspaceIntegrationRow({
    ownerUserId: auth.user.workspaceOwnerId,
    provider: "zapier",
    status: existing.status,
    accountLabel: existing.account_label,
    externalAccountId: existing.external_account_id,
    settingsJson: existing.settings_json,
    credentialsJson: serializeZapierIntegrationCredentials(credentials),
    errorMessage: existing.error_message,
    connectedAt: existing.connected_at,
    lastValidatedAt: existing.last_validated_at
  });

  return jsonOk({
    zapier: buildZapierIntegrationState(upgraded, { activeZapCount })
  });
}

async function handlePOST() {
  const auth = await requireZapierManager();
  if ("response" in auth) {
    return auth.response;
  }

  try {
    const existing = await findWorkspaceIntegrationRow(auth.user.workspaceOwnerId, "zapier");
    const currentCount = await countActiveWorkspaceZapierWebhookRows(
      auth.user.workspaceOwnerId
    );
    const apiKey =
      readZapierCredentials(existing)?.apiKey ?? generateZapierApiKey();
    await ensureZapierApiKeyRecord(auth.user.workspaceOwnerId, apiKey);
    const timestamp = new Date().toISOString();
    const updated = await upsertWorkspaceIntegrationRow({
      ownerUserId: auth.user.workspaceOwnerId,
      provider: "zapier",
      status: "connected",
      accountLabel: "Zapier",
      externalAccountId: "zapier",
      settingsJson: serializeZapierIntegrationSettings({
        ...buildZapierIntegrationState(existing, {
          activeZapCount: currentCount
        }),
        connected: true,
        apiKey
      }),
      credentialsJson: serializeZapierIntegrationCredentials({ apiKey }),
      errorMessage: null,
      connectedAt: existing?.connected_at ?? timestamp,
      lastValidatedAt: timestamp
    });

    return jsonOk({
      zapier: buildZapierIntegrationState(updated, {
        activeZapCount: currentCount
      })
    });
  } catch {
    return jsonError("zapier-connect-failed", 500);
  }
}

async function handleDELETE() {
  const auth = await requireZapierManager();
  if ("response" in auth) {
    return auth.response;
  }

  try {
    await Promise.all([
      deleteWorkspaceIntegrationRow(auth.user.workspaceOwnerId, "zapier"),
      revokeWorkspaceZapierApiKeys(auth.user.workspaceOwnerId),
      deactivateWorkspaceZapierWebhookRows(auth.user.workspaceOwnerId)
    ]);
    return jsonOk({ zapier: buildZapierIntegrationState(null) });
  } catch {
    return jsonError("zapier-disconnect-failed", 500);
  }
}

export const GET = withRouteErrorAlerting(handleGET, "app/dashboard/settings/integrations/zapier/route.ts:GET");
export const POST = withRouteErrorAlerting(handlePOST, "app/dashboard/settings/integrations/zapier/route.ts:POST");
export const DELETE = withRouteErrorAlerting(handleDELETE, "app/dashboard/settings/integrations/zapier/route.ts:DELETE");
