import { jsonError, jsonOk, requireJsonRouteUser } from "@/lib/route-helpers";
import {
  deleteWorkspaceIntegrationRow,
  findWorkspaceIntegrationRow,
  upsertWorkspaceIntegrationRow
} from "@/lib/services/integrations";
import { withRouteErrorAlerting } from "@/lib/route-error-alerting";
import {
  buildShopifyIntegrationState,
  hasEncryptedShopifyCredentials,
  readShopifyCredentials,
  serializeShopifyIntegrationCredentials
} from "@/lib/shopify-integration-state";

async function requireShopifyManager() {
  const auth = await requireJsonRouteUser();
  if ("response" in auth) {
    return auth;
  }
  if (auth.user.workspaceRole === "member") {
    return { response: jsonError("forbidden", 403) };
  }
  return auth;
}

async function handleGET() {
  const auth = await requireJsonRouteUser();
  if ("response" in auth) {
    return auth.response;
  }

  const row = await findWorkspaceIntegrationRow(
    auth.user.workspaceOwnerId,
    "shopify"
  );
  if (!row || hasEncryptedShopifyCredentials(row)) {
    return jsonOk({ shopify: buildShopifyIntegrationState(row) });
  }

  const credentials = readShopifyCredentials(row);
  if (!credentials) {
    return jsonOk({ shopify: buildShopifyIntegrationState(row) });
  }

  const upgraded = await upsertWorkspaceIntegrationRow({
    ownerUserId: auth.user.workspaceOwnerId,
    provider: "shopify",
    status: row.status,
    accountLabel: row.account_label,
    externalAccountId: row.external_account_id,
    settingsJson: row.settings_json,
    credentialsJson: serializeShopifyIntegrationCredentials(credentials),
    errorMessage: row.error_message,
    connectedAt: row.connected_at,
    lastValidatedAt: row.last_validated_at
  });

  return jsonOk({ shopify: buildShopifyIntegrationState(upgraded) });
}

async function handleDELETE() {
  const auth = await requireShopifyManager();
  if ("response" in auth) {
    return auth.response;
  }

  try {
    await deleteWorkspaceIntegrationRow(auth.user.workspaceOwnerId, "shopify");
    return jsonOk({ shopify: buildShopifyIntegrationState(null) });
  } catch {
    return jsonError("shopify-disconnect-failed", 500);
  }
}

export const GET = withRouteErrorAlerting(
  handleGET,
  "app/dashboard/settings/integrations/shopify/route.ts:GET"
);
export const DELETE = withRouteErrorAlerting(
  handleDELETE,
  "app/dashboard/settings/integrations/shopify/route.ts:DELETE"
);
