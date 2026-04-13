import { useCallback } from "react";
import {
  assignConversation,
  sendReply,
  toggleConversationTag,
  updateConversationStatus
} from "./api";
import type { DashboardTeamMember, ReplyAttachmentDraft } from "./types";

export function useThreadActions({
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
  threadStatus,
  token
}: {
  attachments: ReplyAttachmentDraft[];
  baseUrl: string;
  clearAttachments(): void;
  conversationId: string;
  draft: string;
  load(mode?: "load" | "silent"): Promise<void>;
  runBusyTask(task: () => Promise<void>): Promise<boolean>;
  setActionsVisible(value: boolean): void;
  setAssignmentVisible(value: boolean): void;
  setDraft(value: string | ((current: string) => string)): void;
  setSavedRepliesVisible(value: boolean): void;
  setToastMessage(value: string | null): void;
  teamMembers: DashboardTeamMember[];
  threadStatus: "open" | "resolved";
  token: string;
}) {
  const handleAssign = useCallback(async (assignedUserId: string | null) => {
    const nextAssignee = teamMembers.find((member) => member.id === assignedUserId) ?? null;
    const success = await runBusyTask(async () => {
      await assignConversation(baseUrl, token, conversationId, assignedUserId);
      await load("silent");
    });
    if (!success) return;
    setAssignmentVisible(false);
    setActionsVisible(false);
    setToastMessage(nextAssignee ? `Assigned to ${nextAssignee.isCurrentUser ? "you" : nextAssignee.name}` : "Conversation unassigned");
  }, [baseUrl, conversationId, load, runBusyTask, setActionsVisible, setAssignmentVisible, setToastMessage, teamMembers, token]);

  const handleSend = useCallback(() => runBusyTask(async () => {
    if (!draft.trim() && !attachments.length) return;
    await sendReply(baseUrl, token, conversationId, draft.trim(), attachments);
    setDraft("");
    clearAttachments();
    await load("silent");
  }), [attachments, baseUrl, clearAttachments, conversationId, draft, load, runBusyTask, setDraft, token]);

  const handleAddTag = useCallback(async (tag: string) => {
    await runBusyTask(async () => {
      await toggleConversationTag(baseUrl, token, conversationId, tag);
      await load("silent");
    });
  }, [baseUrl, conversationId, load, runBusyTask, token]);

  const handleToggleStatus = useCallback(async () => {
    await runBusyTask(async () => {
      await updateConversationStatus(baseUrl, token, conversationId, threadStatus === "resolved" ? "open" : "resolved");
      await load("silent");
    });
    setActionsVisible(false);
  }, [baseUrl, conversationId, load, runBusyTask, setActionsVisible, threadStatus, token]);

  const handleToggleTag = useCallback(async (tag: string) => {
    await runBusyTask(async () => {
      await toggleConversationTag(baseUrl, token, conversationId, tag);
      await load("silent");
    });
  }, [baseUrl, conversationId, load, runBusyTask, token]);

  return {
    handleAddTag,
    handleAssign,
    handlePickReply(body: string) {
      setDraft((current) => (current.trim() ? `${current}\n\n${body}` : body));
      setSavedRepliesVisible(false);
    },
    handleSend,
    handleToggleStatus,
    handleToggleTag,
    openAssignmentFromActions() {
      setActionsVisible(false);
      setAssignmentVisible(true);
    }
  };
}
