import type { WorkspaceIntegrationRow } from "@/lib/repositories/integrations-repository";

export function readIntegrationSettings<T>(
  row: WorkspaceIntegrationRow | null
) {
  if (!row?.settings_json) {
    return null;
  }

  try {
    return JSON.parse(row.settings_json) as T;
  } catch {
    return null;
  }
}

export function serializeIntegrationSettings<T extends object>(value: T) {
  return JSON.stringify(value);
}
