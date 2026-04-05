"use client";

import { WarningIcon } from "./dashboard-ui";
import { conversationIdentity } from "./dashboard-conversation-display";
import { renderDashboardThreadDetailComposer } from "./dashboard-thread-detail-composer";
import { renderDashboardThreadDetailHeader } from "./dashboard-thread-detail-header";
import { renderDashboardThreadDetailSidebars } from "./dashboard-thread-detail-sidebars";
import { renderDashboardThreadDetailEmptyState, renderDashboardThreadDetailLoadingState } from "./dashboard-thread-detail-states";
import { renderDashboardThreadDetailTimeline } from "./dashboard-thread-detail-timeline";
import type { DashboardThreadDetailProps } from "./dashboard-thread-detail-types";

export function DashboardThreadDetail({
  activeConversation,
  loadingConversationSummary,
  savingEmail,
  assigningConversation = false,
  sendingReply,
  updatingStatus,
  isVisitorTyping,
  isLiveDisconnected,
  teamName,
  teamInitials,
  teamMembers = [],
  showSidebarInline = true,
  showSidebarDrawer = false,
  showBackButton = false,
  onSaveConversationEmail,
  onConversationAssignmentChange = async () => {},
  onSendReply,
  onRetryReply,
  onConversationStatusChange,
  onReplyComposerBlur,
  onReplyComposerFocus,
  onReplyComposerInput,
  onToggleTag,
  onBack,
  onOpenSidebar,
  onCloseSidebar
}: DashboardThreadDetailProps) {
  if (
    loadingConversationSummary &&
    (!activeConversation || activeConversation.id !== loadingConversationSummary.id)
  ) {
    return renderDashboardThreadDetailLoadingState({
      email: loadingConversationSummary.email,
      showBackButton,
      showSidebarInline,
      onBack
    });
  }

  if (!activeConversation) {
    return renderDashboardThreadDetailEmptyState(showSidebarInline);
  }

  const visitor = conversationIdentity(activeConversation.email, "Anonymous visitor");

  return (
    <>
      <section className="flex h-full min-h-0 flex-col bg-white">
        {renderDashboardThreadDetailHeader({
          name: visitor.name,
          secondary: visitor.secondary,
          assignedUserId: activeConversation.assignedUserId,
          status: activeConversation.status,
          teamMembers,
          showBackButton,
          showSidebarInline,
          updatingStatus,
          onConversationStatusChange,
          onBack,
          onOpenSidebar
        })}

        {isLiveDisconnected ? (
          <div className="border-b border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-700">
            <div className="flex items-center gap-2">
              <WarningIcon className="h-4 w-4" />
              <span>Connection lost · Trying to reconnect...</span>
            </div>
          </div>
        ) : null}

        {renderDashboardThreadDetailTimeline({
          activeConversation,
          isVisitorTyping,
          sendingReply,
          teamInitials,
          teamName,
          onRetryReply
        })}
        {renderDashboardThreadDetailComposer({
          activeConversation,
          sendingReply,
          onSendReply,
          onReplyComposerBlur,
          onReplyComposerFocus,
          onReplyComposerInput,
          onToggleTag
        })}
      </section>

      {renderDashboardThreadDetailSidebars({
        activeConversation,
        savingEmail,
        assigningConversation,
        teamMembers,
        showSidebarInline,
        showSidebarDrawer,
        onSaveConversationEmail,
        onConversationAssignmentChange,
        onToggleTag,
        onCloseSidebar
      })}
    </>
  );
}
