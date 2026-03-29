import "server-only";

import { getRuntimeEnvironment, type RuntimeEnvironment } from "@/lib/env";
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
    connectionString: getRequiredServerEnv("DATABASE_URL", { source }),
    ssl: getOptionalServerEnv("DATABASE_SSL", source) === "require"
      ? { rejectUnauthorized: false as const }
      : undefined
  };
}

export function getMailFromAddress(source: ServerEnvSource = process.env) {
  return getOptionalServerEnv("MAIL_FROM", source) || "Chatting <hello@example.com>";
}

export function getAppDisplayName(source: ServerEnvSource = process.env) {
  return getOptionalServerEnv("APP_NAME", source) || "Chatly";
}

export function getReplyDomain(source: ServerEnvSource = process.env) {
  return getOptionalServerEnv("REPLY_DOMAIN", source);
}

export function getSesClientConfig(source: ServerEnvSource = process.env): SesClientConfig {
  const region = getOptionalServerEnv("AWS_REGION", source);

  if (!region) {
    throw new Error("AWS_REGION is not configured.");
  }

  const accessKeyId = getOptionalServerEnv("AWS_ACCESS_KEY_ID", source);
  const secretAccessKey = getOptionalServerEnv("AWS_SECRET_ACCESS_KEY", source);

  if ((accessKeyId && !secretAccessKey) || (!accessKeyId && secretAccessKey)) {
    throw new Error("AWS SES credentials are incomplete.");
  }

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
  const raw =
    getOptionalServerEnv("SES_INBOUND_SNS_TOPIC_ARN", source) ||
    getOptionalServerEnv("AWS_SES_INBOUND_SNS_TOPIC_ARN", source);

  if (!raw) {
    return new Set<string>();
  }

  return new Set(raw.split(",").map((item) => item.trim()).filter(Boolean));
}
