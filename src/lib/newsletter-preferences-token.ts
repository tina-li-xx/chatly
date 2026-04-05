import { createHmac, timingSafeEqual } from "node:crypto";
import { getAuthSecret } from "@/lib/env.server";

type NewsletterPreferencesPayload = {
  subscriberId: string;
  v: 1;
};

function encode(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function decode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(value: string) {
  return createHmac("sha256", getAuthSecret())
    .update(`newsletter:${value}`)
    .digest("base64url");
}

function safeEqual(left: string, right: string) {
  const a = Buffer.from(left, "utf8");
  const b = Buffer.from(right, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}

export function buildNewsletterPreferencesToken(subscriberId: string) {
  const payload = encode(JSON.stringify({ subscriberId, v: 1 } satisfies NewsletterPreferencesPayload));
  return `${payload}.${sign(payload)}`;
}

export function parseNewsletterPreferencesToken(token: string) {
  const [payload, signature] = token.trim().split(".");

  if (!payload || !signature || !safeEqual(sign(payload), signature)) {
    return null;
  }

  try {
    const parsed = JSON.parse(decode(payload)) as Partial<NewsletterPreferencesPayload>;
    const subscriberId = parsed.subscriberId?.trim();

    return parsed.v === 1 && subscriberId ? { subscriberId } : null;
  } catch {
    return null;
  }
}
