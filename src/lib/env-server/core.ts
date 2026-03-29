import "server-only";

export type ServerEnvSource = Record<string, string | undefined>;

function normalize(value: unknown) {
  return String(value || "").trim();
}

export function getMissingRequiredEnvVars(
  requiredEnvVarNames: readonly string[],
  source: ServerEnvSource
) {
  return requiredEnvVarNames.filter((envVarName) => !normalize(source[envVarName]));
}

export function getOptionalServerEnv(
  name: string,
  source: ServerEnvSource = process.env
) {
  const value = normalize(source[name]);
  return value || null;
}

export function getRequiredServerEnv(
  name: string,
  options?: {
    errorCode?: string;
    source?: ServerEnvSource;
  }
) {
  const source = options?.source || process.env;
  const value = normalize(source[name]);

  if (!value) {
    throw new Error(options?.errorCode || `${name}_NOT_CONFIGURED`);
  }

  return value;
}
