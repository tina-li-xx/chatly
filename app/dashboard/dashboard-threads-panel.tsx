"use client";

import { classNames } from "@/lib/utils";
import {
  getThreadCounts,
  renderThreadsHeader,
  renderThreadsSummary,
  type DashboardThreadsPanelProps
} from "./dashboard-threads-panel-header";
import { renderThreadsBody } from "./dashboard-threads-panel-body";
import { useWidgetInstallState } from "./use-widget-install-state";

export function DashboardThreadsPanel(props: DashboardThreadsPanelProps) {
  const counts = getThreadCounts(props.allConversations);
  const isSearching = props.searchQuery.trim().length > 0 || props.threadFilter !== "all";
  const showEmptyList = props.allConversations.length === 0;
  const showEmptySearch = !showEmptyList && props.conversations.length === 0;
  const widgetInstalled = useWidgetInstallState(props.initialWidgetInstalled, props.widgetSiteIds);

  return (
    <aside className={classNames("flex h-full min-h-0 flex-col border-b border-slate-200 bg-white lg:border-b-0 lg:border-r", props.className)}>
      {renderThreadsHeader({
        counts,
        threadFilter: props.threadFilter,
        searchQuery: props.searchQuery,
        searchInputId: props.searchInputId,
        onThreadFilterChange: props.onThreadFilterChange,
        onSearchQueryChange: props.onSearchQueryChange,
        onClearSearch: props.onClearSearch
      })}
      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {renderThreadsBody({
          conversations: props.conversations,
          activeConversationId: props.activeConversationId,
          highlightedConversationId: props.highlightedConversationId,
          onSelectConversation: props.onSelectConversation,
          widgetInstalled,
          showEmptyList,
          showEmptySearch
        })}
      </div>
      {renderThreadsSummary({
        isSearching,
        showEmptyList,
        conversations: props.conversations,
        allConversations: props.allConversations
      })}
    </aside>
  );
}
