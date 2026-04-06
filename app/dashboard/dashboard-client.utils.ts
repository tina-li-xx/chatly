"use client";

import type { ConversationSummary } from "@/lib/types";
export { DASHBOARD_TAGS } from "@/lib/dashboard-tags";

function toTimestamp(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : null;
}

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

export function sortConversationSummariesByRecency(conversations: ConversationSummary[]) {
  return [...conversations].sort((left, right) => {
    const leftLastMessageAt = toTimestamp(left.lastMessageAt);
    const rightLastMessageAt = toTimestamp(right.lastMessageAt);

    if (leftLastMessageAt !== rightLastMessageAt) {
      if (leftLastMessageAt === null) return 1;
      if (rightLastMessageAt === null) return -1;
      return rightLastMessageAt - leftLastMessageAt;
    }

    const leftUpdatedAt = toTimestamp(left.updatedAt) ?? 0;
    const rightUpdatedAt = toTimestamp(right.updatedAt) ?? 0;
    return rightUpdatedAt - leftUpdatedAt;
  });
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
    case "invalid-assignee":
      return "Choose someone on your active workspace team.";
    case "assignment-failed":
      return "We couldn't update the assignee just now.";
    case "draft-required":
      return "Write a draft first so AI has something to rewrite.";
    case "invalid-tone":
      return "Choose a rewrite style and try again.";
    case "ai-provider-not-configured":
      return "AI assist isn't configured yet.";
    case "feature-disabled":
      return "That AI Assist feature is turned off in settings.";
    case "ai-assist-requires-growth":
      return "AI Assist is available on Growth.";
    case "ai-assist-limit-reached":
      return "The AI Assist requests included in this billing cycle have been used.";
    case "ai-assist-failed":
      return "AI assist couldn't finish that request.";
    case "forbidden":
      return "You don't have permission to do that.";
    case "saved-replies-failed":
      return "We couldn't save that reply right now.";
    case "slug-taken":
      return "That slug is already in use.";
    case "help-center-failed":
      return "We couldn't update the help center right now.";
    case "unknown-action":
      return "That action isn't supported.";
    default:
      return "Something went wrong. Try again.";
  }
}
