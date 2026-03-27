"use client";

import type { ConversationSummary } from "@/lib/types";

export const DASHBOARD_TAGS = ["pricing", "confusion", "bug", "objection"] as const;

export function topTagsFromConversations(conversations: ConversationSummary[]) {
  const counts = new Map<string, number>();

  for (const conversation of conversations) {
    for (const tag of conversation.tags) {
      counts.set(tag, (counts.get(tag) || 0) + 1);
    }
  }

  return Array.from(counts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((left, right) => right.count - left.count || left.tag.localeCompare(right.tag))
    .slice(0, 4);
}

export function moveConversationToFront(
  conversations: ConversationSummary[],
  conversationId: string,
  updater: (conversation: ConversationSummary) => ConversationSummary
) {
  const updated = conversations.map((conversation) =>
    conversation.id === conversationId ? updater(conversation) : conversation
  );
  const active = updated.find((conversation) => conversation.id === conversationId);

  if (!active) {
    return updated;
  }

  return [active, ...updated.filter((conversation) => conversation.id !== conversationId)];
}

export function errorMessageForCode(code: string) {
  switch (code) {
    case "auth":
      return "Your session expired. Sign in again.";
    case "not-found":
      return "That conversation does not belong to this account.";
    case "site-not-found":
      return "That site does not belong to this account.";
    case "site-id-missing":
      return "This site update was missing a site id.";
    case "missing-fields":
      return "Fill in the required fields and try again.";
    case "empty-reply":
      return "Reply content cannot be empty.";
    case "attachment-limit":
      return "You can attach up to 3 files per message.";
    case "attachment-too-large":
      return "Each attachment must be smaller than 4 MB.";
    case "reply-failed":
      return "Reply could not be posted. Try again.";
    default:
      return "Something went wrong. Try again.";
  }
}
