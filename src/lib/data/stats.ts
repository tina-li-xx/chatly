import {
  getConversationTotalsForUser,
  getHelpfulConversationCountForUser,
  listTopTagsForUser
} from "@/lib/repositories/stats-repository";
import type { DashboardStats } from "@/lib/types";

export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  const [totals, helpful, tags] = await Promise.all([
    getConversationTotalsForUser(userId),
    getHelpfulConversationCountForUser(userId),
    listTopTagsForUser(userId)
  ]);

  return {
    totalConversations: Number(totals.total ?? 0),
    answeredConversations: Number(totals.answered ?? 0),
    helpfulResponses: Number(helpful ?? 0),
    topTags: tags.map((row) => ({ tag: row.tag, count: Number(row.count) }))
  };
}
