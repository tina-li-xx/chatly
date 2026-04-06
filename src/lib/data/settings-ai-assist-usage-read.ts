import "server-only";

import {
  resolveAiAssistWarningState
} from "@/lib/ai-assist-warning";
import { getDashboardAiAssistBillingCycle } from "@/lib/data/dashboard-ai-assist-billing-cycle";
import {
  createEmptyDashboardAiAssistUsage,
  type DashboardAiAssistUsageSnapshot
} from "@/lib/data/settings-ai-assist-usage";
import {
  dashboardAiAssistActorLabel,
  mapWorkspaceAiAssistActivityRow
} from "@/lib/data/settings-ai-assist-activity-map";
import { getWorkspaceAiAssistUsageSnapshotRow } from "@/lib/repositories/ai-assist-usage-snapshot-repository";

type WorkspaceRole = "owner" | "admin" | "member";

function toCount(value: string | null | undefined) {
  return Number(value ?? "0");
}

function percent(value: number, total: number) {
  return total > 0 ? Math.round((value / total) * 100) : 0;
}

function trend(current: number, previous: number) {
  if (previous === 0) {
    return current === 0 ? null : 100;
  }

  return Math.round(((current - previous) / previous) * 100);
}

export async function getDashboardAiAssistUsage(input: {
  ownerUserId: string;
  viewerUserId: string;
  viewerRole: WorkspaceRole;
  recentLimit?: number;
  now?: Date;
}): Promise<DashboardAiAssistUsageSnapshot> {
  const recentLimit = input.recentLimit ?? 8;
  const viewerCanSeeTeamUsage = input.viewerRole !== "member";
  const cycle = input.now
    ? await getDashboardAiAssistBillingCycle(input.ownerUserId, input.now)
    : await getDashboardAiAssistBillingCycle(input.ownerUserId);
  const snapshotRow = await getWorkspaceAiAssistUsageSnapshotRow({
    ownerUserId: input.ownerUserId,
    currentStart: cycle.startIso,
    currentEnd: cycle.nextIso,
    previousStart: cycle.previousStartIso,
    activityLimit: recentLimit,
    teamActorUserId: viewerCanSeeTeamUsage ? null : input.viewerUserId,
    activityActorUserId: input.viewerRole === "member" ? input.viewerUserId : null
  });
  const { label: monthLabel, limit, nextIso: resetsAt, planKey } = cycle;
  const summaryRow = viewerCanSeeTeamUsage ? snapshotRow : null;
  const teamRows = snapshotRow?.team_rows ?? [];
  const activityRows = snapshotRow?.activity_rows ?? [];
  const requests = toCount(summaryRow?.current_requests);

  if (requests === 0 && !teamRows.length && !activityRows.length) {
    return createEmptyDashboardAiAssistUsage({
      monthLabel,
      planKey,
      limit,
      resetsAt,
      viewerCanSeeTeamUsage
    });
  }

  const suggestionRequests = toCount(summaryRow?.current_suggestion_requests);
  const used = toCount(summaryRow?.current_used);
  const summaries = toCount(summaryRow?.current_summaries);
  const viewerRow = teamRows.find((row) => row.actor_user_id === input.viewerUserId) ?? null;

  return {
    monthLabel,
    viewerCanSeeTeamUsage,
    meter: {
      planKey,
      limit,
      used: requests,
      remaining: limit == null ? null : Math.max(0, limit - requests),
      percentUsed: limit && limit > 0 ? Math.min(100, Math.round((requests / limit) * 100)) : 0,
      resetsAt,
      state: resolveAiAssistWarningState(requests, limit) ?? "normal"
    },
    overview: {
      requests,
      used,
      acceptanceRate: percent(used, suggestionRequests),
      summaries,
      requestedByFeature: {
        summary: toCount(summaryRow?.current_summary_requests),
        reply: toCount(summaryRow?.current_reply_requests),
        rewrite: toCount(summaryRow?.current_rewrite_requests),
        tags: toCount(summaryRow?.current_tag_requests)
      }
    },
    trend: {
      requests: trend(requests, toCount(summaryRow?.previous_requests)),
      used: trend(used, toCount(summaryRow?.previous_used)),
      acceptanceRate: trend(
        percent(used, suggestionRequests),
        percent(
          toCount(summaryRow?.previous_used),
          toCount(summaryRow?.previous_suggestion_requests)
        )
      ),
      summaries: trend(summaries, toCount(summaryRow?.previous_summaries))
    },
    teamMembers: viewerCanSeeTeamUsage ? teamRows.map((row) => ({
      actorEmail: row.actor_email,
      actorLabel: dashboardAiAssistActorLabel(row.actor_email),
      actorUserId: row.actor_user_id,
      requests: toCount(row.requests),
      used: toCount(row.used),
      acceptanceRate: percent(toCount(row.used), toCount(row.suggestion_requests)),
      summaries: toCount(row.summaries),
      isViewer: row.actor_user_id === input.viewerUserId
    })) : [],
    viewer: {
      requests: toCount(viewerRow?.requests),
      used: toCount(viewerRow?.used),
      acceptanceRate: percent(toCount(viewerRow?.used), toCount(viewerRow?.suggestion_requests)),
      teamSharePercent: viewerCanSeeTeamUsage
        ? percent(toCount(viewerRow?.requests), requests)
        : null
    },
    activity: activityRows.map(mapWorkspaceAiAssistActivityRow)
  };
}
