import { compactPageLabel, conversationLocation } from "./formatting";
import type { ConversationThread, DashboardTeamMember } from "./types";

type ThreadSummary = {
  assigneeLabel: string;
  headerSubtitle: string;
  headerTitle: string;
};

export function buildThreadSummary(
  thread: ConversationThread | null,
  teamMembers: DashboardTeamMember[],
  currentUserId: string,
): ThreadSummary {
  const assignee = teamMembers.find((member) => member.id === thread?.assignedUserId) ?? null;
  const assigneeLabel = assignee
    ? assignee.id === currentUserId
      ? "Assigned to you"
      : `Assigned to ${assignee.name}`
    : "Unassigned";

  return {
    assigneeLabel,
    headerTitle: thread?.email || thread?.siteName || "Conversation",
    headerSubtitle: thread
      ? compactPageLabel(thread.recordedPageUrl ?? thread.pageUrl) ||
        conversationLocation(thread) ||
        "Conversation"
      : "Loading conversation",
  };
}
