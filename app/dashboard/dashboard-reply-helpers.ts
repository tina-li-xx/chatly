import type { ConversationSummary, ThreadMessage } from "@/lib/types";
import type { AiAssistReplyUsage } from "./dashboard-ai-reply-usage";
import { createOptimisticAttachmentUrls } from "./dashboard-state-helpers";

export type ReplyDelivery = "sent" | "skipped" | "queued_retry" | "failed";

type ReplySummaryTarget = Pick<
  ConversationSummary,
  "unreadCount" | "updatedAt" | "lastMessageAt" | "lastMessagePreview"
>;

export type ReplySummarySnapshot = Pick<
  ReplySummaryTarget,
  "updatedAt" | "lastMessageAt" | "lastMessagePreview"
>;

type RetryableReply = ThreadMessage & { sender: "team"; failed: true };

type BuildOptimisticReplyInput = {
  content: string;
  conversationId: string;
  createdAt: string;
  files: File[];
  retryingMessage: RetryableReply | null;
  aiAssistReplyUsage: AiAssistReplyUsage | null;
};

export function applyReplySummary<T extends ReplySummaryTarget>(target: T, createdAt: string, preview: string): T {
  return { ...target, unreadCount: 0, updatedAt: createdAt, lastMessageAt: createdAt, lastMessagePreview: preview };
}

export function buildOptimisticReply({
  content,
  conversationId,
  createdAt,
  files,
  retryingMessage,
  aiAssistReplyUsage
}: BuildOptimisticReplyInput): ThreadMessage {
  if (retryingMessage) {
    return {
      ...retryingMessage,
      content,
      createdAt,
      pending: true,
      failed: false,
      retryFiles: files.length ? files : undefined,
      ...(aiAssistReplyUsage
        ? { aiAssistReplyEditLevel: aiAssistReplyUsage.editLevel }
        : {})
    };
  }

  return {
    id: `optimistic-team-${crypto.randomUUID()}`,
    conversationId,
    sender: "team",
    content,
    createdAt,
    attachments: createOptimisticAttachmentUrls(files),
    pending: true,
    retryFiles: files.length ? files : undefined,
    ...(aiAssistReplyUsage
      ? { aiAssistReplyEditLevel: aiAssistReplyUsage.editLevel }
      : {})
  };
}

export function buildReplyFormData(conversationId: string, content: string, files: File[]) {
  const formData = new FormData();
  formData.set("conversationId", conversationId);
  formData.set("content", content);
  files.forEach((file) => formData.append("attachments", file));
  return formData;
}

export function findRetryableReply(messages: ThreadMessage[], messageId: string) {
  return (
    messages.find(
      (message): message is RetryableReply =>
        message.id === messageId && message.sender === "team" && Boolean(message.failed)
    ) ?? null
  );
}

export function hasPostedTeamReply(messages: ThreadMessage[], ignoredMessageId?: string) {
  return messages.some((message) => message.sender === "team" && message.id !== ignoredMessageId && !message.failed);
}

export function parseReplyFiles(formData: FormData) {
  return Array.from(formData.getAll("attachments")).filter(
    (entry): entry is File => entry instanceof File && entry.size > 0
  );
}

export function snapshotReplySummary(target: ReplySummarySnapshot) {
  return {
    updatedAt: target.updatedAt,
    lastMessageAt: target.lastMessageAt,
    lastMessagePreview: target.lastMessagePreview
  };
}

export function restoreReplySummary<T extends ReplySummaryTarget>(
  target: T,
  optimisticCreatedAt: string,
  optimisticPreview: string,
  previousSummary: ReplySummarySnapshot
): T {
  return {
    ...target,
    updatedAt: target.updatedAt === optimisticCreatedAt ? previousSummary.updatedAt : target.updatedAt,
    lastMessageAt: target.lastMessageAt === optimisticCreatedAt ? previousSummary.lastMessageAt : target.lastMessageAt,
    lastMessagePreview:
      target.lastMessagePreview === optimisticPreview
        ? previousSummary.lastMessagePreview
        : target.lastMessagePreview
  };
}

export function messageForReplyDelivery(emailDelivery: ReplyDelivery) {
  switch (emailDelivery) {
    case "sent":
      return "Reply posted to the chat thread and emailed to the visitor.";
    case "queued_retry":
      return "Reply posted to the chat thread. Email delivery queued to retry.";
    case "failed":
      return "Reply posted to the chat thread. Email delivery failed.";
    default:
      return "Reply posted to the chat thread.";
  }
}
