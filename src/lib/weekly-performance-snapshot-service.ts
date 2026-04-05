import { getAnalyticsDatasetForOwnerUserId } from "@/lib/data/analytics";
import { buildWeeklyPerformanceSnapshot } from "@/lib/weekly-performance-builder";
import {
  findWeeklyPerformanceSnapshot,
  upsertWeeklyPerformanceSnapshot
} from "@/lib/repositories/weekly-performance-snapshot-repository";
import {
  listWeeklyPerformanceHandledConversationRows,
  listWeeklyPerformanceTeamMemberRows
} from "@/lib/repositories/weekly-performance-team-repository";
import type { WeeklyPerformanceSnapshot } from "@/lib/weekly-performance-types";

export async function getOrCreateWeeklyPerformanceSnapshot(input: {
  ownerUserId: string;
  teamName: string;
  weekStart: string;
  teamTimeZone: string;
  reportUrl: string;
  settingsUrl: string;
  widgetUrl: string;
  includeAiInsights: boolean;
  includeTeamLeaderboard: boolean;
}) {
  const existing = await findWeeklyPerformanceSnapshot(input.ownerUserId, input.weekStart);
  if (existing) {
    return JSON.parse(existing.snapshot_json) as WeeklyPerformanceSnapshot;
  }

  const [dataset, teamMembers, handledConversations] = await Promise.all([
    getAnalyticsDatasetForOwnerUserId(input.ownerUserId),
    listWeeklyPerformanceTeamMemberRows(input.ownerUserId),
    listWeeklyPerformanceHandledConversationRows(input.ownerUserId)
  ]);

  const snapshot = await buildWeeklyPerformanceSnapshot({
    teamName: input.teamName,
    conversations: dataset.conversations,
    handledConversations,
    teamMembers,
    weekStart: input.weekStart,
    teamTimeZone: input.teamTimeZone,
    reportUrl: input.reportUrl,
    settingsUrl: input.settingsUrl,
    widgetUrl: input.widgetUrl,
    includeAiInsights: input.includeAiInsights,
    includeTeamLeaderboard: input.includeTeamLeaderboard
  });

  await upsertWeeklyPerformanceSnapshot({
    ownerUserId: input.ownerUserId,
    weekStart: input.weekStart,
    snapshotJson: JSON.stringify(snapshot)
  });

  return snapshot;
}
