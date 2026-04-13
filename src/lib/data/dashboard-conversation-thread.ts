import type { ConversationThread, VisitorActivity } from "@/lib/types";
import { getWorkspaceAccess } from "@/lib/workspace-access";
import {
  getConversationVisitorActivity,
  loadConversationMessages
} from "./conversations-internals";
import {
  hasConversationAccess,
  mapSummary,
  queryConversationSummaries
} from "./shared";

export async function getDashboardConversationThreadById(
  conversationId: string,
  userId: string
): Promise<ConversationThread | null> {
  const workspace = await getWorkspaceAccess(userId);
  const [summaryResult, messages, visitorActivity] = await Promise.all([
    queryConversationSummaries(
      "c.id = $1 AND s.user_id = $2",
      [conversationId, workspace.ownerUserId],
      "LIMIT 1",
      userId
    ),
    loadConversationMessages(
      conversationId,
      (attachmentId) =>
        `/api/files/${attachmentId}?conversationId=${encodeURIComponent(conversationId)}`
    ),
    getConversationVisitorActivity(conversationId, userId)
  ]);

  if (!summaryResult.rowCount) {
    return null;
  }

  return {
    ...mapSummary(summaryResult.rows[0]),
    messages,
    visitorActivity
  };
}

export async function getDashboardConversationVisitorActivityById(
  conversationId: string,
  userId: string
): Promise<VisitorActivity | null> {
  const workspace = await getWorkspaceAccess(userId);
  const hasAccess = await hasConversationAccess(
    conversationId,
    workspace.ownerUserId,
    userId
  );

  if (!hasAccess) {
    return null;
  }

  return getConversationVisitorActivity(conversationId, userId);
}
