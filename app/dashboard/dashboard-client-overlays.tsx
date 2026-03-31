"use client";

import type { ReactNode } from "react";
import type { ConversationThread } from "@/lib/types";
import { SearchIcon } from "./dashboard-ui";

export type DashboardCommandOption = {
  id: string;
  label: string;
  description: string;
  action: () => void;
};

const SHORTCUT_ROWS = [
  ["Ctrl/Cmd + K", "Open command palette"],
  ["Ctrl/Cmd + /", "Show keyboard shortcuts"],
  ["↑ / ↓", "Move between conversations"],
  ["Enter", "Open selected conversation"],
  ["Enter", "Send message in the reply box"],
  ["Escape", "Close panel or clear selection"],
  ["R", "Mark as resolved or reopen"],
  ["N", "Focus search"]
] as const;

function OverlayPanel({
  onClose,
  children
}: {
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center bg-slate-900/50 px-4 pt-[18vh]" onClick={onClose}>
      <div className="w-full max-w-[480px] overflow-hidden rounded-xl bg-white shadow-[0_20px_40px_rgba(0,0,0,0.15)]" onClick={(event) => event.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

export function buildDashboardCommandOptions({
  activeConversation,
  onFocusSearch,
  onOpenWidgetSettings,
  onOpenVisitors,
  onOpenSettings,
  onToggleConversationStatus
}: {
  activeConversation: ConversationThread | null;
  onFocusSearch: () => void;
  onOpenWidgetSettings: () => void;
  onOpenVisitors: () => void;
  onOpenSettings: () => void;
  onToggleConversationStatus: () => void;
}) {
  const commandOptions: DashboardCommandOption[] = [
    { id: "focus-search", label: "Focus search", description: "Jump to the conversation search box.", action: onFocusSearch },
    { id: "open-widget", label: "Open widget settings", description: "Review your widget install and branding settings.", action: onOpenWidgetSettings },
    { id: "open-visitors", label: "Open visitors", description: "Go to the visitors area.", action: onOpenVisitors },
    { id: "open-settings", label: "Open settings", description: "Manage workspace and account settings.", action: onOpenSettings }
  ];

  if (activeConversation) {
    commandOptions.push({
      id: "toggle-resolved",
      label: activeConversation.status === "open" ? "Mark conversation resolved" : "Reopen conversation",
      description: "Update the status of the active conversation.",
      action: onToggleConversationStatus
    });
  }

  return commandOptions;
}

export function filterDashboardCommandOptions(commandOptions: DashboardCommandOption[], commandQuery: string) {
  const needle = commandQuery.trim().toLowerCase();
  if (!needle) {
    return commandOptions;
  }

  return commandOptions.filter((option) => `${option.label} ${option.description}`.toLowerCase().includes(needle));
}

export function renderDashboardCommandPalette({
  showCommandPalette,
  commandQuery,
  visibleCommandOptions,
  setShowCommandPalette,
  setCommandQuery
}: {
  showCommandPalette: boolean;
  commandQuery: string;
  visibleCommandOptions: DashboardCommandOption[];
  setShowCommandPalette: (value: boolean) => void;
  setCommandQuery: (value: string) => void;
}) {
  if (!showCommandPalette) {
    return null;
  }

  return (
    <OverlayPanel onClose={() => setShowCommandPalette(false)}>
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
            <button key={option.id} type="button" onClick={option.action} className="block w-full rounded-lg px-3 py-3 text-left transition hover:bg-slate-50">
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
    </OverlayPanel>
  );
}

export function renderDashboardShortcutsDialog({
  showShortcuts,
  setShowShortcuts
}: {
  showShortcuts: boolean;
  setShowShortcuts: (value: boolean) => void;
}) {
  if (!showShortcuts) {
    return null;
  }

  return (
    <OverlayPanel onClose={() => setShowShortcuts(false)}>
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-base font-semibold text-slate-900">Keyboard shortcuts</h2>
      </div>
      <div className="space-y-3 px-5 py-4 text-sm text-slate-600">
        {SHORTCUT_ROWS.map(([shortcut, description]) => (
          <div key={shortcut} className="flex items-center justify-between gap-4">
            <span>{description}</span>
            <span className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-500">{shortcut}</span>
          </div>
        ))}
      </div>
    </OverlayPanel>
  );
}
