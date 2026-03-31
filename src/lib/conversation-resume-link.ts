import { createHmac, timingSafeEqual } from "node:crypto";
import { getAuthSecret } from "@/lib/env.server";
import type { ConversationResumeIdentity } from "@/lib/conversation-resume-types";

export type { ConversationResumeIdentity } from "@/lib/conversation-resume-types";

type ResumePayload = ConversationResumeIdentity & {
  v: 1;
};

function encode(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function decode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(value: string) {
  return createHmac("sha256", getAuthSecret()).update(value).digest("base64url");
}

function safeEqual(left: string, right: string) {
  const a = Buffer.from(left, "utf8");
  const b = Buffer.from(right, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}

export function buildConversationResumeToken(identity: ConversationResumeIdentity) {
  const payload = encode(JSON.stringify({ ...identity, v: 1 } satisfies ResumePayload));
  return `${payload}.${sign(payload)}`;
}

export function parseConversationResumeToken(token: string): ConversationResumeIdentity | null {
  const [payload, signature] = token.trim().split(".");

  if (!payload || !signature || !safeEqual(sign(payload), signature)) {
    return null;
  }

  try {
    const parsed = JSON.parse(decode(payload)) as Partial<ResumePayload>;
    if (
      parsed.v !== 1 ||
      typeof parsed.siteId !== "string" ||
      typeof parsed.sessionId !== "string" ||
      typeof parsed.conversationId !== "string"
    ) {
      return null;
    }

    const siteId = parsed.siteId.trim();
    const sessionId = parsed.sessionId.trim();
    const conversationId = parsed.conversationId.trim();

    return siteId && sessionId && conversationId
      ? { siteId, sessionId, conversationId }
      : null;
  } catch {
    return null;
  }
}

export function buildConversationResumeLink(appUrl: string, identity: ConversationResumeIdentity) {
  return `${appUrl.replace(/\/$/, "")}/conversation/${buildConversationResumeToken(identity)}`;
}
