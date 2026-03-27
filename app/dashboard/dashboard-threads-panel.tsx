"use client";

import type { ConversationSummary } from "@/lib/types";
import { displayNameFromEmail, initialsFromLabel } from "@/lib/user-display";
import { classNames, formatRelativeTime, truncate } from "@/lib/utils";
import { DashboardLink } from "./dashboard-shell";
import { CheckIcon, SearchIcon, XIcon, pageLabelFromUrl } from "./dashboard-ui";

const THREAD_FILTERS = [
  { id: "all", label: "All" },
  { id: "open", label: "Open" },
  { id: "resolved", label: "Resolved" }
] as const;

function locationLabel(conversation: ConversationSummary) {
  return [conversation.city, conversation.region, conversation.country].filter(Boolean).join(", ") || null;
}

function conversationLabel(conversation: ConversationSummary) {
  if (conversation.email) {
    return displayNameFromEmail(conversation.email);
  }

  return "Visitor";
}

function conversationSecondaryLabel(conversation: ConversationSummary) {
  if (conversation.email) {
    return conversation.email;
  }

  return conversation.siteName;
}

export function DashboardThreadsPanel({
  allConversations,
  conversations,
  activeConversationId,
  highlightedConversationId,
  threadFilter,
  searchQuery,
  searchInputId,
  onThreadFilterChange,
  onSearchQueryChange,
  onClearSearch,
  onSelectConversation,
  className
}: {
  allConversations: ConversationSummary[];
  conversations: ConversationSummary[];
  activeConversationId?: string;
  highlightedConversationId?: string | null;
  threadFilter: "all" | "open" | "resolved";
  searchQuery: string;
  searchInputId?: string;
  onThreadFilterChange: (value: "all" | "open" | "resolved") => void;
  onSearchQueryChange: (value: string) => void;
  onClearSearch?: () => void;
  onSelectConversation?: (conversationId: string) => void;
  className?: string;
}) {
  const counts = {
    all: allConversations.length,
    open: allConversations.filter((conversation) => conversation.status === "open").length,
    resolved: allConversations.filter((conversation) => conversation.status === "resolved").length
  };

  const isSearching = searchQuery.trim().length > 0 || threadFilter !== "all";
  const showEmptyList = allConversations.length === 0;
  const showEmptySearch = !showEmptyList && conversations.length === 0;

  return (
    <aside
      className={classNames(
        "flex h-full min-h-0 flex-col border-b border-slate-200 bg-white lg:border-b-0 lg:border-r",
        className
      )}
    >
      <div className="border-b border-slate-200 p-4">
        <div className="space-y-1">
          {THREAD_FILTERS.map((filter) => {
            const active = filter.id === threadFilter;
            const count = counts[filter.id];

            return (
              <button
                key={filter.id}
                type="button"
                onClick={() => onThreadFilterChange(filter.id)}
                className={classNames(
                  "flex h-10 w-full items-center justify-between rounded-lg px-3 text-sm transition",
                  active ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-50 hover:text-slate-700"
                )}
              >
                <span className="flex items-center gap-3">
                  {filter.id === "open" ? (
                    <span className="h-2 w-2 rounded-full bg-blue-600" />
                  ) : filter.id === "resolved" ? (
                    <CheckIcon className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <span className="w-4" />
                  )}
                  <span className={classNames("text-sm", active ? "font-medium" : "font-normal")}>{filter.label}</span>
                </span>
                <span className="text-[13px] text-slate-500">{count}</span>
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
            <button
              type="button"
              onClick={onClearSearch}
              aria-label="Clear search"
              className="inline-flex h-5 w-5 items-center justify-center rounded text-slate-400 transition hover:bg-slate-200 hover:text-slate-600"
            >
              <XIcon className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </label>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {showEmptyList ? (
          <div className="flex h-full min-h-[320px] flex-col items-center justify-center rounded-lg px-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-300">
              <SearchIcon className="h-7 w-7" />
            </div>
            <h3 className="mt-5 text-base font-medium text-slate-700">No conversations yet</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              When visitors start chatting on your site, they&apos;ll appear here.
            </p>
            <DashboardLink
              href="/dashboard/widget"
              className="mt-5 inline-flex items-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              Install widget
            </DashboardLink>
          </div>
        ) : showEmptySearch ? (
          <div className="flex h-full min-h-[320px] flex-col items-center justify-center rounded-lg px-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-300">
              <SearchIcon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-base font-medium text-slate-600">No conversations found</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {conversations.map((conversation) => {
              const isActive = conversation.id === activeConversationId;
              const isKeyboardHighlighted = conversation.id === highlightedConversationId && !isActive;
              const isUnread = conversation.unreadCount > 0;
              const isResolved = conversation.status === "resolved";
              const name = conversationLabel(conversation);
              const secondary = conversationSecondaryLabel(conversation);
              const initials = initialsFromLabel(name);
              const location = locationLabel(conversation);

              return (
                <DashboardLink
                  key={conversation.id}
                  href={`/dashboard/inbox?id=${conversation.id}`}
                  onClick={(event) => {
                    if (
                      !onSelectConversation ||
                      event.metaKey ||
                      event.ctrlKey ||
                      event.shiftKey ||
                      event.altKey ||
                      event.button !== 0
                    ) {
                      return;
                    }

                    event.preventDefault();
                    onSelectConversation(conversation.id);
                  }}
                  className={classNames(
                    "relative block rounded-lg border border-transparent px-2.5 py-2.5 transition",
                    isResolved && !isActive && "opacity-80",
                    isActive
                      ? "border-blue-200 bg-white before:absolute before:bottom-2 before:left-0 before:top-2 before:w-[3px] before:rounded-full before:bg-blue-600 before:content-['']"
                      : isKeyboardHighlighted
                        ? "border-slate-200 bg-slate-50"
                      : isUnread
                        ? "bg-blue-50 hover:bg-blue-50/80"
                        : "hover:bg-slate-50"
                  )}
                >
                  <div className="flex gap-2.5">
                    <div
                      className={classNames(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[13px] font-medium",
                        isUnread
                          ? "bg-blue-100 text-blue-600"
                          : isResolved
                            ? "bg-slate-100 text-slate-500"
                            : "bg-slate-100 text-slate-600"
                      )}
                    >
                      {isResolved ? <CheckIcon className="h-4 w-4" /> : initials}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p
                            className={classNames(
                              "truncate text-sm",
                              isUnread ? "font-semibold text-slate-900" : "font-normal text-slate-700"
                            )}
                          >
                            {name}
                          </p>
                          <p className="truncate text-xs font-normal leading-5 text-slate-400">{secondary}</p>
                        </div>
                        <span className="shrink-0 pt-0.5 text-xs font-normal leading-5 text-slate-400">
                          {conversation.lastMessageAt
                            ? formatRelativeTime(conversation.lastMessageAt)
                            : formatRelativeTime(conversation.updatedAt)}
                        </span>
                      </div>

                      <div className="mt-1 flex items-center text-[13px] leading-5">
                        {isUnread ? <span className="mr-1.5 h-2 w-2 rounded-full bg-blue-600" /> : null}
                        <p
                          className={classNames(
                            "truncate",
                            isUnread ? "font-medium text-slate-700" : "font-normal text-slate-500"
                          )}
                        >
                          {truncate(conversation.lastMessagePreview || "No messages yet", 48)}
                        </p>
                      </div>

                      <div className="mt-1.5 flex items-center gap-1.5 text-[11px] leading-4 text-slate-400">
                        <span className="rounded bg-slate-100 px-1.5 py-0.5">{pageLabelFromUrl(conversation.pageUrl)}</span>
                        {location ? (
                          <>
                            <span>&bull;</span>
                            <span className="truncate">{location}</span>
                          </>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </DashboardLink>
              );
            })}
          </div>
        )}
      </div>

      {isSearching && !showEmptyList ? (
        <div className="border-t border-slate-200 px-4 py-3 text-xs text-slate-400">
          Showing {conversations.length} of {allConversations.length} conversations
        </div>
      ) : null}
    </aside>
  );
}
