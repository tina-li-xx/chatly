import {
  getAnalyticsAiAssistActivityPageData
} from "@/lib/data/analytics-ai-assist-activity-page";
import type { AnalyticsAiAssistActivityPageData } from "@/lib/data/analytics-ai-assist-activity-page";
import { parseConversationRating } from "@/lib/conversation-feedback";
import { getDashboardAiAssistUsage } from "@/lib/data/settings-ai-assist-usage-read";
import type { DashboardAiAssistUsageSnapshot } from "@/lib/data/settings-ai-assist-usage";
import {
  listAnalyticsConversations,
  listAnalyticsReplyEvents
} from "@/lib/repositories/analytics-repository";
import type { ConversationRating } from "@/lib/types";
import { getWorkspaceAccess } from "@/lib/workspace-access";

export type {
  AnalyticsAiAssistActivityCursor,
  AnalyticsAiAssistActivityMember,
  AnalyticsAiAssistActivityPageData,
  AnalyticsAiAssistActivityPageSlice
} from "@/lib/data/analytics-ai-assist-activity-page";

export type AnalyticsConversationRecord = {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: "open" | "resolved";
  pageUrl: string | null;
  referrer: string | null;
  rating: ConversationRating | null;
  firstResponseSeconds: number | null;
  resolutionSeconds: number | null;
  tags: string[];
};

export type AnalyticsReplyEventRecord = {
  createdAt: string;
  responseSeconds: number;
};

export type AnalyticsDataset = {
  conversations: AnalyticsConversationRecord[];
  replyEvents: AnalyticsReplyEventRecord[];
  aiAssist?: DashboardAiAssistUsageSnapshot;
  aiAssistActivityPage?: AnalyticsAiAssistActivityPageData;
};

type WorkspaceRole = "owner" | "admin" | "member";

function toNullableNumber(value: string | null) {
  return value == null ? null : Number(value);
}

async function resolveAnalyticsAccess(
  userId: string,
  access?: { ownerUserId: string; viewerRole: WorkspaceRole }
) {
  if (access) {
    return access;
  }

  const workspace = await getWorkspaceAccess(userId);
  return {
    ownerUserId: workspace.ownerUserId,
    viewerRole: workspace.role
  };
}

export async function getAnalyticsDataset(
  userId: string,
  options?: { aiAssistRecentLimit?: number; ownerUserId?: string; viewerRole?: WorkspaceRole }
): Promise<AnalyticsDataset> {
  const access = await resolveAnalyticsAccess(
    userId,
    options?.ownerUserId && options?.viewerRole
      ? { ownerUserId: options.ownerUserId, viewerRole: options.viewerRole }
      : undefined
  );
  const [dataset, aiAssist] = await Promise.all([
    getAnalyticsDatasetForOwnerUserId(access.ownerUserId),
    getDashboardAiAssistUsage({
      ownerUserId: access.ownerUserId,
      viewerUserId: userId,
      viewerRole: access.viewerRole,
      recentLimit: options?.aiAssistRecentLimit ?? 12
    })
  ]);

  return {
    ...dataset,
    aiAssist
  };
}

export async function getAnalyticsAiAssistActivityPageDataset(
  userId: string,
  filters?: Parameters<typeof getAnalyticsAiAssistActivityPageData>[1],
  access?: { ownerUserId: string; viewerRole: WorkspaceRole }
): Promise<AnalyticsDataset> {
  return {
    conversations: [],
    replyEvents: [],
    aiAssistActivityPage: await getAnalyticsAiAssistActivityPageData(userId, filters, access)
  };
}

export async function getAnalyticsAiAssistSectionDataset(
  userId: string,
  options?: { aiAssistRecentLimit?: number; ownerUserId?: string; viewerRole?: WorkspaceRole }
): Promise<AnalyticsDataset> {
  const access = await resolveAnalyticsAccess(
    userId,
    options?.ownerUserId && options?.viewerRole
      ? { ownerUserId: options.ownerUserId, viewerRole: options.viewerRole }
      : undefined
  );

  return {
    conversations: [],
    replyEvents: [],
    aiAssist: await getDashboardAiAssistUsage({
      ownerUserId: access.ownerUserId,
      viewerUserId: userId,
      viewerRole: access.viewerRole,
      recentLimit: options?.aiAssistRecentLimit ?? 12
    })
  };
}

export async function getAnalyticsDatasetForOwnerUserId(ownerUserId: string): Promise<AnalyticsDataset> {
  const [conversations, replyEvents] = await Promise.all([
    listAnalyticsConversations(ownerUserId),
    listAnalyticsReplyEvents(ownerUserId)
  ]);

  return {
    conversations: conversations.map((row) => ({
      id: row.id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      status: row.status,
      pageUrl: row.page_url,
      referrer: row.referrer,
      rating: parseConversationRating(row.rating),
      firstResponseSeconds: toNullableNumber(row.first_response_seconds),
      resolutionSeconds: toNullableNumber(row.resolution_seconds),
      tags: row.tags ?? []
    })),
    replyEvents: replyEvents.map((row) => ({
      createdAt: row.created_at,
      responseSeconds: Number(row.response_seconds)
    }))
  };
}
