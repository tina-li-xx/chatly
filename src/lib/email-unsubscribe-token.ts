import { createHmac, timingSafeEqual } from "node:crypto";
import { getAuthSecret } from "@/lib/env.server";

type EmailUnsubscribePayload = {
  email: string;
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
    .update(`email_unsubscribe:${value}`)
    .digest("base64url");
}

function safeEqual(left: string, right: string) {
  const a = Buffer.from(left, "utf8");
  const b = Buffer.from(right, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}

export function buildEmailUnsubscribeToken(email: string) {
  const payload = encode(JSON.stringify({ email: email.trim().toLowerCase(), v: 1 } satisfies EmailUnsubscribePayload));
  return `${payload}.${sign(payload)}`;
}

export function parseEmailUnsubscribeToken(token: string) {
  const [payload, signature] = token.trim().split(".");

  if (!payload || !signature || !safeEqual(sign(payload), signature)) {
    return null;
  }

  try {
    const parsed = JSON.parse(decode(payload)) as Partial<EmailUnsubscribePayload>;
    const email = parsed.email?.trim().toLowerCase();
    return parsed.v === 1 && email ? { email } : null;
  } catch {
    return null;
  }
}
