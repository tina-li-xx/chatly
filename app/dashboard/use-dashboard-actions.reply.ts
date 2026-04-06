import type { FormEvent } from "react";
import {
  aiAssistReplyUsageEventDetail,
  readAiAssistReplyUsage,
  storedAiAssistReplyUsage,
  type AiAssistReplyUsage
} from "./dashboard-ai-reply-usage";
import {
  applyReplySummary,
  buildOptimisticReply,
  buildReplyFormData,
  findRetryableReply,
  hasPostedTeamReply,
  messageForReplyDelivery,
  parseReplyFiles,
  restoreReplySummary,
  snapshotReplySummary,
  type ReplyDelivery
} from "./dashboard-reply-helpers";
import { trackDashboardAiAssistEvent } from "./dashboard-ai-assist-events";
import { postDashboardForm } from "./dashboard-client.api";
import {
  markOptimisticMessageFailed,
  previewForMessage,
  revokeOptimisticAttachmentUrls,
  settleOptimisticMessage,
  updateConversationSummaryList
} from "./dashboard-state-helpers";
import { trackGrometricsEvent } from "@/lib/grometrics";
import type { ConversationThread, ThreadMessage } from "@/lib/types";
import type { DashboardActionsParams } from "./use-dashboard-actions.types";

type ReplyResponse = { conversationId: string; message: ThreadMessage; emailDelivery: ReplyDelivery };
export function createDashboardReplyActions({
  activeConversation,
  sendingReply,
  setConversations,
  setActiveConversation,
  setSendingReply,
  setAnsweredConversations,
  setBanner,
  conversationCacheRef,
  recentOptimisticReplyAtRef,
  showBanner,
  clearTypingSignal
}: DashboardActionsParams) {
  function updateActiveThread(updater: (current: ConversationThread) => ConversationThread) {
    setActiveConversation((current) => {
      if (!current) {
        return current;
      }
      const next = updater(current);
      conversationCacheRef.current.set(next.id, next);
      return next;
    });
  }

  function syncConversationSummary(createdAt: string, preview: string) {
    if (!activeConversation) return;
    setConversations((current) =>
      updateConversationSummaryList(current, activeConversation.id, (conversation) =>
        applyReplySummary(conversation, createdAt, preview)
      )
    );
  }

  function restoreConversationSummary(
    optimisticCreatedAt: string,
    optimisticPreview: string,
    previousSummary: ReturnType<typeof snapshotReplySummary>
  ) {
    if (!activeConversation) return;
    setConversations((current) =>
      updateConversationSummaryList(current, activeConversation.id, (conversation) =>
        restoreReplySummary(conversation, optimisticCreatedAt, optimisticPreview, previousSummary)
      )
    );
  }

  async function submitReply({
    content,
    files,
    messageId,
    aiAssistReplyUsage
  }: {
    content: string;
    files: File[];
    messageId?: string;
    aiAssistReplyUsage?: AiAssistReplyUsage | null;
  }) {
    if (!activeConversation) {
      return;
    }
    const conversationId = activeConversation.id;
    const retryingMessage = messageId ? findRetryableReply(activeConversation.messages, messageId) : null;
    if (messageId && !retryingMessage) {
      return;
    }
    const hadTeamReply = hasPostedTeamReply(activeConversation.messages, messageId);
    const optimisticCreatedAt = new Date().toISOString();
    const optimisticMessage: ThreadMessage = buildOptimisticReply({
      content,
      conversationId,
      createdAt: optimisticCreatedAt,
      files,
      retryingMessage,
      aiAssistReplyUsage: aiAssistReplyUsage ?? null
    });
    const optimisticPreview = previewForMessage(optimisticMessage);
    const previousSummary = snapshotReplySummary(activeConversation);
    const formData = buildReplyFormData(conversationId, content, files);
    setSendingReply(true);
    setBanner(null);
    await clearTypingSignal();
    recentOptimisticReplyAtRef.current.set(conversationId, Date.now());
    updateActiveThread((current) => ({
      ...applyReplySummary(current, optimisticCreatedAt, optimisticPreview),
      messages: retryingMessage
        ? current.messages.map((message) =>
            message.id === optimisticMessage.id ? optimisticMessage : message
          )
        : [...current.messages, optimisticMessage]
    }));
    syncConversationSummary(optimisticCreatedAt, optimisticPreview);
    try {
      const payload = await postDashboardForm<ReplyResponse>("/dashboard/reply", formData);
      const { message, emailDelivery } = payload;
      const postedPreview = previewForMessage(message);
      updateActiveThread((current) => ({
        ...applyReplySummary(current, message.createdAt, postedPreview),
        messages: settleOptimisticMessage(current.messages, optimisticMessage.id, message)
      }));
      syncConversationSummary(message.createdAt, postedPreview);

      trackGrometricsEvent("team_reply_sent", {
        source: "dashboard_inbox",
        has_content: Boolean(content),
        has_attachments: files.length > 0,
        attachment_count: files.length,
        email_delivery: emailDelivery,
        retry: Boolean(messageId)
      });
      if (optimisticMessage.aiAssistReplyEditLevel !== undefined) {
        trackDashboardAiAssistEvent("ai.reply.used", {
          conversationId,
          ...aiAssistReplyUsageEventDetail(optimisticMessage.aiAssistReplyEditLevel)
        });
      }
      if (!hadTeamReply) {
        setAnsweredConversations((count) => count + 1);
      }
      recentOptimisticReplyAtRef.current.set(conversationId, Date.now());
      revokeOptimisticAttachmentUrls(optimisticMessage);
      showBanner("success", messageForReplyDelivery(emailDelivery));
    } catch (error) {
      recentOptimisticReplyAtRef.current.delete(conversationId);
      updateActiveThread((current) => ({
        ...restoreReplySummary(current, optimisticCreatedAt, optimisticPreview, previousSummary),
        messages: markOptimisticMessageFailed(current.messages, optimisticMessage.id, files)
      }));
      restoreConversationSummary(optimisticCreatedAt, optimisticPreview, previousSummary);
      showBanner("error", error instanceof Error ? error.message : "Reply could not be sent.");
    } finally {
      setSendingReply(false);
    }
  }

  async function handleReplySend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const content = String(formData.get("content") ?? "").trim();
    const files = parseReplyFiles(formData);
    const aiAssistReplyUsage = readAiAssistReplyUsage(formData, content);
    event.currentTarget.reset();
    await submitReply({ content, files, aiAssistReplyUsage });
  }

  async function handleReplyRetry(messageId: string) {
    if (!activeConversation || sendingReply) {
      return;
    }
    const retryingMessage = findRetryableReply(activeConversation.messages, messageId);
    if (!retryingMessage) {
      return;
    }

    await submitReply({
      messageId,
      content: retryingMessage.content,
      files: retryingMessage.retryFiles ?? [],
      aiAssistReplyUsage: storedAiAssistReplyUsage(retryingMessage.aiAssistReplyEditLevel)
    });
  }

  return {
    handleReplySend,
    handleReplyRetry
  };
}
