"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { ConversationSummary, VisitorPresenceSession } from "@/lib/types";
import { DashboardContactsPanel } from "./dashboard-contacts-panel";
import {
  DashboardPeopleTabs,
  type DashboardPeopleTab
} from "./dashboard-people-tabs";
import { useDashboardNavigation } from "./dashboard-shell";
import {
  buildVisitorRecords,
  DEFAULT_VISITOR_FILTERS,
  type VisitorFilterState,
  type VisitorRecord,
  type VisitorsPrimaryFilter,
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
import { useDashboardVisitorsData } from "./use-dashboard-visitors-data";
import { exportVisitors, filterVisitors, sortVisitors, withinTimeRange } from "./dashboard-visitors-page.utils";

export function DashboardVisitorsPage({
  initialConversations,
  initialLiveSessions
}: {
  initialConversations: ConversationSummary[];
  initialLiveSessions: VisitorPresenceSession[];
}) {
  const searchParams = useSearchParams();
  const dashboardNavigation = useDashboardNavigation();
  const { conversations, liveSessions, loadVisitorDetails, refreshing, refreshVisitors } = useDashboardVisitorsData({
    initialConversations,
    initialLiveSessions
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [primaryFilter, setPrimaryFilter] = useState<VisitorsPrimaryFilter>("all");
  const [timeRange, setTimeRange] = useState<VisitorsTimeRange>("7d");
  const [sortKey, setSortKey] = useState("lastSeen");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [selectedVisitorId, setSelectedVisitorId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<VisitorFilterState>(DEFAULT_VISITOR_FILTERS);
  const [draftFilters, setDraftFilters] = useState<VisitorFilterState>(DEFAULT_VISITOR_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);
  const requestedTab = searchParams.get("tab") === "contacts" || searchParams.get("contact") ? "contacts" : "live";
  const [activeTab, setActiveTab] = useState<DashboardPeopleTab>(requestedTab);
  const deeplinkContactId = searchParams.get("contact");

  const visitors = buildVisitorRecords(conversations, liveSessions);
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
  const filtersActive =
    Boolean(searchQuery) ||
    primaryFilter !== "all" ||
    JSON.stringify(filters) !== JSON.stringify(DEFAULT_VISITOR_FILTERS);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, primaryFilter, timeRange, filters]);

  useEffect(() => {
    if (!selectedVisitorId) {
      return;
    }

    const selected = visitors.find((visitor) => visitor.id === selectedVisitorId);
    if (selected) {
      void loadVisitorDetails(selected);
    }

    if (!visitors.some((visitor) => visitor.id === selectedVisitorId)) {
      setSelectedVisitorId(null);
    }
  }, [loadVisitorDetails, selectedVisitorId, visitors]);

  useEffect(() => {
    setActiveTab(requestedTab);
  }, [requestedTab]);

  function toggleSort(nextKey: string) {
    if (sortKey === nextKey) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(nextKey);
    setSortDirection(nextKey === "visitor" ? "asc" : "desc");
  }

  function openConversation(visitor: VisitorRecord) {
    if (!visitor.latestConversationId) {
      setSelectedVisitorId(visitor.id);
      return;
    }

    dashboardNavigation?.navigate(`/dashboard/inbox?id=${visitor.latestConversationId}`);
  }

  function navigateConversation(conversationId: string) {
    dashboardNavigation?.navigate(`/dashboard/inbox?id=${conversationId}`);
  }

  return (
    <div className="space-y-6">
      <DashboardPeopleTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === "live" ? (
        <>
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
            clearFilters={() => {
              setDraftFilters(DEFAULT_VISITOR_FILTERS);
              setFilters(DEFAULT_VISITOR_FILTERS);
            }}
            applyFilters={() => {
              setFilters(draftFilters);
              setShowFilters(false);
            }}
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
            onNavigateVisit={navigateConversation}
          />
        </>
      ) : (
        <DashboardContactsPanel
          deeplinkContactId={deeplinkContactId}
          onNavigateConversation={navigateConversation}
        />
      )}
    </div>
  );
}
