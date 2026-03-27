"use client";

import { useEffect, useState } from "react";
import type { DashboardClientProps } from "./dashboard-client.types";
import { useDashboardNavigation } from "./dashboard-shell";
import { DashboardThreadDetail } from "./dashboard-thread-detail";
import { DashboardThreadsPanel } from "./dashboard-threads-panel";
import { useDashboardState } from "./use-dashboard-state";
import { displayNameFromEmail, initialsFromLabel } from "@/lib/user-display";
import { SearchIcon } from "./dashboard-ui";

const SEARCH_INPUT_ID = "dashboard-inbox-search";

export function DashboardClient(props: DashboardClientProps) {
  const dashboardNavigation = useDashboardNavigation();
  const state = useDashboardState(props);
  const teamName = displayNameFromEmail(props.userEmail);
  const teamInitials = initialsFromLabel(teamName);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [commandQuery, setCommandQuery] = useState("");
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showSidebarDrawer, setShowSidebarDrawer] = useState(false);
  const [showMobileList, setShowMobileList] = useState(!state.activeConversation);
  const [keyboardConversationId, setKeyboardConversationId] = useState<string | null>(
    state.activeConversation?.id ?? state.filteredConversations[0]?.id ?? null
  );

  useEffect(() => {
    let intervalId: number | null = null;

    const sendHeartbeat = () => {
      fetch("/dashboard/presence", {
        method: "POST",
        keepalive: true
      }).catch(() => {});
    };

    const startHeartbeat = () => {
      if (document.visibilityState !== "visible") {
        return;
      }

      sendHeartbeat();
      if (intervalId !== null) {
        window.clearInterval(intervalId);
      }
      intervalId = window.setInterval(sendHeartbeat, 30000);
    };

    const stopHeartbeat = () => {
      if (intervalId !== null) {
        window.clearInterval(intervalId);
        intervalId = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        startHeartbeat();
      } else {
        stopHeartbeat();
      }
    };

    const handleFocus = () => {
      if (document.visibilityState === "visible") {
        sendHeartbeat();
      }
    };

    startHeartbeat();
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      stopHeartbeat();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  useEffect(() => {
    if (!state.activeConversation) {
      setShowMobileList(true);
      setShowSidebarDrawer(false);
      return;
    }

    if (window.innerWidth < 1024) {
      setShowMobileList(false);
    }
  }, [state.activeConversation?.id]);

  useEffect(() => {
    setKeyboardConversationId((current) => {
      if (current && state.filteredConversations.some((conversation) => conversation.id === current)) {
        return current;
      }

      return state.activeConversation?.id ?? state.filteredConversations[0]?.id ?? null;
    });
  }, [state.filteredConversations, state.activeConversation?.id]);

  function focusSearch() {
    const input = document.getElementById(SEARCH_INPUT_ID) as HTMLInputElement | null;
    if (!input) {
      return;
    }

    input.focus();
    input.select();
  }

  function openConversation(conversationId: string) {
    setKeyboardConversationId(conversationId);
    setShowMobileList(false);
    setShowSidebarDrawer(false);
    setShowCommandPalette(false);
    setShowShortcuts(false);
    void state.openConversation(conversationId);
    window.history.pushState(null, "", `/dashboard/inbox?id=${conversationId}`);
  }

  function clearConversationSelection() {
    setShowSidebarDrawer(false);
    setShowMobileList(true);
    setKeyboardConversationId(state.filteredConversations[0]?.id ?? null);
    state.clearActiveConversation();
    window.history.pushState(null, "", "/dashboard/inbox");
  }

  const commandOptions = [
    {
      id: "focus-search",
      label: "Focus search",
      description: "Jump to the conversation search box.",
      action: () => {
        focusSearch();
        setShowCommandPalette(false);
      }
    },
    {
      id: "open-widget",
      label: "Open widget settings",
      description: "Review your widget install and branding settings.",
      action: () => {
        setShowCommandPalette(false);
        dashboardNavigation?.navigate("/dashboard/widget");
      }
    },
    {
      id: "open-visitors",
      label: "Open visitors",
      description: "Go to the visitors area.",
      action: () => {
        setShowCommandPalette(false);
        dashboardNavigation?.navigate("/dashboard/visitors");
      }
    },
    {
      id: "open-settings",
      label: "Open settings",
      description: "Manage workspace and account settings.",
      action: () => {
        setShowCommandPalette(false);
        dashboardNavigation?.navigate("/dashboard/settings");
      }
    },
    state.activeConversation
      ? {
          id: "toggle-resolved",
          label: state.activeConversation.status === "open" ? "Mark conversation resolved" : "Reopen conversation",
          description: "Update the status of the active conversation.",
          action: () => {
            setShowCommandPalette(false);
            void state.handleConversationStatusChange(
              state.activeConversation?.status === "open" ? "resolved" : "open"
            );
          }
        }
      : null
  ].filter(Boolean) as Array<{
    id: string;
    label: string;
    description: string;
    action: () => void;
  }>;

  const visibleCommandOptions = commandOptions.filter((option) => {
    const needle = commandQuery.trim().toLowerCase();
    if (!needle) {
      return true;
    }

    return `${option.label} ${option.description}`.toLowerCase().includes(needle);
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTypingTarget =
        !!target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable);

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setShowShortcuts(false);
        setCommandQuery("");
        setShowCommandPalette(true);
        return;
      }

      if ((event.metaKey || event.ctrlKey) && event.key === "/") {
        event.preventDefault();
        setShowCommandPalette(false);
        setShowShortcuts(true);
        return;
      }

      if (event.key === "Escape") {
        if (showCommandPalette) {
          setShowCommandPalette(false);
          return;
        }

        if (showShortcuts) {
          setShowShortcuts(false);
          return;
        }

        if (showSidebarDrawer) {
          setShowSidebarDrawer(false);
          return;
        }

        if (state.activeConversation) {
          event.preventDefault();
          clearConversationSelection();
        }
        return;
      }

      if (isTypingTarget) {
        return;
      }

      if ((event.key === "ArrowDown" || event.key === "ArrowUp") && state.filteredConversations.length) {
        event.preventDefault();
        const currentIndex = Math.max(
          0,
          state.filteredConversations.findIndex((conversation) => conversation.id === keyboardConversationId)
        );
        const direction = event.key === "ArrowDown" ? 1 : -1;
        const nextIndex = Math.min(
          state.filteredConversations.length - 1,
          Math.max(0, currentIndex + direction)
        );
        setKeyboardConversationId(state.filteredConversations[nextIndex]?.id ?? null);
        return;
      }

      if (event.key === "Enter" && keyboardConversationId) {
        event.preventDefault();
        openConversation(keyboardConversationId);
        return;
      }

      if (event.key.toLowerCase() === "r" && state.activeConversation) {
        event.preventDefault();
        void state.handleConversationStatusChange(
          state.activeConversation.status === "open" ? "resolved" : "open"
        );
        return;
      }

      if (event.key.toLowerCase() === "n") {
        event.preventDefault();
        focusSearch();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    keyboardConversationId,
    showCommandPalette,
    showShortcuts,
    showSidebarDrawer,
    state.activeConversation,
    state.filteredConversations
  ]);

  return (
    <div className="relative h-full min-h-0">
      <div className="lg:hidden">
        {showMobileList || !state.activeConversation ? (
          <DashboardThreadsPanel
            allConversations={state.conversations}
            conversations={state.filteredConversations}
            activeConversationId={state.loadingConversationId ?? state.activeConversation?.id}
            highlightedConversationId={keyboardConversationId}
            threadFilter={state.threadFilter}
            searchQuery={state.searchQuery}
            searchInputId={SEARCH_INPUT_ID}
            onThreadFilterChange={state.setThreadFilter}
            onSearchQueryChange={state.setSearchQuery}
            onClearSearch={() => state.setSearchQuery("")}
            onSelectConversation={openConversation}
            className="min-h-[calc(100vh-56px)] border-r-0"
          />
        ) : (
          <div className="min-h-[calc(100vh-56px)]">
            <DashboardThreadDetail
              activeConversation={state.activeConversation}
              loadingConversationSummary={
                state.loadingConversationId
                  ? state.conversations.find((conversation) => conversation.id === state.loadingConversationId) ?? null
                  : null
              }
              savingEmail={state.savingEmail}
              sendingReply={state.sendingReply}
              updatingStatus={state.updatingStatus}
              isVisitorTyping={state.visitorTypingConversationId === state.activeConversation?.id}
              isLiveDisconnected={state.liveConnectionState === "reconnecting"}
              teamName={teamName}
              teamInitials={teamInitials}
              showSidebarInline={false}
              showSidebarDrawer={showSidebarDrawer}
              showBackButton
              onBack={clearConversationSelection}
              onOpenSidebar={() => setShowSidebarDrawer(true)}
              onCloseSidebar={() => setShowSidebarDrawer(false)}
              onSaveConversationEmail={state.handleSaveConversationEmail}
              onSendReply={state.handleReplySend}
              onConversationStatusChange={state.handleConversationStatusChange}
              onReplyComposerBlur={state.handleReplyComposerBlur}
              onReplyComposerFocus={state.handleReplyComposerFocus}
              onReplyComposerInput={state.handleReplyComposerInput}
              onToggleTag={state.handleTagToggle}
            />
          </div>
        )}
      </div>

      <section className="hidden h-full min-h-0 lg:block">
        <div className="grid h-full min-h-0 grid-cols-[280px_minmax(0,1fr)] grid-rows-[minmax(0,1fr)] overflow-hidden bg-white xl:grid-cols-[280px_minmax(0,1fr)_300px]">
          <DashboardThreadsPanel
            allConversations={state.conversations}
            conversations={state.filteredConversations}
            activeConversationId={state.loadingConversationId ?? state.activeConversation?.id}
            highlightedConversationId={keyboardConversationId}
            threadFilter={state.threadFilter}
            searchQuery={state.searchQuery}
            searchInputId={SEARCH_INPUT_ID}
            onThreadFilterChange={state.setThreadFilter}
            onSearchQueryChange={state.setSearchQuery}
            onClearSearch={() => state.setSearchQuery("")}
            onSelectConversation={openConversation}
          />

          <DashboardThreadDetail
            activeConversation={state.activeConversation}
            loadingConversationSummary={
              state.loadingConversationId
                ? state.conversations.find((conversation) => conversation.id === state.loadingConversationId) ?? null
                : null
            }
            savingEmail={state.savingEmail}
            sendingReply={state.sendingReply}
            updatingStatus={state.updatingStatus}
            isVisitorTyping={state.visitorTypingConversationId === state.activeConversation?.id}
            isLiveDisconnected={state.liveConnectionState === "reconnecting"}
            teamName={teamName}
            teamInitials={teamInitials}
            showSidebarInline
            showSidebarDrawer={showSidebarDrawer}
            onOpenSidebar={() => setShowSidebarDrawer(true)}
            onCloseSidebar={() => setShowSidebarDrawer(false)}
            onSaveConversationEmail={state.handleSaveConversationEmail}
            onSendReply={state.handleReplySend}
            onConversationStatusChange={state.handleConversationStatusChange}
            onReplyComposerBlur={state.handleReplyComposerBlur}
            onReplyComposerFocus={state.handleReplyComposerFocus}
            onReplyComposerInput={state.handleReplyComposerInput}
            onToggleTag={state.handleTagToggle}
          />
        </div>
      </section>

      {showCommandPalette ? (
        <div className="fixed inset-0 z-40 flex items-start justify-center bg-slate-900/50 px-4 pt-[18vh]" onClick={() => setShowCommandPalette(false)}>
          <div
            className="w-full max-w-[480px] overflow-hidden rounded-xl bg-white shadow-[0_20px_40px_rgba(0,0,0,0.15)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3 text-slate-400">
              <SearchIcon className="h-4 w-4" />
              <input
                autoFocus
                value={commandQuery}
                onChange={(event) => setCommandQuery(event.currentTarget.value)}
                placeholder="Type a command..."
                className="w-full border-0 bg-transparent p-0 text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />
            </div>
            <div className="max-h-[320px] overflow-y-auto p-2">
              {visibleCommandOptions.length ? (
                visibleCommandOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={option.action}
                    className="block w-full rounded-lg px-3 py-3 text-left transition hover:bg-slate-50"
                  >
                    <p className="text-sm font-medium text-slate-900">{option.label}</p>
                    <p className="mt-1 text-xs text-slate-500">{option.description}</p>
                  </button>
                ))
              ) : (
                <div className="px-3 py-6 text-center">
                  <p className="text-sm font-medium text-slate-600">No commands found</p>
                  <p className="mt-1 text-xs text-slate-400">Try a different search.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {showShortcuts ? (
        <div className="fixed inset-0 z-40 flex items-start justify-center bg-slate-900/50 px-4 pt-[18vh]" onClick={() => setShowShortcuts(false)}>
          <div
            className="w-full max-w-[480px] overflow-hidden rounded-xl bg-white shadow-[0_20px_40px_rgba(0,0,0,0.15)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="text-base font-semibold text-slate-900">Keyboard shortcuts</h2>
            </div>
            <div className="space-y-3 px-5 py-4 text-sm text-slate-600">
              {[
                ["Ctrl/Cmd + K", "Open command palette"],
                ["Ctrl/Cmd + /", "Show keyboard shortcuts"],
                ["↑ / ↓", "Move between conversations"],
                ["Enter", "Open selected conversation"],
                ["Enter", "Send message in the reply box"],
                ["Escape", "Close panel or clear selection"],
                ["R", "Mark as resolved or reopen"],
                ["N", "Focus search"]
              ].map(([shortcut, description]) => (
                <div key={shortcut} className="flex items-center justify-between gap-4">
                  <span>{description}</span>
                  <span className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-500">{shortcut}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
