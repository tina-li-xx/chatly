"use client";

import type { ConversationSummary } from "@/lib/types";
import { classNames } from "@/lib/utils";
import { CheckIcon, SearchIcon, XIcon } from "./dashboard-ui";
import type { ThreadFilter } from "./use-dashboard-state";

export type DashboardThreadsPanelProps = {
  allConversations: ConversationSummary[];
  conversations: ConversationSummary[];
  initialWidgetInstalled: boolean;
  widgetSiteIds: string[];
  activeConversationId?: string;
  highlightedConversationId?: string | null;
  threadFilter: ThreadFilter;
  searchQuery: string;
  searchInputId?: string;
  onThreadFilterChange: (value: ThreadFilter) => void;
  onSearchQueryChange: (value: string) => void;
  onClearSearch?: () => void;
  onSelectConversation?: (conversationId: string) => void;
  className?: string;
};

type ThreadCounts = Record<ThreadFilter, number>;

const THREAD_FILTERS: Array<{ id: ThreadFilter; label: string }> = [
  { id: "all", label: "All" },
  { id: "open", label: "Open" },
  { id: "resolved", label: "Resolved" }
];

export function getThreadCounts(allConversations: ConversationSummary[]): ThreadCounts {
  return allConversations.reduce<ThreadCounts>(
    (counts, conversation) => {
      counts.all += 1;
      counts[conversation.status] += 1;
      return counts;
    },
    { all: 0, open: 0, resolved: 0 }
  );
}

function renderThreadFilterIcon(filterId: ThreadFilter) {
  if (filterId === "open") {
    return <span className="h-2 w-2 rounded-full bg-blue-600" />;
  }

  if (filterId === "resolved") {
    return <CheckIcon className="h-4 w-4 text-emerald-500" />;
  }

  return <span className="w-4" />;
}

export function renderThreadsHeader({
  counts,
  threadFilter,
  searchQuery,
  searchInputId,
  onThreadFilterChange,
  onSearchQueryChange,
  onClearSearch
}: {
  counts: ThreadCounts;
  threadFilter: ThreadFilter;
  searchQuery: string;
  searchInputId?: string;
  onThreadFilterChange: (value: ThreadFilter) => void;
  onSearchQueryChange: (value: string) => void;
  onClearSearch?: () => void;
}) {
  return (
    <div className="border-b border-slate-200 p-4">
      <div className="space-y-1">
        {THREAD_FILTERS.map((filter) => {
          const active = filter.id === threadFilter;
          return (
            <button
              key={filter.id}
              type="button"
              onClick={() => onThreadFilterChange(filter.id)}
              className={classNames("flex h-10 w-full items-center justify-between rounded-lg px-3 text-sm transition", active ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-50 hover:text-slate-700")}
            >
              <span className="flex items-center gap-3">
                {renderThreadFilterIcon(filter.id)}
                <span className={classNames("text-sm", active ? "font-medium" : "font-normal")}>{filter.label}</span>
              </span>
              <span className="text-[13px] text-slate-500">{counts[filter.id]}</span>
            </button>
          );
        })}
      </div>

      <label className="mt-4 flex h-10 items-center gap-3 rounded-lg bg-slate-50 px-3 text-slate-400">
        <SearchIcon className="h-4 w-4" />
        <input
          id={searchInputId}
          type="search"
          value={searchQuery}
          onChange={(event) => onSearchQueryChange(event.currentTarget.value)}
          placeholder="Search conversations..."
          className="w-full border-0 bg-transparent p-0 text-sm text-slate-900 outline-none placeholder:text-slate-400"
        />
        {searchQuery ? (
          <button type="button" onClick={onClearSearch} aria-label="Clear search" className="inline-flex h-5 w-5 items-center justify-center rounded text-slate-400 transition hover:bg-slate-200 hover:text-slate-600">
            <XIcon className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </label>
    </div>
  );
}

export function renderThreadsSummary({
  isSearching,
  showEmptyList,
  conversations,
  allConversations
}: Pick<DashboardThreadsPanelProps, "conversations" | "allConversations"> & {
  isSearching: boolean;
  showEmptyList: boolean;
}) {
  if (!isSearching || showEmptyList) {
    return null;
  }

  return <div className="border-t border-slate-200 px-4 py-3 text-xs text-slate-400">Showing {conversations.length} of {allConversations.length} conversations</div>;
}
