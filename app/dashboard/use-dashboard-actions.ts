"use client";

import type { Dispatch, FormEvent, MutableRefObject, SetStateAction } from "react";
import { postDashboardForm } from "./dashboard-client.api";
import { moveConversationToFront } from "./dashboard-client.utils";
import type { BannerState } from "./dashboard-client.types";
import {
  createOptimisticAttachmentUrls,
  nextTagsForToggle,
  previewForMessage,
  removeMessageById,
  revokeOptimisticAttachmentUrls,
  settleOptimisticMessage,
  toSummary
} from "./dashboard-state-helpers";
import type {
  ConversationStatus,
  ConversationSummary,
  ConversationThread,
  Site,
  ThreadMessage
} from "@/lib/types";

type StateSetter<T> = Dispatch<SetStateAction<T>>;

type DashboardActionsParams = {
  activeConversation: ConversationThread | null;
  sendingReply: boolean;
  setSites: StateSetter<Site[]>;
  setConversations: StateSetter<ConversationSummary[]>;
  setActiveConversation: StateSetter<ConversationThread | null>;
  setSavingSiteId: StateSetter<string | null>;
  setSavingEmail: StateSetter<boolean>;
  setSendingReply: StateSetter<boolean>;
  setUpdatingStatus: StateSetter<boolean>;
  setAnsweredConversations: StateSetter<number>;
  setBanner: StateSetter<BannerState>;
  recentOptimisticReplyAtRef: MutableRefObject<Map<string, number>>;
  pendingTagMutationsRef: MutableRefObject<Set<string>>;
  activeTypingConversationIdRef: MutableRefObject<string | null>;
  lastTypingSentAtRef: MutableRefObject<number>;
  showBanner: (tone: NonNullable<BannerState>["tone"], text: string) => void;
  clearTypingSignal: () => Promise<void>;
  postTypingSignal: (conversationId: string, typing: boolean) => Promise<void>;
};

