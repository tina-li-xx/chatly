import type {
  ShopifyIntegrationState
} from "@/lib/dashboard-integrations";
import { DEFAULT_INTEGRATIONS_STATE } from "@/lib/dashboard-integrations";
import {
  readIntegrationSettings,
  serializeIntegrationSettings
} from "@/lib/integration-settings";
import {
  hasStoredEncryptedIntegrationCredentials,
  readStoredIntegrationCredentials,
  serializeStoredIntegrationCredentials
} from "@/lib/integration-state-credentials";
import type { WorkspaceIntegrationRow } from "@/lib/repositories/integrations-repository";

type StoredShopifySettings = {
  domain?: string;
};

type StoredShopifyCredentials = {
  accessToken?: string | null;
  scopes?: string[];
};

function readShopifyStoredSettings(row: WorkspaceIntegrationRow | null) {
  return readIntegrationSettings<StoredShopifySettings>(row) ?? {};
}

export function buildShopifyIntegrationState(
  row: WorkspaceIntegrationRow | null
): ShopifyIntegrationState {
  if (!row) {
    return DEFAULT_INTEGRATIONS_STATE.shopify;
  }

  const settings = readShopifyStoredSettings(row);
  return {
    status: row.status === "connected" ? "connected" : "error",
    domain:
      settings.domain ||
      row.external_account_id ||
      DEFAULT_INTEGRATIONS_STATE.shopify.domain,
    errorMessage: row.error_message ?? null
  };
}

export function serializeShopifyIntegrationSettings(domain: string) {
  return serializeIntegrationSettings({ domain } satisfies StoredShopifySettings);
}

export function serializeShopifyIntegrationCredentials(
  value: StoredShopifyCredentials
) {
  return serializeStoredIntegrationCredentials(value);
}

export function readShopifyCredentials(row: WorkspaceIntegrationRow | null) {
  return readStoredIntegrationCredentials<StoredShopifyCredentials>(row);
}

export function readShopifyAccessToken(row: WorkspaceIntegrationRow | null) {
  return readShopifyCredentials(row)?.accessToken ?? null;
}

export function hasEncryptedShopifyCredentials(
  row: WorkspaceIntegrationRow | null
) {
  return hasStoredEncryptedIntegrationCredentials(row);
}
