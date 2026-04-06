import {
  AI_ACTIVITY_PAGE_SIZE,
  type AnalyticsAiAssistActivityFilters
} from "@/lib/data/analytics-ai-assist-activity-filters";
import {
  resolveAiAssistActivityQuery,
  type AnalyticsAiAssistActivityCursor,
  type AnalyticsAiAssistActivityViewerRole
} from "@/lib/data/analytics-ai-assist-activity-query";
import {
  mapWorkspaceAiAssistActivityRow
} from "@/lib/data/settings-ai-assist-activity-map";
import type { DashboardAiAssistUsageActivity } from "@/lib/data/settings-ai-assist-usage";
import {
  listWorkspaceAiAssistFilteredActivityRows
} from "@/lib/repositories/ai-assist-activity-page-repository";

export type AnalyticsAiAssistActivityPageSlice = {
  activity: DashboardAiAssistUsageActivity[];
  hasMore: boolean;
  nextCursor: AnalyticsAiAssistActivityCursor | null;
};

function toCursor(activity: DashboardAiAssistUsageActivity[]) {
  const last = activity.at(-1);
  return last ? { createdAt: last.createdAt, id: last.id } : null;
}

export async function getAiAssistActivitySliceForWorkspace(input: {
  ownerUserId: string;
  viewerUserId: string;
  viewerRole: AnalyticsAiAssistActivityViewerRole;
  filters: AnalyticsAiAssistActivityFilters;
  cursor?: AnalyticsAiAssistActivityCursor | null;
}): Promise<AnalyticsAiAssistActivityPageSlice> {
  const activityQuery = resolveAiAssistActivityQuery(input);
  const rows = await listWorkspaceAiAssistFilteredActivityRows({
    ownerUserId: input.ownerUserId,
    actorUserId: activityQuery.actorUserId,
    feature: activityQuery.feature,
    rangeStart: activityQuery.rangeStart,
    rangeEnd: activityQuery.rangeEnd,
    cursorCreatedAt: activityQuery.cursorCreatedAt,
    cursorId: activityQuery.cursorId,
    limit: AI_ACTIVITY_PAGE_SIZE + 1
  });
  const activity = rows
    .slice(0, AI_ACTIVITY_PAGE_SIZE)
    .map(mapWorkspaceAiAssistActivityRow);

  return {
    activity,
    hasMore: rows.length > AI_ACTIVITY_PAGE_SIZE,
    nextCursor: rows.length > AI_ACTIVITY_PAGE_SIZE ? toCursor(activity) : null
  };
}
