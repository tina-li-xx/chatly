import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { getRequiredServerEnv } from "@/lib/env.server";

const SLACK_SIGNATURE_VERSION = "v0";
const SLACK_REQUEST_TTL_MS = 5 * 60 * 1000;

function equalSignatures(left: string, right: string) {
  const leftBuffer = Buffer.from(left, "utf8");
  const rightBuffer = Buffer.from(right, "utf8");
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export function verifySlackRequestSignature(
  headers: Headers,
  body: string,
  now = Date.now()
) {
  const timestamp = headers.get("x-slack-request-timestamp")?.trim();
  const signature = headers.get("x-slack-signature")?.trim();

  if (!timestamp || !signature) {
    return { ok: false as const, error: "missing-slack-signature", status: 401 };
  }

  const timestampMs = Number(timestamp) * 1000;
  if (!Number.isFinite(timestampMs) || Math.abs(now - timestampMs) > SLACK_REQUEST_TTL_MS) {
    return { ok: false as const, error: "stale-slack-request", status: 401 };
  }

  const basestring = `${SLACK_SIGNATURE_VERSION}:${timestamp}:${body}`;
  const expected = `${SLACK_SIGNATURE_VERSION}=${createHmac("sha256", getRequiredServerEnv("SLACK_SIGNING_SECRET"))
    .update(basestring)
    .digest("hex")}`;

  if (!equalSignatures(expected, signature)) {
    return { ok: false as const, error: "invalid-slack-signature", status: 401 };
  }

  return { ok: true as const };
}
