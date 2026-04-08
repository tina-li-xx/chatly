import {
  type AnalyticsAiAssistActivityFilters,
  type AnalyticsAiAssistActivityCursor
} from "@/lib/data/analytics-ai-assist-activity-query";
import {
  resolveAiAssistActivityFilters,
} from "@/lib/data/analytics-ai-assist-activity-filters";
import {
  dashboardAiAssistActorLabel
} from "@/lib/data/settings-ai-assist-activity-map";
import {
  getAiAssistActivitySliceForWorkspace,
  type AnalyticsAiAssistActivityPageSlice
} from "@/lib/data/analytics-ai-assist-activity-slice";
import {
  hasWorkspaceAiAssistActivity,
  listWorkspaceAiAssistActivityMembers
} from "@/lib/repositories/ai-assist-activity-page-repository";
import { getWorkspaceAccess } from "@/lib/workspace-access";

type WorkspaceRole = "owner" | "admin" | "member";

export type AnalyticsAiAssistActivityMember = {
  id: string;
  label: string;
};

export type AnalyticsAiAssistActivityPageData =
  AnalyticsAiAssistActivityPageSlice & {
    members: AnalyticsAiAssistActivityMember[];
    filters: AnalyticsAiAssistActivityFilters;
    hasAnyActivity: boolean;
  };

export type {
  AnalyticsAiAssistActivityCursor,
  AnalyticsAiAssistActivityPageSlice
};

export async function getAnalyticsAiAssistActivityPageData(
  userId: string,
  filtersInput?: Parameters<typeof resolveAiAssistActivityFilters>[0],
  access?: {
    ownerUserId: string;
    viewerRole: WorkspaceRole;
  }
): Promise<AnalyticsAiAssistActivityPageData> {
  const workspace = access
    ? { ownerUserId: access.ownerUserId, role: access.viewerRole }
    : await getWorkspaceAccess(userId);
  const filters = resolveAiAssistActivityFilters(filtersInput ?? {});
  const [slice, memberRows, firstActivityRow] = await Promise.all([
    getAiAssistActivitySliceForWorkspace({
      ownerUserId: workspace.ownerUserId,
      viewerUserId: userId,
      viewerRole: workspace.role,
      filters
    }),
    listWorkspaceAiAssistActivityMembers({
      ownerUserId: workspace.ownerUserId,
      actorUserId: workspace.role === "member" ? userId : null
    }),
    hasWorkspaceAiAssistActivity({
      ownerUserId: workspace.ownerUserId,
      actorUserId: workspace.role === "member" ? userId : null
    })
  ]);

  return {
    ...slice,
    members: memberRows
      .map((member) => ({
        id: member.actor_user_id,
        label: dashboardAiAssistActorLabel(member.actor_email)
      }))
      .sort((left, right) => left.label.localeCompare(right.label)),
    filters,
    hasAnyActivity: firstActivityRow
  };
}
