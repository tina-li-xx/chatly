import type { BillingPlanKey } from "@/lib/billing-plans";
import type { AiAssistReplyEditLevel } from "@/lib/types";

export const DASHBOARD_AI_ASSIST_EVENT_NAMES = [
  "ai.summary.requested",
  "ai.summary.shown",
  "ai.reply.requested",
  "ai.reply.used",
  "ai.reply.dismissed",
  "ai.rewrite.requested",
  "ai.rewrite.applied",
  "ai.rewrite.dismissed",
  "ai.tags.requested",
  "ai.tags.shown",
  "ai.tags.applied",
  "ai.tags.dismissed"
] as const;

export type DashboardAiAssistEventName =
  (typeof DASHBOARD_AI_ASSIST_EVENT_NAMES)[number];
export type DashboardAiAssistFeature = "summary" | "reply" | "rewrite" | "tags";
export type DashboardAiAssistAction =
  | "requested"
  | "shown"
  | "used"
  | "dismissed"
  | "applied";

export type DashboardAiAssistUsageMeter = {
  planKey: BillingPlanKey;
  limit: number | null;
  used: number;
  remaining: number | null;
  percentUsed: number;
  resetsAt: string;
  state: "normal" | "warning" | "limited";
};

export type DashboardAiAssistOverview = {
  requests: number;
  used: number;
  acceptanceRate: number;
  summaries: number;
  requestedByFeature: Record<DashboardAiAssistFeature, number>;
};

export type DashboardAiAssistTrend = {
  requests: number | null;
  used: number | null;
  acceptanceRate: number | null;
  summaries: number | null;
};

export type DashboardAiAssistUsageActivity = {
  id: string;
  actorEmail: string | null;
  actorLabel: string;
  actorUserId: string | null;
  feature: DashboardAiAssistFeature;
  action: DashboardAiAssistAction;
  conversationId: string | null;
  conversationPreview: string | null;
  createdAt: string;
  tone: string | null;
  tag: string | null;
  edited: boolean;
  editLevel: AiAssistReplyEditLevel | null;
};

export type DashboardAiAssistTeamMemberUsage = {
  actorEmail: string | null;
  actorLabel: string;
  actorUserId: string | null;
  requests: number;
  used: number;
  acceptanceRate: number;
  summaries: number;
  isViewer: boolean;
};

export type DashboardAiAssistViewerUsage = {
  requests: number;
  used: number;
  acceptanceRate: number;
  teamSharePercent: number | null;
};

export type DashboardAiAssistUsageSnapshot = {
  monthLabel: string;
  viewerCanSeeTeamUsage: boolean;
  meter: DashboardAiAssistUsageMeter;
  overview: DashboardAiAssistOverview;
  trend: DashboardAiAssistTrend;
  teamMembers: DashboardAiAssistTeamMemberUsage[];
  viewer: DashboardAiAssistViewerUsage;
  activity: DashboardAiAssistUsageActivity[];
};

const EVENT_MAP: Record<
  DashboardAiAssistEventName,
  { feature: DashboardAiAssistFeature; action: DashboardAiAssistAction }
> = {
  "ai.summary.requested": { feature: "summary", action: "requested" },
  "ai.summary.shown": { feature: "summary", action: "shown" },
  "ai.reply.requested": { feature: "reply", action: "requested" },
  "ai.reply.used": { feature: "reply", action: "used" },
  "ai.reply.dismissed": { feature: "reply", action: "dismissed" },
  "ai.rewrite.requested": { feature: "rewrite", action: "requested" },
  "ai.rewrite.applied": { feature: "rewrite", action: "applied" },
  "ai.rewrite.dismissed": { feature: "rewrite", action: "dismissed" },
  "ai.tags.requested": { feature: "tags", action: "requested" },
  "ai.tags.shown": { feature: "tags", action: "shown" },
  "ai.tags.applied": { feature: "tags", action: "applied" },
  "ai.tags.dismissed": { feature: "tags", action: "dismissed" }
};

export function createEmptyDashboardAiAssistUsage(input: {
  monthLabel: string;
  planKey: BillingPlanKey;
  limit: number | null;
  resetsAt: string;
  viewerCanSeeTeamUsage: boolean;
}): DashboardAiAssistUsageSnapshot {
  return {
    monthLabel: input.monthLabel,
    viewerCanSeeTeamUsage: input.viewerCanSeeTeamUsage,
    meter: {
      planKey: input.planKey,
      limit: input.limit,
      used: 0,
      remaining: input.limit,
      percentUsed: 0,
      resetsAt: input.resetsAt,
      state: "normal"
    },
    overview: {
      requests: 0,
      used: 0,
      acceptanceRate: 0,
      summaries: 0,
      requestedByFeature: { summary: 0, reply: 0, rewrite: 0, tags: 0 }
    },
    trend: { requests: null, used: null, acceptanceRate: null, summaries: null },
    teamMembers: [],
    viewer: {
      requests: 0,
      used: 0,
      acceptanceRate: 0,
      teamSharePercent: input.viewerCanSeeTeamUsage ? 0 : null
    },
    activity: []
  };
}

export function parseDashboardAiAssistEventName(name: string) {
  return EVENT_MAP[name.trim() as DashboardAiAssistEventName] ?? null;
}
