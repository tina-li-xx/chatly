"use client";

import type { DashboardAiAssistSettings } from "@/lib/data/settings-ai-assist";
import type { DashboardTeamMember } from "@/lib/data/settings-types";
import { DashboardThreadDetail } from "./dashboard-thread-detail";
import { DashboardThreadsPanel } from "./dashboard-threads-panel";
import type { DashboardState } from "./use-dashboard-state";

type DashboardClientPanelsProps = {
  state: DashboardState;
  initialWidgetInstalled: boolean;
  widgetSiteIds: string[];
  keyboardConversationId: string | null;
  teamName: string;
  teamInitials: string;
  aiAssistSettings: DashboardAiAssistSettings;
  teamMembers?: DashboardTeamMember[];
  showMobileList: boolean;
  showSidebarDrawer: boolean;
  searchInputId: string;
  openConversation: (conversationId: string) => void;
  clearConversationSelection: () => void;
  setShowSidebarDrawer: (value: boolean) => void;
};

function buildThreadPanelProps({
  state,
  initialWidgetInstalled,
  widgetSiteIds,
  keyboardConversationId,
  searchInputId,
  openConversation,
  teamMembers
}: Pick<DashboardClientPanelsProps, "state" | "initialWidgetInstalled" | "widgetSiteIds" | "keyboardConversationId" | "searchInputId" | "openConversation" | "teamMembers">) {
  return {
    allConversations: state.conversations,
    conversations: state.filteredConversations,
    initialWidgetInstalled,
    widgetSiteIds,
    activeConversationId: state.loadingConversationId ?? state.activeConversation?.id,
    highlightedConversationId: keyboardConversationId,
    threadFilter: state.threadFilter,
    assignmentFilter: state.assignmentFilter,
    searchQuery: state.searchQuery,
    searchInputId,
    onThreadFilterChange: state.setThreadFilter,
    onAssignmentFilterChange: state.setAssignmentFilter,
    onSearchQueryChange: state.setSearchQuery,
    onClearSearch: () => state.setSearchQuery(""),
    onSelectConversation: openConversation,
    teamMembers: teamMembers ?? []
  };
}

function getLoadingConversationSummary(state: DashboardState) {
  if (!state.loadingConversationId) {
    return null;
  }

  return state.conversations.find((conversation) => conversation.id === state.loadingConversationId) ?? null;
}

function renderThreadPanel({
  state,
  initialWidgetInstalled,
  widgetSiteIds,
  keyboardConversationId,
  searchInputId,
  openConversation,
  teamMembers,
  className
}: Pick<DashboardClientPanelsProps, "state" | "initialWidgetInstalled" | "widgetSiteIds" | "keyboardConversationId" | "searchInputId" | "openConversation" | "teamMembers"> & {
  className?: string;
}) {
  return <DashboardThreadsPanel {...buildThreadPanelProps({ state, initialWidgetInstalled, widgetSiteIds, keyboardConversationId, searchInputId, openConversation, teamMembers })} className={className} />;
}

function renderThreadDetail({
  state,
  teamName,
  teamInitials,
  aiAssistSettings,
  teamMembers,
  showSidebarDrawer,
  showSidebarInline,
  showBackButton,
  clearConversationSelection,
  setShowSidebarDrawer
}: Pick<DashboardClientPanelsProps, "state" | "teamName" | "teamInitials" | "aiAssistSettings" | "teamMembers" | "showSidebarDrawer" | "clearConversationSelection" | "setShowSidebarDrawer"> & {
  showSidebarInline: boolean;
  showBackButton?: boolean;
}) {
  const detailProps = {
    activeConversation: state.activeConversation,
    loadingConversationSummary: getLoadingConversationSummary(state),
    savingEmail: state.savingEmail,
    sendingReply: state.sendingReply,
    assigningConversation: state.assigningConversation,
    updatingStatus: state.updatingStatus,
    isVisitorTyping: state.visitorTypingConversationId === state.activeConversation?.id,
    isLiveDisconnected: state.liveConnectionState === "reconnecting",
    teamName,
    teamInitials,
    aiAssistSettings,
    teamMembers,
    showSidebarInline,
    showSidebarDrawer,
    showBackButton,
    onBack: clearConversationSelection,
    onOpenSidebar: () => setShowSidebarDrawer(true),
    onCloseSidebar: () => setShowSidebarDrawer(false),
    onSaveConversationEmail: state.handleSaveConversationEmail,
    onConversationAssignmentChange: state.handleConversationAssignmentChange,
    onSendReply: state.handleReplySend,
    onRetryReply: state.handleReplyRetry,
    onConversationStatusChange: state.handleConversationStatusChange,
    onReplyComposerBlur: state.handleReplyComposerBlur,
    onReplyComposerFocus: state.handleReplyComposerFocus,
    onReplyComposerInput: state.handleReplyComposerInput,
    onToggleTag: state.handleTagToggle
  };

  return (
    <DashboardThreadDetail {...detailProps} />
  );
}

export function renderDashboardClientPanels({
  state,
  initialWidgetInstalled,
  widgetSiteIds,
  keyboardConversationId,
  teamName,
  teamInitials,
  aiAssistSettings,
  teamMembers,
  showMobileList,
  showSidebarDrawer,
  searchInputId,
  openConversation,
  clearConversationSelection,
  setShowSidebarDrawer
}: DashboardClientPanelsProps) {
  return (
    <>
      <div className="lg:hidden">
        {showMobileList || !state.activeConversation ? (
          renderThreadPanel({ state, initialWidgetInstalled, widgetSiteIds, keyboardConversationId, searchInputId, openConversation, teamMembers, className: "min-h-[calc(100vh-56px)] border-r-0" })
        ) : (
          <div className="min-h-[calc(100vh-56px)]">
            {renderThreadDetail({ state, teamName, teamInitials, aiAssistSettings, teamMembers, showSidebarDrawer, showSidebarInline: false, showBackButton: true, clearConversationSelection, setShowSidebarDrawer })}
          </div>
        )}
      </div>

      <section className="hidden h-full min-h-0 lg:block">
        <div className="grid h-full min-h-0 grid-cols-[280px_minmax(0,1fr)] grid-rows-[minmax(0,1fr)] overflow-hidden bg-white xl:grid-cols-[280px_minmax(0,1fr)_300px]">
          {renderThreadPanel({ state, initialWidgetInstalled, widgetSiteIds, keyboardConversationId, searchInputId, openConversation, teamMembers })}
          {renderThreadDetail({ state, teamName, teamInitials, aiAssistSettings, teamMembers, showSidebarDrawer, showSidebarInline: true, clearConversationSelection, setShowSidebarDrawer })}
        </div>
      </section>
    </>
  );
}
