import "server-only";

import { getRuntimeEnvironment, type RuntimeEnvironment } from "@/lib/env";
import {
  getMissingMiniMaxEnvVars,
  getMissingSesEnvVars
} from "@/lib/env-server/groups";
import {
  getOptionalServerEnv,
  getRequiredServerEnv,
  type ServerEnvSource
} from "@/lib/env-server/core";

type SesClientConfig = {
  region: string;
  credentials?:
    | {
        accessKeyId: string;
        secretAccessKey: string;
      }
    | undefined;
};

type MiniMaxConfig = {
  apiKey: string;
  model: string;
  baseUrl: string;
};

const DEFAULT_ADMIN_ALERT_EMAIL = "tina@usechatting.com";

export function getAuthSecret(params?: {
  environment?: RuntimeEnvironment;
  source?: ServerEnvSource;
}) {
  const source = params?.source || process.env;
  const secret = getOptionalServerEnv("AUTH_SECRET", source);

  if (secret) {
    return secret;
  }

  if ((params?.environment || getRuntimeEnvironment(source.NODE_ENV)) !== "production") {
    return "chatly-dev-secret";
  }

  throw new Error("AUTH_SECRET is not configured.");
}

export function getDatabaseConfig(params?: {
  source?: ServerEnvSource;
}) {
  const source = params?.source || process.env;

  return {
    connectionString: getRequiredServerEnv("DATABASE_URL", { source })
  };
}

export function getAppDisplayName(source: ServerEnvSource = process.env) {
  return getOptionalServerEnv("APP_NAME", source)!;
}

export function getAdminAlertEmail(source: ServerEnvSource = process.env) {
  return getOptionalServerEnv("ADMIN_ALERT_EMAIL", source) || DEFAULT_ADMIN_ALERT_EMAIL;
}

export function getReplyDomain(source: ServerEnvSource = process.env) {
  return getOptionalServerEnv("REPLY_DOMAIN", source);
}

export function getSesClientConfig(source: ServerEnvSource = process.env): SesClientConfig {
  const missing = getMissingSesEnvVars({ source });
  if (missing.includes("AWS_REGION")) {
    throw new Error("AWS_REGION is not configured.");
  }
  if (
    missing.includes("AWS_ACCESS_KEY_ID") ||
    missing.includes("AWS_SECRET_ACCESS_KEY")
  ) {
    throw new Error("AWS SES credentials are incomplete.");
  }

  const region = getOptionalServerEnv("AWS_REGION", source)!;
  const accessKeyId = getOptionalServerEnv("AWS_ACCESS_KEY_ID", source);
  const secretAccessKey = getOptionalServerEnv("AWS_SECRET_ACCESS_KEY", source);

  return {
    region,
    credentials: accessKeyId
      ? {
          accessKeyId,
          secretAccessKey: secretAccessKey!
        }
      : undefined
  };
}

export function getSesInboundTopicArnSet(source: ServerEnvSource = process.env) {
  const raw = getOptionalServerEnv("SES_INBOUND_SNS_TOPIC_ARN", source);
  if (!raw) {
    return new Set<string>();
  }

  return new Set(raw.split(",").map((item) => item.trim()).filter(Boolean));
}

export function getMiniMaxConfig(source: ServerEnvSource = process.env): MiniMaxConfig {
  if (getMissingMiniMaxEnvVars({ source }).length > 0) {
    throw new Error("MINIMAX_NOT_CONFIGURED");
  }

  return {
    apiKey: getOptionalServerEnv("MINIMAX_API_KEY", source)!,
    model: getOptionalServerEnv("MINIMAX_MODEL", source)!,
    baseUrl: getOptionalServerEnv("MINIMAX_BASE_URL", source)!.replace(/\/+$/, "")
  };
}
