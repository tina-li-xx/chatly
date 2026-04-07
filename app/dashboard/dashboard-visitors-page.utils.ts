"use client";

import { formatRelativeTime } from "@/lib/utils";
import { formatDuration, type VisitorFilterState, type VisitorRecord, type VisitorsPrimaryFilter, type VisitorsSourceFilter, type VisitorsTimeRange } from "./visitors-data";

export function withinTimeRange(value: string, range: VisitorsTimeRange) {
  if (range === "all") {
    return true;
  }

  const ageMs = Date.now() - new Date(value).getTime();
  const limits = {
    "24h": 24 * 60 * 60 * 1000,
    "7d": 7 * 24 * 60 * 60 * 1000,
    "30d": 30 * 24 * 60 * 60 * 1000
  };

  return ageMs <= limits[range];
}

function matchesVisitCount(count: number, filter: VisitorFilterState["visitCount"]) {
  if (filter === "all") {
    return true;
  }

  if (filter === "first") {
    return count === 1;
  }

  if (filter === "2-5") {
    return count >= 2 && count <= 5;
  }

  return count >= 5;
}

function matchesTimeOnSite(seconds: number, filter: VisitorFilterState["timeOnSite"]) {
  if (filter === "all") {
    return true;
  }

  if (filter === "<1") {
    return seconds < 60;
  }

  if (filter === "1-5") {
    return seconds >= 60 && seconds < 5 * 60;
  }

  return seconds >= 5 * 60;
}

function matchesSource(source: VisitorsSourceFilter, filter: VisitorsSourceFilter) {
  return filter === "all" || source === filter;
}

export function sortVisitors(visitors: VisitorRecord[], sortKey: string, sortDirection: "asc" | "desc") {
  const sorted = [...visitors].sort((a, b) => {
    const multiplier = sortDirection === "asc" ? 1 : -1;

    switch (sortKey) {
      case "visitor":
        return a.name.localeCompare(b.name) * multiplier;
      case "location":
        return (a.location || "").localeCompare(b.location || "") * multiplier;
      case "page":
        return a.currentPage.localeCompare(b.currentPage) * multiplier;
      case "source":
        return a.source.localeCompare(b.source) * multiplier;
      case "timeOnSite":
        return (a.timeOnSiteSeconds - b.timeOnSiteSeconds) * multiplier;
      case "lastSeen":
      default:
        return (new Date(a.lastSeenAt).getTime() - new Date(b.lastSeenAt).getTime()) * multiplier;
    }
  });

  return sorted;
}

export function filterVisitors(
  visitors: VisitorRecord[],
  searchQuery: string,
  primaryFilter: VisitorsPrimaryFilter,
  timeRange: VisitorsTimeRange,
  filters: VisitorFilterState
) {
  const needle = searchQuery.trim().toLowerCase();

  return visitors.filter((visitor) => {
    if (!withinTimeRange(visitor.lastSeenAt, timeRange)) {
      return false;
    }

    if (primaryFilter === "online" && !visitor.online) {
      return false;
    }

    if (primaryFilter === "returned" && !visitor.returnedVisitor) {
      return false;
    }

    if (primaryFilter === "new" && !visitor.newVisitor) {
      return false;
    }

    if (filters.status === "online" && !visitor.online) {
      return false;
    }

    if (filters.status === "offline" && visitor.online) {
      return false;
    }

    if (filters.locationQuery.trim()) {
      const location = (visitor.location || "").toLowerCase();
      if (!location.includes(filters.locationQuery.trim().toLowerCase())) {
        return false;
      }
    }

    if (!matchesSource(visitor.sourceCategory, filters.source)) {
      return false;
    }

    if (filters.pageQuery.trim() && !visitor.currentPage.toLowerCase().includes(filters.pageQuery.trim().toLowerCase())) {
      return false;
    }

    if (!matchesVisitCount(visitor.conversationCount, filters.visitCount)) {
      return false;
    }

    if (!matchesTimeOnSite(visitor.timeOnSiteSeconds, filters.timeOnSite)) {
      return false;
    }

    if (filters.hasEmail === "yes" && !visitor.hasEmail) {
      return false;
    }

    if (filters.hasEmail === "no" && visitor.hasEmail) {
      return false;
    }

    if (filters.hasConversation === "yes" && !visitor.hasConversation) {
      return false;
    }

    if (filters.hasConversation === "no" && visitor.hasConversation) {
      return false;
    }

    if (!needle) {
      return true;
    }

    return [
      visitor.name,
      visitor.email || "",
      visitor.location || "",
      visitor.currentPage,
      visitor.source,
      visitor.browser
    ]
      .join(" ")
      .toLowerCase()
      .includes(needle);
  });
}

export function exportVisitors(visitors: VisitorRecord[]) {
  const header = ["Visitor", "Email", "Location", "Page", "Source", "Time on site", "Last seen"];
  const rows = visitors.map((visitor) => [
    visitor.name,
    visitor.email || "",
    visitor.location || "",
    visitor.currentPage,
    visitor.source,
    formatDuration(visitor.timeOnSiteSeconds),
    visitor.online ? "Online" : formatRelativeTime(visitor.lastSeenAt)
  ]);

  const csv = [header, ...rows]
    .map((row) => row.map((value) => `"${String(value).replace(/"/g, "\"\"")}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `chatting-visitors-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
