"use client";

import type { Dispatch, SetStateAction } from "react";
import { useEffect } from "react";
import type { DashboardState } from "./use-dashboard-state";

function isTypingTarget(target: EventTarget | null) {
  const element = target as HTMLElement | null;
  return !!element && (element.tagName === "INPUT" || element.tagName === "TEXTAREA" || element.tagName === "SELECT" || element.isContentEditable);
}

function nextHighlightedConversationId({
  filteredConversations,
  keyboardConversationId,
  direction
}: {
  filteredConversations: DashboardState["filteredConversations"];
  keyboardConversationId: string | null;
  direction: 1 | -1;
}) {
  const currentIndex = Math.max(0, filteredConversations.findIndex((conversation) => conversation.id === keyboardConversationId));
  const nextIndex = Math.min(filteredConversations.length - 1, Math.max(0, currentIndex + direction));
  return filteredConversations[nextIndex]?.id ?? null;
}

export function useDashboardInboxKeyboardShortcuts({
  keyboardConversationId,
  showCommandPalette,
  showShortcuts,
  showSidebarDrawer,
  activeConversation,
  filteredConversations,
  setKeyboardConversationId,
  setShowCommandPalette,
  setShowShortcuts,
  setShowSidebarDrawer,
  setCommandQuery,
  focusSearch,
  openConversation,
  clearConversationSelection,
  toggleConversationStatus
}: {
  keyboardConversationId: string | null;
  showCommandPalette: boolean;
  showShortcuts: boolean;
  showSidebarDrawer: boolean;
  activeConversation: DashboardState["activeConversation"];
  filteredConversations: DashboardState["filteredConversations"];
  setKeyboardConversationId: Dispatch<SetStateAction<string | null>>;
  setShowCommandPalette: (value: boolean) => void;
  setShowShortcuts: (value: boolean) => void;
  setShowSidebarDrawer: (value: boolean) => void;
  setCommandQuery: (value: string) => void;
  focusSearch: () => void;
  openConversation: (conversationId: string) => void;
  clearConversationSelection: () => void;
  toggleConversationStatus: () => void;
}) {
  useEffect(() => {
    const openCommandPalette = () => {
      setShowShortcuts(false);
      setCommandQuery("");
      setShowCommandPalette(true);
    };

    const openShortcutsDialog = () => {
      setShowCommandPalette(false);
      setShowShortcuts(true);
    };

    const closeActiveOverlay = () => {
      if (showCommandPalette) {
        setShowCommandPalette(false);
        return true;
      }

      if (showShortcuts) {
        setShowShortcuts(false);
        return true;
      }

      if (showSidebarDrawer) {
        setShowSidebarDrawer(false);
        return true;
      }

      return false;
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        openCommandPalette();
        return;
      }

      if ((event.metaKey || event.ctrlKey) && event.key === "/") {
        event.preventDefault();
        openShortcutsDialog();
        return;
      }

      if (event.key === "Escape") {
        if (closeActiveOverlay()) {
          return;
        }

        if (activeConversation) {
          event.preventDefault();
          clearConversationSelection();
        }
        return;
      }

      if (isTypingTarget(event.target)) {
        return;
      }

      if ((event.key === "ArrowDown" || event.key === "ArrowUp") && filteredConversations.length) {
        event.preventDefault();
        setKeyboardConversationId(
          nextHighlightedConversationId({
            filteredConversations,
            keyboardConversationId,
            direction: event.key === "ArrowDown" ? 1 : -1
          })
        );
        return;
      }

      if (event.key === "Enter" && keyboardConversationId) {
        event.preventDefault();
        openConversation(keyboardConversationId);
        return;
      }

      if (event.key.toLowerCase() === "r" && activeConversation) {
        event.preventDefault();
        toggleConversationStatus();
        return;
      }

      if (event.key.toLowerCase() === "n") {
        event.preventDefault();
        focusSearch();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    activeConversation,
    clearConversationSelection,
    filteredConversations,
    focusSearch,
    keyboardConversationId,
    openConversation,
    setCommandQuery,
    setKeyboardConversationId,
    setShowCommandPalette,
    setShowShortcuts,
    setShowSidebarDrawer,
    showCommandPalette,
    showShortcuts,
    showSidebarDrawer,
    toggleConversationStatus
  ]);
}
