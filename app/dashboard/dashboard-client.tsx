"use client";

import { useEffect, useState } from "react";
import { isSiteWidgetInstalled } from "@/lib/site-installation";
import { displayNameFromEmail, initialsFromLabel } from "@/lib/user-display";
import type { DashboardClientProps } from "./dashboard-client.types";
import {
  buildDashboardCommandOptions,
  filterDashboardCommandOptions,
  renderDashboardCommandPalette,
  renderDashboardShortcutsDialog
} from "./dashboard-client-overlays";
import { renderDashboardClientPanels } from "./dashboard-client-panels";
import { useDashboardNavigation } from "./dashboard-shell";
import { useDashboardInboxKeyboardShortcuts } from "./use-dashboard-inbox-keyboard-shortcuts";
import { useDashboardPresenceHeartbeat } from "./use-dashboard-presence-heartbeat";
import { useDashboardState } from "./use-dashboard-state";

const SEARCH_INPUT_ID = "dashboard-inbox-search";

export function DashboardClient(props: DashboardClientProps) {
  const dashboardNavigation = useDashboardNavigation();
  const state = useDashboardState(props);
  const initialWidgetInstalled = props.initialSites.some((site) => isSiteWidgetInstalled(site));
  const widgetSiteIds = props.initialSites.map((site) => site.id);
  const teamName = displayNameFromEmail(props.userEmail);
  const teamInitials = initialsFromLabel(teamName);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [commandQuery, setCommandQuery] = useState("");
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showSidebarDrawer, setShowSidebarDrawer] = useState(false);
  const [showMobileList, setShowMobileList] = useState(!state.activeConversation);
  const [keyboardConversationId, setKeyboardConversationId] = useState<string | null>(state.activeConversation?.id ?? state.filteredConversations[0]?.id ?? null);

  useDashboardPresenceHeartbeat();

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

  function closeCommandPalette() {
    setShowCommandPalette(false);
  }

  function navigateFromPalette(path: string) {
    closeCommandPalette();
    dashboardNavigation?.navigate(path);
  }

  function toggleConversationStatus() {
    void state.handleConversationStatusChange(state.activeConversation?.status === "open" ? "resolved" : "open");
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

  const commandOptions = buildDashboardCommandOptions({
    activeConversation: state.activeConversation,
    onFocusSearch: () => {
      focusSearch();
      closeCommandPalette();
    },
    onOpenWidgetSettings: () => navigateFromPalette("/dashboard/widget"),
    onOpenVisitors: () => navigateFromPalette("/dashboard/visitors"),
    onOpenSettings: () => navigateFromPalette("/dashboard/settings"),
    onToggleConversationStatus: () => {
      closeCommandPalette();
      toggleConversationStatus();
    }
  });
  const visibleCommandOptions = filterDashboardCommandOptions(commandOptions, commandQuery);

  useDashboardInboxKeyboardShortcuts({
    keyboardConversationId,
    showCommandPalette,
    showShortcuts,
    showSidebarDrawer,
    activeConversation: state.activeConversation,
    filteredConversations: state.filteredConversations,
    setKeyboardConversationId,
    setShowCommandPalette,
    setShowShortcuts,
    setShowSidebarDrawer,
    setCommandQuery,
    focusSearch,
    openConversation,
    clearConversationSelection,
    toggleConversationStatus
  });

  return (
    <div className="relative h-full min-h-0">
      {renderDashboardClientPanels({
        state,
        initialWidgetInstalled,
        widgetSiteIds,
        keyboardConversationId,
        teamName,
        teamInitials,
        showMobileList,
        showSidebarDrawer,
        searchInputId: SEARCH_INPUT_ID,
        openConversation,
        clearConversationSelection,
        setShowSidebarDrawer
      })}
      {renderDashboardCommandPalette({ showCommandPalette, commandQuery, visibleCommandOptions, setShowCommandPalette, setCommandQuery })}
      {renderDashboardShortcutsDialog({ showShortcuts, setShowShortcuts })}
    </div>
  );
}
