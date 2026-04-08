import "server-only";

import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes
} from "node:crypto";
import { getAuthSecret, getOptionalServerEnv } from "@/lib/env.server";

const ENCRYPTED_CREDENTIALS_PREFIX = "enc:v1";
const ENCRYPTION_IV_BYTES = 12;

function getIntegrationsEncryptionKey() {
  const secret =
    getOptionalServerEnv("INTEGRATIONS_ENCRYPTION_KEY") || getAuthSecret();
  return createHash("sha256").update(secret).digest();
}

export function isEncryptedIntegrationCredentials(value: string) {
  return value.startsWith(`${ENCRYPTED_CREDENTIALS_PREFIX}:`);
}

export function encryptIntegrationCredentials(
  value: Record<string, unknown>
) {
  const iv = randomBytes(ENCRYPTION_IV_BYTES);
  const cipher = createCipheriv(
    "aes-256-gcm",
    getIntegrationsEncryptionKey(),
    iv
  );
  const ciphertext = Buffer.concat([
    cipher.update(JSON.stringify(value), "utf8"),
    cipher.final()
  ]);
  const tag = cipher.getAuthTag();

  return [
    ENCRYPTED_CREDENTIALS_PREFIX,
    iv.toString("base64url"),
    tag.toString("base64url"),
    ciphertext.toString("base64url")
  ].join(":");
}

function decryptIntegrationCredentials(value: string) {
  const parts = value.split(":");
  if (parts.length !== 5 || `${parts[0]}:${parts[1]}` !== ENCRYPTED_CREDENTIALS_PREFIX) {
    throw new Error("INVALID_INTEGRATION_CREDENTIALS");
  }
  const [, , iv, tag, ciphertext] = parts;
  const decipher = createDecipheriv(
    "aes-256-gcm",
    getIntegrationsEncryptionKey(),
    Buffer.from(iv, "base64url")
  );

  decipher.setAuthTag(Buffer.from(tag, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(ciphertext, "base64url")),
    decipher.final()
  ]).toString("utf8");
}

export function parseIntegrationCredentials<T>(value: string) {
  if (!value) {
    return null;
  }

  const raw = isEncryptedIntegrationCredentials(value)
    ? decryptIntegrationCredentials(value)
    : value;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}