export function createDashboardActions({
  activeConversation,
  sendingReply,
  setSites,
  setConversations,
  setActiveConversation,
  setSavingSiteId,
  setSavingEmail,
  setSendingReply,
  setUpdatingStatus,
  setAnsweredConversations,
  setBanner,
  recentOptimisticReplyAtRef,
  pendingTagMutationsRef,
  activeTypingConversationIdRef,
  lastTypingSentAtRef,
  showBanner,
  clearTypingSignal,
  postTypingSignal
}: DashboardActionsParams) {
  async function handleSiteTitleSave(event: FormEvent<HTMLFormElement>, siteId: string) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    setSavingSiteId(siteId);
    setBanner(null);

    try {
      const payload = await postDashboardForm<{ siteId: string; widgetTitle: string }>(
        "/dashboard/sites/update",
        formData
      );

      setSites((current) =>
        current.map((site) => (site.id === siteId ? { ...site, widgetTitle: payload.widgetTitle } : site))
      );
      showBanner("success", "Widget title saved without leaving the page.");
    } catch (error) {
      showBanner("error", error instanceof Error ? error.message : "Widget title could not be saved.");
    } finally {
      setSavingSiteId(null);
    }
  }

  async function handleSaveConversationEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!activeConversation) {
      return;
    }

    const formData = new FormData(event.currentTarget);
    setSavingEmail(true);
    setBanner(null);

    try {
      const payload = await postDashboardForm<{ conversationId: string; email: string }>(
        "/dashboard/email",
        formData
      );

      setActiveConversation((current) => (current ? { ...current, email: payload.email } : current));
      setConversations((current) =>
        current.map((conversation) =>
          conversation.id === activeConversation.id ? { ...conversation, email: payload.email } : conversation
        )
      );
      showBanner("success", "Visitor email saved.");
    } catch (error) {
      showBanner("error", error instanceof Error ? error.message : "Visitor email could not be saved.");
    } finally {
      setSavingEmail(false);
    }
  }

  async function handleReplySend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!activeConversation) {
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);
    const hadFounderReply = activeConversation.messages.some((message) => message.sender === "founder");
    const content = String(formData.get("content") ?? "").trim();
    const files = Array.from(formData.getAll("attachments")).filter(
      (entry): entry is File => entry instanceof File && entry.size > 0
    );
    const optimisticId = `optimistic-founder-${crypto.randomUUID()}`;
    const optimisticCreatedAt = new Date().toISOString();
    const optimisticMessage: ThreadMessage = {
      id: optimisticId,
      conversationId: activeConversation.id,
      sender: "founder",
      content,
      createdAt: optimisticCreatedAt,
      attachments: createOptimisticAttachmentUrls(files),
      pending: true
    };
    const optimisticPreview = previewForMessage(optimisticMessage);
    const previousSummary = {
      updatedAt: activeConversation.updatedAt,
      lastMessageAt: activeConversation.lastMessageAt,
      lastMessagePreview: activeConversation.lastMessagePreview
    };

    setSendingReply(true);
    setBanner(null);
    await clearTypingSignal();
    setActiveConversation((current) =>
      current
        ? {
            ...current,
            unreadCount: 0,
            updatedAt: optimisticCreatedAt,
            lastMessageAt: optimisticCreatedAt,
            lastMessagePreview: optimisticPreview,
            messages: [...current.messages, optimisticMessage]
          }
        : current
    );
    setConversations((current) =>
      moveConversationToFront(current, activeConversation.id, (conversation) => ({
        ...conversation,
        unreadCount: 0,
        updatedAt: optimisticCreatedAt,
        lastMessageAt: optimisticCreatedAt,
        lastMessagePreview: optimisticPreview
      }))
    );
    form.reset();

    try {
      const payload = await postDashboardForm<{
        conversationId: string;
        message: ThreadMessage;
        emailDelivery: "sent" | "skipped" | "failed";
      }>(
        "/dashboard/reply",
        formData
      );
      const { message, emailDelivery } = payload;

      setActiveConversation((current) =>
        current
          ? {
              ...current,
              unreadCount: 0,
              updatedAt: message.createdAt,
              lastMessageAt: message.createdAt,
              lastMessagePreview: previewForMessage(message),
              messages: settleOptimisticMessage(current.messages, optimisticId, message)
            }
          : current
      );
      setConversations((current) =>
        moveConversationToFront(current, activeConversation.id, (conversation) => ({
          ...conversation,
          unreadCount: 0,
          updatedAt: message.createdAt,
          lastMessageAt: message.createdAt,
          lastMessagePreview: previewForMessage(message)
        }))
      );

      if (!hadFounderReply) {
        setAnsweredConversations((count) => count + 1);
      }

      recentOptimisticReplyAtRef.current.set(activeConversation.id, Date.now());
      revokeOptimisticAttachmentUrls(optimisticMessage);
      showBanner(
        "success",
        emailDelivery === "sent"
          ? "Reply posted to the chat thread and emailed to the visitor."
          : emailDelivery === "failed"
            ? "Reply posted to the chat thread. Email delivery failed."
            : "Reply posted to the chat thread."
      );
    } catch (error) {
      setActiveConversation((current) =>
        current
          ? {
              ...current,
              updatedAt:
                current.updatedAt === optimisticCreatedAt ? previousSummary.updatedAt : current.updatedAt,
              lastMessageAt:
                current.lastMessageAt === optimisticCreatedAt
                  ? previousSummary.lastMessageAt
                  : current.lastMessageAt,
              lastMessagePreview:
                current.lastMessagePreview === optimisticPreview
                  ? previousSummary.lastMessagePreview
                  : current.lastMessagePreview,
              messages: removeMessageById(current.messages, optimisticId)
            }
          : current
      );
      setConversations((current) =>
        current.map((conversation) =>
          conversation.id === activeConversation.id
            ? {
                ...conversation,
                updatedAt:
                  conversation.updatedAt === optimisticCreatedAt
                    ? previousSummary.updatedAt
                    : conversation.updatedAt,
                lastMessageAt:
                  conversation.lastMessageAt === optimisticCreatedAt
                    ? previousSummary.lastMessageAt
                    : conversation.lastMessageAt,
                lastMessagePreview:
                  conversation.lastMessagePreview === optimisticPreview
                    ? previousSummary.lastMessagePreview
                    : conversation.lastMessagePreview
              }
            : conversation
        )
      );
      revokeOptimisticAttachmentUrls(optimisticMessage);
      showBanner("error", error instanceof Error ? error.message : "Reply could not be sent.");
    } finally {
      setSendingReply(false);
    }
  }

  async function handleConversationStatusChange(status: ConversationStatus) {
    if (!activeConversation) {
      return;
    }

    const formData = new FormData();
    formData.set("conversationId", activeConversation.id);
    formData.set("status", status);
    setUpdatingStatus(true);
    setBanner(null);

    try {
      const payload = await postDashboardForm<{ conversationId: string; status: ConversationStatus }>(
        "/dashboard/status",
        formData
      );

      setActiveConversation((current) =>
        current
          ? {
              ...current,
              status: payload.status,
              unreadCount: payload.status === "resolved" ? 0 : current.unreadCount
            }
          : current
      );
      setConversations((current) =>
        current.map((conversation) =>
          conversation.id === activeConversation.id
            ? {
                ...conversation,
                status: payload.status,
                unreadCount: payload.status === "resolved" ? 0 : conversation.unreadCount
              }
            : conversation
        )
      );
      showBanner("success", payload.status === "resolved" ? "Thread marked as resolved." : "Thread reopened.");
    } catch (error) {
      showBanner("error", error instanceof Error ? error.message : "Thread status could not be updated.");
    } finally {
      setUpdatingStatus(false);
    }
  }

  async function handleTagToggle(tag: string) {
    if (!activeConversation || pendingTagMutationsRef.current.has(tag)) {
      return;
    }

    const previousTags = activeConversation.tags;
    const nextTags = nextTagsForToggle(previousTags, tag);
    const formData = new FormData();
    formData.set("conversationId", activeConversation.id);
    formData.set("tag", tag);
    pendingTagMutationsRef.current.add(tag);
    setBanner(null);
    setActiveConversation((current) => (current ? { ...current, tags: nextTags } : current));
    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === activeConversation.id ? { ...conversation, tags: nextTags } : conversation
      )
    );

    try {
      await postDashboardForm<{ conversationId: string; tag: string }>("/dashboard/tags", formData);
    } catch (error) {
      setActiveConversation((current) => (current ? { ...current, tags: previousTags } : current));
      setConversations((current) =>
        current.map((conversation) =>
          conversation.id === activeConversation.id ? { ...conversation, tags: previousTags } : conversation
        )
      );
      showBanner("error", error instanceof Error ? error.message : "Tag update failed.");
    } finally {
      pendingTagMutationsRef.current.delete(tag);
    }
  }

  function handleReplyComposerInput(value: string) {
    if (!activeConversation || sendingReply) {
      return;
    }

    const trimmed = value.trim();
    if (!trimmed) {
      void clearTypingSignal();
      return;
    }

    const now = Date.now();
    if (
      activeTypingConversationIdRef.current !== activeConversation.id ||
      now - lastTypingSentAtRef.current >= 2000
    ) {
      activeTypingConversationIdRef.current = activeConversation.id;
      lastTypingSentAtRef.current = now;
      void postTypingSignal(activeConversation.id, true);
    }
  }

  function handleReplyComposerFocus(value: string) {
    if (value.trim()) {
      handleReplyComposerInput(value);
    }
  }

  function handleReplyComposerBlur() {
    void clearTypingSignal();
  }

  return {
    handleSiteTitleSave,
    handleSaveConversationEmail,
    handleReplySend,
    handleConversationStatusChange,
    handleTagToggle,
    handleReplyComposerInput,
    handleReplyComposerFocus,
    handleReplyComposerBlur
  };
}
