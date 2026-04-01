import type { DashboardEmailTemplateKey } from "@/lib/email-templates";

export type ReplyAttachment = {
  fileName: string;
  contentType: string;
  content: Buffer;
};

export type ConversationTemplateDeliveryStatus =
  | "sent"
  | "skipped"
  | "duplicate"
  | "queued_retry";

export type RetryQueuedConversationTemplateEmailInput = {
  conversationId: string;
  userId?: string | null;
  templateKey: DashboardEmailTemplateKey;
  deliveryKey: string;
  attemptCount: number;
  attachments?: ReplyAttachment[];
};

const INITIAL_RETRY_DELAY_MS = 5 * 60 * 1000;
const MAX_RETRY_DELAY_MS = 6 * 60 * 60 * 1000;
const RETRY_LEASE_MS = 5 * 60 * 1000;

export function buildInitialConversationTemplateRetryAt(now = new Date()) {
  return new Date(now.getTime() + INITIAL_RETRY_DELAY_MS);
}

export function buildConversationTemplateRetryAt(attemptCount: number, now = new Date()) {
  const normalizedAttempts = Math.max(attemptCount, 1);
  const delayMs = Math.min(
    INITIAL_RETRY_DELAY_MS * 2 ** (normalizedAttempts - 1),
    MAX_RETRY_DELAY_MS
  );

  return new Date(now.getTime() + delayMs);
}

export function buildConversationTemplateRetryLeaseUntil(now = new Date()) {
  return new Date(now.getTime() + RETRY_LEASE_MS);
}

export function getOfflineReplyMessageId(deliveryKey: string) {
  if (!deliveryKey.startsWith("offline_reply:")) {
    return null;
  }

  const messageId = deliveryKey.slice("offline_reply:".length).trim();
  return messageId || null;
}
