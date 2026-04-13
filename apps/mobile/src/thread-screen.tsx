import { useCallback, useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import {
  getConversation,
  markConversationRead,
} from "./api";
import { friendlyErrorMessage } from "./formatting";
import { ThreadSkeleton } from "./loading-skeletons";
import { sameConversationThread } from "./mobile-data-equality";
import { mobileTheme } from "./mobile-theme";
import { ThreadComposer } from "./thread-composer";
import { mapThreadError } from "./thread-error";
import { ThreadHeader } from "./thread-header";
import { ThreadOverlays } from "./thread-overlays";
import { ThreadTranscript } from "./thread-transcript";
import { buildThreadSummary } from "./thread-summary";
import { useAutoRefresh } from "./use-auto-refresh";
import { useReplyAttachments } from "./use-reply-attachments";
import type { ConversationThread, DashboardSavedReply, DashboardTeamMember } from "./types";
import { useThreadActions } from "./use-thread-actions";
import { useConversationTyping } from "./use-conversation-typing";
import { useThreadLiveState } from "./use-thread-live-state";
type ThreadScreenProps = {
  baseUrl: string;
  token: string;
  conversationId: string;
  currentUserId: string;
  savedReplies: DashboardSavedReply[];
  teamMembers: DashboardTeamMember[];
  onBack(): void;
};
export function ThreadScreen({
  baseUrl,
  token,
  conversationId,
  currentUserId,
  savedReplies,
  teamMembers,
  onBack
}: ThreadScreenProps) {
  const [thread, setThread] = useState<ConversationThread | null>(null);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedRepliesVisible, setSavedRepliesVisible] = useState(false);
  const [actionsVisible, setActionsVisible] = useState(false);
  const [assignmentVisible, setAssignmentVisible] = useState(false);
  const [visitorInfoVisible, setVisitorInfoVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const { addFromCamera, addFromLibrary, attachments, clearAttachments, removeAttachment } = useReplyAttachments();
  const { localTypingActive } = useConversationTyping({ baseUrl, token, conversationId, draft });
  const { connectionState, teamTyping, visitorTyping } = useThreadLiveState({
    baseUrl,
    token,
    conversationId,
    onRefresh: () => {
      void load("silent");
    }
  });
  const load = useCallback(async (mode: "load" | "silent" = "load") => {
    if (mode === "load") {
      setLoading(true);
    }
    try {
      const next = await getConversation(baseUrl, token, conversationId);
      setThread((current) => (sameConversationThread(current, next) ? current : next));
      setError(null);
      if (next.unreadCount > 0) {
        await markConversationRead(baseUrl, token, conversationId);
      }
    } catch (nextError) {
      setError(nextError instanceof Error ? friendlyErrorMessage(nextError.message) : "Unable to load thread.");
    } finally {
      setLoading(false);
    }
  }, [baseUrl, conversationId, token]);
  useEffect(() => {
    void load();
  }, [load]);
  useAutoRefresh(() => {
    void load("silent");
  }, connectionState !== "connected");
  async function runBusyTask(task: () => Promise<void>) {
    setBusy(true);
    try {
      await task();
      return true;
    } catch (nextError) {
      setError(nextError instanceof Error ? mapThreadError(nextError.message) : "Unable to complete that action.");
      return false;
    } finally {
      setBusy(false);
    }
  }
  const typingLabel = visitorTyping ? "Visitor is typing..." : teamTyping && !localTypingActive
    ? "Someone on your team is replying..."
    : null;
  const { assigneeLabel, headerSubtitle, headerTitle } = buildThreadSummary(thread, teamMembers, currentUserId);
  const assignee = teamMembers.find((member) => member.id === thread?.assignedUserId) ?? null;
  const actions = useThreadActions({
    attachments,
    baseUrl,
    clearAttachments,
    conversationId,
    draft,
    load,
    runBusyTask,
    setActionsVisible,
    setAssignmentVisible,
    setDraft,
    setSavedRepliesVisible,
    setToastMessage,
    teamMembers,
    threadStatus: thread?.status ?? "open",
    token
  });

  return (
    <View style={styles.screen}>
      <ThreadHeader
        assigneeAvatarUrl={assignee?.avatarDataUrl ?? null}
        assigneeLabel={assigneeLabel}
        assigneeName={assignee?.name ?? null}
        hasAssignee={Boolean(assignee)}
        busy={busy || !thread}
        subtitle={headerSubtitle}
        isResolved={thread?.status === "resolved"}
        onBack={onBack}
        onOpenAssignment={() => setAssignmentVisible(true)}
        onOpenInfo={() => setVisitorInfoVisible(true)}
        onOpenActions={() => setActionsVisible(true)}
        title={headerTitle}
      />
      {loading ? (
        <ThreadSkeleton />
      ) : thread ? (
        <>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <ThreadTranscript assigneeLabel={assigneeLabel} baseUrl={baseUrl} thread={thread} token={token} />
          <ThreadComposer
            attachments={attachments}
            busy={busy}
            draft={draft}
            typingLabel={typingLabel}
            onAttachCamera={() => void runBusyTask(addFromCamera)}
            onAttachLibrary={() => void runBusyTask(addFromLibrary)}
            onChangeDraft={setDraft}
            onOpenSavedReplies={() => setSavedRepliesVisible(true)}
            onRemoveAttachment={removeAttachment}
            onSend={() => void actions.handleSend()}
          />
          <ThreadOverlays
            actionsVisible={actionsVisible}
            assignedUserId={thread.assignedUserId}
            assigneeLabel={assigneeLabel}
            assignmentVisible={assignmentVisible}
            busy={busy}
            isResolved={thread.status === "resolved"}
            replies={savedReplies}
            savedRepliesVisible={savedRepliesVisible}
            tags={thread.tags}
            teamMembers={teamMembers}
            toastMessage={toastMessage}
            visibleConversation={thread}
            visitorInfoVisible={visitorInfoVisible}
            onAddTag={actions.handleAddTag}
            onAssign={actions.handleAssign}
            onCloseActions={() => setActionsVisible(false)}
            onCloseAssignment={() => setAssignmentVisible(false)}
            onCloseSavedReplies={() => setSavedRepliesVisible(false)}
            onCloseVisitorInfo={() => setVisitorInfoVisible(false)}
            onDismissToast={() => setToastMessage(null)}
            onOpenAssignment={actions.openAssignmentFromActions}
            onPickReply={actions.handlePickReply}
            onToggleStatus={actions.handleToggleStatus}
            onToggleTag={actions.handleToggleTag}
          />
        </>
      ) : (
        <View style={styles.loading}><Text style={styles.error}>Conversation not found.</Text></View>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: mobileTheme.colors.slate50 },
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
  error: {
    marginHorizontal: mobileTheme.spacing.lg,
    marginVertical: mobileTheme.spacing.md,
    padding: mobileTheme.spacing.md,
    borderRadius: mobileTheme.radius.lg,
    backgroundColor: mobileTheme.colors.errorSurface,
    color: mobileTheme.colors.red
  }
});
