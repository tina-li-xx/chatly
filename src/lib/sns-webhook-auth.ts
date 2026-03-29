import { createVerify } from "node:crypto";
import { getSesInboundTopicArnSet } from "@/lib/env.server";

type SnsType = "Notification" | "SubscriptionConfirmation" | "UnsubscribeConfirmation";

export type SnsEnvelope = {
  Type: SnsType;
  MessageId: string;
  TopicArn: string;
  Subject?: string;
  Message: string;
  Timestamp: string;
  Token?: string;
  SubscribeURL?: string;
  SignatureVersion: string;
  Signature: string;
  SigningCertURL: string;
};

const CERT_CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const certCache = new Map<string, { pem: string; expiresAt: number }>();

function asRawText(value: unknown) {
  return typeof value === "string" ? value : String(value || "");
}

function isAllowedTopicArn(topicArn: string) {
  const allowed = getSesInboundTopicArnSet();

  if (allowed.size === 0) {
    return true;
  }

  return allowed.has(topicArn);
}

function isTrustedAwsPemUrl(rawUrl: string) {
  try {
    const url = new URL(rawUrl);

    return (
      url.protocol === "https:" &&
      url.hostname.endsWith(".amazonaws.com") &&
      url.pathname.startsWith("/SimpleNotificationService-") &&
      url.pathname.endsWith(".pem")
    );
  } catch {
    return false;
  }
}

function parseEnvelope(payload: unknown): SnsEnvelope | null {
  const body = (payload || {}) as Record<string, unknown>;
  const type = asRawText(body.Type).trim() as SnsType;

  if (
    type !== "Notification" &&
    type !== "SubscriptionConfirmation" &&
    type !== "UnsubscribeConfirmation"
  ) {
    return null;
  }

  const envelope: SnsEnvelope = {
    Type: type,
    MessageId: asRawText(body.MessageId),
    TopicArn: asRawText(body.TopicArn),
    Subject: asRawText(body.Subject) || undefined,
    Message: asRawText(body.Message),
    Timestamp: asRawText(body.Timestamp),
    Token: asRawText(body.Token) || undefined,
    SubscribeURL: asRawText(body.SubscribeURL) || undefined,
    SignatureVersion: asRawText(body.SignatureVersion),
    Signature: asRawText(body.Signature),
    SigningCertURL: asRawText(body.SigningCertURL)
  };

  if (!envelope.MessageId || !envelope.TopicArn || !envelope.Message || !envelope.Timestamp) {
    return null;
  }

  if (!envelope.SignatureVersion || !envelope.Signature || !envelope.SigningCertURL) {
    return null;
  }

  return envelope;
}

function appendField(lines: string[], key: string, value: string | undefined) {
  if (value) {
    lines.push(key, value);
  }
}

function buildCanonicalMessage(envelope: SnsEnvelope) {
  const lines: string[] = [];

  appendField(lines, "Message", envelope.Message);
  appendField(lines, "MessageId", envelope.MessageId);

  if (envelope.Type === "Notification") {
    appendField(lines, "Subject", envelope.Subject);
  } else {
    appendField(lines, "SubscribeURL", envelope.SubscribeURL);
  }

  appendField(lines, "Timestamp", envelope.Timestamp);

  if (envelope.Type !== "Notification") {
    appendField(lines, "Token", envelope.Token);
  }

  appendField(lines, "TopicArn", envelope.TopicArn);
  appendField(lines, "Type", envelope.Type);

  if (lines.length < 8) {
    return null;
  }

  return `${lines.join("\n")}\n`;
}

async function fetchSigningCertPem(signingCertUrl: string) {
  const now = Date.now();
  const cached = certCache.get(signingCertUrl);

  if (cached && cached.expiresAt > now) {
    return cached.pem;
  }

  const response = await fetch(signingCertUrl, { method: "GET" });

  if (!response.ok) {
    return null;
  }

  const pem = await response.text();

  if (!pem.includes("BEGIN CERTIFICATE")) {
    return null;
  }

  certCache.set(signingCertUrl, {
    pem,
    expiresAt: now + CERT_CACHE_TTL_MS
  });

  return pem;
}

function verifySnsSignature(envelope: SnsEnvelope, pem: string, canonicalMessage: string) {
  const algorithm =
    envelope.SignatureVersion === "2"
      ? "RSA-SHA256"
      : envelope.SignatureVersion === "1"
        ? "RSA-SHA1"
        : "";

  if (!algorithm) {
    return false;
  }

  try {
    const verify = createVerify(algorithm);
    verify.update(canonicalMessage, "utf8");
    verify.end();
    return verify.verify(pem, Buffer.from(envelope.Signature, "base64"));
  } catch {
    return false;
  }
}

export async function verifySnsWebhookPayload(payload: unknown) {
  const envelope = parseEnvelope(payload);

  if (!envelope) {
    return { ok: false as const, status: 400, error: "Invalid SNS payload." };
  }

  if (!isAllowedTopicArn(envelope.TopicArn)) {
    return { ok: false as const, status: 401, error: "Unauthorized webhook." };
  }

  if (!isTrustedAwsPemUrl(envelope.SigningCertURL)) {
    return { ok: false as const, status: 401, error: "Unauthorized webhook." };
  }

  const pem = await fetchSigningCertPem(envelope.SigningCertURL);

  if (!pem) {
    return { ok: false as const, status: 401, error: "Unauthorized webhook." };
  }

  const canonicalMessage = buildCanonicalMessage(envelope);

  if (!canonicalMessage) {
    return { ok: false as const, status: 400, error: "Invalid SNS payload." };
  }

  if (!verifySnsSignature(envelope, pem, canonicalMessage)) {
    return { ok: false as const, status: 401, error: "Unauthorized webhook." };
  }

  return { ok: true as const, envelope };
}
