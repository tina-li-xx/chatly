import {
  buildAiAssistActivityRange,
  resolveAiAssistActivityFilters,
  type AnalyticsAiAssistActivityFilters
} from "@/lib/data/analytics-ai-assist-activity-filters";
import type { DashboardAiAssistFeature } from "@/lib/data/settings-ai-assist-usage";

export type { AnalyticsAiAssistActivityFilters };

export type AnalyticsAiAssistActivityCursor = {
  createdAt: string;
  id: string;
};

export type AnalyticsAiAssistActivityViewerRole = "owner" | "admin" | "member";

export function resolveAiAssistActivityFiltersFromSearchParams(
  searchParams: Pick<URLSearchParams, "get">
): AnalyticsAiAssistActivityFilters {
  return resolveAiAssistActivityFilters({
    type: searchParams.get("type"),
    member: searchParams.get("member"),
    date: searchParams.get("date"),
    start: searchParams.get("start"),
    end: searchParams.get("end")
  });
}

export function resolveAiAssistActivityCursorFromSearchParams(
  searchParams: Pick<URLSearchParams, "get">
): AnalyticsAiAssistActivityCursor | null {
  const createdAt = searchParams.get("cursorCreatedAt");
  const id = searchParams.get("cursorId");
  return createdAt && id ? { createdAt, id } : null;
}

export function resolveAiAssistActivityQuery(input: {
  viewerUserId: string;
  viewerRole: AnalyticsAiAssistActivityViewerRole;
  filters: AnalyticsAiAssistActivityFilters;
  cursor?: AnalyticsAiAssistActivityCursor | null;
}) {
  const range = buildAiAssistActivityRange(input.filters);

  return {
    actorUserId:
      input.viewerRole === "member"
        ? input.viewerUserId
        : input.filters.memberId === "all"
          ? null
          : input.filters.memberId,
    feature:
      input.filters.type === "all"
        ? null
        : (input.filters.type as DashboardAiAssistFeature),
    rangeStart: range.start,
    rangeEnd: range.end,
    cursorCreatedAt: input.cursor?.createdAt ?? null,
    cursorId: input.cursor?.id ?? null
  };
}
