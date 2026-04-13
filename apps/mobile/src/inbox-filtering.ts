import type { ConversationSummary, SessionUser } from "./types";
import type { InboxFilter } from "./inbox-chrome";

export function defaultInboxFilter(role: SessionUser["workspaceRole"]): InboxFilter {
  return role === "member" ? "open" : "all";
}

export function normalizeInboxFilter(
  filter: InboxFilter,
  role: SessionUser["workspaceRole"]
): InboxFilter {
  if (role === "member" && filter !== "open" && filter !== "resolved") {
    return "open";
  }

  return filter;
}

export function filterInboxConversations(
  conversations: ConversationSummary[],
  filter: InboxFilter,
  userId: string
) {
  return conversations.filter((conversation) => {
    if (filter === "open") return conversation.status === "open";
    if (filter === "resolved") return conversation.status === "resolved";
    if (filter === "mine") return conversation.assignedUserId === userId;
    return true;
  });
}
