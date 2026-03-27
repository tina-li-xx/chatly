"use client";

import { useEffect, useState } from "react";
import type { ConversationSummary } from "@/lib/types";
import { classNames } from "@/lib/utils";
import { useDashboardNavigation } from "./dashboard-shell";
import {
  buildVisitorRecords,
  DEFAULT_VISITOR_FILTERS,
  formatDuration,
  type VisitorFilterState,
  type VisitorRecord,
  type VisitorsPrimaryFilter,
  type VisitorsSourceFilter,
  type VisitorsTimeRange,
  VISITORS_PAGE_SIZE
} from "./visitors-data";
import {
  LiveVisitorsSection,
  RecentVisitorsSection,
  VisitorDetailsDrawer,
  VisitorsFiltersPanel,
  VisitorsToolbar
} from "./dashboard-visitors-page-sections";
import { exportVisitors, filterVisitors, sortVisitors, withinTimeRange } from "./dashboard-visitors-page.utils";

type DashboardVisitorsPageProps = {
  initialConversations: ConversationSummary[];
};

export function DashboardVisitorsPage({ initialConversations }: DashboardVisitorsPageProps) {
  const dashboardNavigation = useDashboardNavigation();
  const [conversations, setConversations] = useState(initialConversations);
  const [searchQuery, setSearchQuery] = useState("");
  const [primaryFilter, setPrimaryFilter] = useState<VisitorsPrimaryFilter>("all");
  const [timeRange, setTimeRange] = useState<VisitorsTimeRange>("7d");
  const [sortKey, setSortKey] = useState("lastSeen");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [selectedVisitorId, setSelectedVisitorId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<VisitorFilterState>(DEFAULT_VISITOR_FILTERS);
  const [draftFilters, setDraftFilters] = useState<VisitorFilterState>(DEFAULT_VISITOR_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);

  async function refreshVisitors(manual = false) {
    if (manual) {
      setRefreshing(true);
    }

    try {
      const response = await fetch("/dashboard/conversations", {
        method: "GET",
        cache: "no-store"
      });

      if (!response.ok) {
        return;
      }

      const payload = (await response.json()) as { ok: true; conversations: ConversationSummary[] };
      setConversations(payload.conversations);
    } catch (error) {
      // Keep the current UI steady if a refresh misses.
    } finally {
      if (manual) {
        setRefreshing(false);
      }
    }
  }

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      void refreshVisitors();
    }, 30000);

    return () => window.clearInterval(intervalId);
  }, []);

  const visitors = buildVisitorRecords(conversations);
  const filteredVisitors = sortVisitors(
    filterVisitors(visitors, searchQuery, primaryFilter, timeRange, filters),
    sortKey,
    sortDirection
  );
  const liveVisitors = visitors
    .filter((visitor) => visitor.online && withinTimeRange(visitor.lastSeenAt, timeRange))
    .slice(0, 6);
  const pageCount = Math.max(1, Math.ceil(filteredVisitors.length / VISITORS_PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, pageCount);
  const paginatedVisitors = filteredVisitors.slice(
    (safeCurrentPage - 1) * VISITORS_PAGE_SIZE,
    safeCurrentPage * VISITORS_PAGE_SIZE
  );
  const selectedVisitor = selectedVisitorId
    ? visitors.find((visitor) => visitor.id === selectedVisitorId) ?? null
    : null;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, primaryFilter, timeRange, filters]);

  useEffect(() => {
    if (!selectedVisitorId) {
      return;
    }

    if (!visitors.some((visitor) => visitor.id === selectedVisitorId)) {
      setSelectedVisitorId(null);
    }
  }, [selectedVisitorId, visitors]);

  function toggleSort(nextKey: string) {
    if (sortKey === nextKey) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(nextKey);
    setSortDirection(nextKey === "visitor" ? "asc" : "desc");
  }

  function openConversation(visitor: VisitorRecord) {
    dashboardNavigation?.navigate(`/dashboard/inbox?id=${visitor.latestConversationId}`);
  }

  function applyFilters() {
    setFilters(draftFilters);
    setShowFilters(false);
  }

  function clearFilters() {
    setDraftFilters(DEFAULT_VISITOR_FILTERS);
    setFilters(DEFAULT_VISITOR_FILTERS);
  }

  const filtersActive =
    Boolean(searchQuery) ||
    primaryFilter !== "all" ||
    JSON.stringify(filters) !== JSON.stringify(DEFAULT_VISITOR_FILTERS);

  return (
    <div className="space-y-6">
      <VisitorsToolbar
        searchQuery={searchQuery}
        primaryFilter={primaryFilter}
        timeRange={timeRange}
        setSearchQuery={setSearchQuery}
        setPrimaryFilter={setPrimaryFilter}
        setTimeRange={setTimeRange}
        onToggleFilters={() => {
          setDraftFilters(filters);
          setShowFilters((current) => !current);
        }}
      />

      <VisitorsFiltersPanel
        visible={showFilters}
        draftFilters={draftFilters}
        setDraftFilters={setDraftFilters}
        clearFilters={clearFilters}
        applyFilters={applyFilters}
      />

      <LiveVisitorsSection
        liveVisitors={liveVisitors}
        refreshing={refreshing}
        onRefresh={() => void refreshVisitors(true)}
        onOpenConversation={openConversation}
        onSelectVisitor={setSelectedVisitorId}
      />

      <RecentVisitorsSection
        filteredVisitors={filteredVisitors}
        paginatedVisitors={paginatedVisitors}
        sortKey={sortKey}
        sortDirection={sortDirection}
        refreshingFilters={filtersActive}
        safeCurrentPage={safeCurrentPage}
        pageCount={pageCount}
        currentPage={safeCurrentPage}
        onExport={() => exportVisitors(filteredVisitors)}
        onToggleSort={toggleSort}
        onOpenConversation={openConversation}
        onSelectVisitor={setSelectedVisitorId}
        setCurrentPage={setCurrentPage}
      />

      <VisitorDetailsDrawer
        visitor={selectedVisitor}
        onClose={() => setSelectedVisitorId(null)}
        onOpenConversation={() => selectedVisitor && openConversation(selectedVisitor)}
        onNavigateVisit={(conversationId) => dashboardNavigation?.navigate(`/dashboard/inbox?id=${conversationId}`)}
      />
    </div>
  );
}
