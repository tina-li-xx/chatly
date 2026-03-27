import {
  listAnalyticsConversations,
  listAnalyticsReplyEvents
} from "@/lib/repositories/analytics-repository";

export type AnalyticsConversationRecord = {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: "open" | "resolved";
  pageUrl: string | null;
  referrer: string | null;
  helpful: boolean | null;
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
};

function toNullableNumber(value: string | null) {
  return value == null ? null : Number(value);
}

export async function getAnalyticsDataset(userId: string): Promise<AnalyticsDataset> {
  const [conversations, replyEvents] = await Promise.all([
    listAnalyticsConversations(userId),
    listAnalyticsReplyEvents(userId)
  ]);

  return {
    conversations: conversations.map((row) => ({
      id: row.id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      status: row.status,
      pageUrl: row.page_url,
      referrer: row.referrer,
      helpful: row.helpful,
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
