import type { ZapierIntegrationState } from "@/lib/dashboard-integrations";
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

type StoredZapierSettings = {
  activeZapCount?: number | null;
};

type StoredZapierCredentials = {
  apiKey?: string | null;
};

function readZapierStoredSettings(row: WorkspaceIntegrationRow | null) {
  return readIntegrationSettings<StoredZapierSettings>(row) ?? {};
}

export function buildZapierIntegrationState(
  row: WorkspaceIntegrationRow | null,
  overrides?: {
    activeZapCount?: number | null;
  }
): ZapierIntegrationState {
  if (!row) {
    return DEFAULT_INTEGRATIONS_STATE.zapier;
  }

  const settings = readZapierStoredSettings(row);
  const activeZapCount =
    typeof overrides?.activeZapCount === "number"
      ? overrides.activeZapCount
      : typeof settings.activeZapCount === "number"
        ? settings.activeZapCount
        : null;
  const apiKey = readZapierCredentials(row)?.apiKey ?? "";

  return {
    connected: activeZapCount > 0,
    apiKeyReady: Boolean(apiKey),
    apiKey,
    activeZapCount
  };
}

export function serializeZapierIntegrationSettings(
  state: ZapierIntegrationState
) {
  return serializeIntegrationSettings({
    activeZapCount: state.activeZapCount
  } satisfies StoredZapierSettings);
}

export function serializeZapierIntegrationCredentials(
  value: StoredZapierCredentials
) {
  return serializeStoredIntegrationCredentials(value);
}

export function readZapierCredentials(row: WorkspaceIntegrationRow | null) {
  return readStoredIntegrationCredentials<StoredZapierCredentials>(row);
}

export function hasEncryptedZapierCredentials(
  row: WorkspaceIntegrationRow | null
) {
  return hasStoredEncryptedIntegrationCredentials(row);
}
