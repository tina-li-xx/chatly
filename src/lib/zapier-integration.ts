import "server-only";

import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const ZAPIER_API_KEY_PREFIX_LENGTH = 20;
const ZAPIER_API_KEY_HASH_BYTES = 32;

export function generateZapierApiKey() {
  return `ck_live_${randomBytes(16).toString("hex")}`;
}

export function buildZapierApiKeyPrefix(apiKey: string) {
  return apiKey.slice(0, ZAPIER_API_KEY_PREFIX_LENGTH);
}

export function hashZapierApiKey(apiKey: string) {
  const keySalt = randomBytes(16).toString("base64url");
  const keyHash = scryptSync(apiKey, keySalt, ZAPIER_API_KEY_HASH_BYTES)
    .toString("base64url");

  return {
    keyPrefix: buildZapierApiKeyPrefix(apiKey),
    keyHash,
    keySalt
  };
}

export function verifyZapierApiKey(input: {
  apiKey: string;
  keyHash: string;
  keySalt: string;
}) {
  const expected = Buffer.from(input.keyHash, "base64url");
  const actual = scryptSync(
    input.apiKey,
    input.keySalt,
    expected.length || ZAPIER_API_KEY_HASH_BYTES
  );

  return (
    actual.length === expected.length &&
    timingSafeEqual(actual, expected)
  );
}
