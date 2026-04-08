import {
  encryptIntegrationCredentials,
  isEncryptedIntegrationCredentials,
  parseIntegrationCredentials
} from "@/lib/integration-credentials";
import type { WorkspaceIntegrationRow } from "@/lib/repositories/integrations-repository";

export function serializeStoredIntegrationCredentials<T extends object>(
  value: T
) {
  return encryptIntegrationCredentials(value);
}

export function readStoredIntegrationCredentials<T>(
  row: WorkspaceIntegrationRow | null
) {
  return parseIntegrationCredentials<T>(row?.credentials_json ?? "");
}

export function hasStoredEncryptedIntegrationCredentials(
  row: WorkspaceIntegrationRow | null
) {
  return row ? isEncryptedIntegrationCredentials(row.credentials_json) : false;
}
