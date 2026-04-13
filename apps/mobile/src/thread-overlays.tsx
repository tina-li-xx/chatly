import { SavedRepliesSheet } from "./saved-replies-sheet";
import { ThreadActionToast } from "./thread-action-toast";
import { ThreadAssignmentSheet } from "./thread-assignment-sheet";
import { ThreadQuickActionsSheet } from "./thread-quick-actions-sheet";
import { VisitorInfoSheet } from "./visitor-info-sheet";
import type { ConversationThread, DashboardSavedReply, DashboardTeamMember } from "./types";

export function ThreadOverlays({
  actionsVisible,
  assignedUserId,
  assigneeLabel,
  assignmentVisible,
  busy,
  isResolved,
  replies,
  savedRepliesVisible,
  tags,
  teamMembers,
  toastMessage,
  visibleConversation,
  visitorInfoVisible,
  onAddTag,
  onAssign,
  onCloseActions,
  onCloseAssignment,
  onCloseSavedReplies,
  onCloseVisitorInfo,
  onDismissToast,
  onOpenAssignment,
  onPickReply,
  onToggleStatus,
  onToggleTag
}: {
  actionsVisible: boolean;
  assignedUserId: string | null;
  assigneeLabel: string;
  assignmentVisible: boolean;
  busy: boolean;
  isResolved: boolean;
  replies: DashboardSavedReply[];
  savedRepliesVisible: boolean;
  tags: string[];
  teamMembers: DashboardTeamMember[];
  toastMessage: string | null;
  visibleConversation: ConversationThread | null;
  visitorInfoVisible: boolean;
  onAddTag(tag: string): Promise<void>;
  onAssign(userId: string | null): Promise<void>;
  onCloseActions(): void;
  onCloseAssignment(): void;
  onCloseSavedReplies(): void;
  onCloseVisitorInfo(): void;
  onDismissToast(): void;
  onOpenAssignment(): void;
  onPickReply(body: string): void;
  onToggleStatus(): Promise<void>;
  onToggleTag(tag: string): Promise<void>;
}) {
  return (
    <>
      <SavedRepliesSheet replies={replies} visible={savedRepliesVisible} onClose={onCloseSavedReplies} onPick={(reply) => onPickReply(reply.body)} />
      <ThreadQuickActionsSheet assigneeLabel={assigneeLabel} busy={busy} isResolved={isResolved} tags={tags} visible={actionsVisible} onAddTag={onAddTag} onClose={onCloseActions} onOpenAssignment={onOpenAssignment} onToggleStatus={onToggleStatus} onToggleTag={onToggleTag} />
      <ThreadAssignmentSheet assignedUserId={assignedUserId} busy={busy} teamMembers={teamMembers} visible={assignmentVisible} onAssign={onAssign} onClose={onCloseAssignment} />
      <VisitorInfoSheet conversation={visibleConversation} visible={visitorInfoVisible} onClose={onCloseVisitorInfo} />
      <ThreadActionToast message={toastMessage} onDismiss={onDismissToast} />
    </>
  );
}
