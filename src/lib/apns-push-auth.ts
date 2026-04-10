import "server-only";

import { createPrivateKey, sign } from "node:crypto";
import { getApplePushConfig } from "@/lib/env.server";

const TOKEN_TTL_MS = 50 * 60 * 1000;

let cachedToken: { value: string; expiresAt: number; cacheKey: string } | null = null;

export function getApplePushBearerToken() {
  const config = getApplePushConfig();
  const cacheKey = `${config.teamId}:${config.keyId}:${config.privateKey}`;
  const now = Date.now();
  if (cachedToken && cachedToken.cacheKey === cacheKey && cachedToken.expiresAt > now) {
    return cachedToken.value;
  }

  const issuedAt = Math.floor(now / 1000);
  const unsignedToken = [
    encodeSegment({ alg: "ES256", kid: config.keyId }),
    encodeSegment({ iss: config.teamId, iat: issuedAt })
  ].join(".");
  const signature = sign("sha256", Buffer.from(unsignedToken), {
    key: createPrivateKey(normalizeApplePushPrivateKey(config.privateKey)),
    dsaEncoding: "ieee-p1363"
  });
  const value = `${unsignedToken}.${signature.toString("base64url")}`;

  cachedToken = {
    value,
    expiresAt: now + TOKEN_TTL_MS,
    cacheKey
  };

  return value;
}

function encodeSegment(value: object) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function normalizeApplePushPrivateKey(value: string) {
  return value.includes("-----BEGIN PRIVATE KEY-----")
    ? value.replace(/\\n/g, "\n")
    : `-----BEGIN PRIVATE KEY-----\n${value.replace(/\\n/g, "\n")}\n-----END PRIVATE KEY-----`;
}
