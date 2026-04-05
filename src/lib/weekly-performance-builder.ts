import type { AnalyticsConversationRecord } from "@/lib/data/analytics";
import { formatDateKeyLabel, isConversationInLocalWeek, shiftDateKey } from "@/lib/report-time";
import {
  average,
  formatDuration,
  formatSatisfaction,
  heatmapIntensity,
  pageLabelFromUrl,
  peakTimeRange,
  percent,
  percentileThreshold,
  truncateLabel,
  WEEKLY_HEATMAP_DAY_LABELS,
  WEEKLY_HEATMAP_HOUR_LABELS,
  WEEKLY_HEATMAP_HOURS,
  weeklyLocalDayIndex,
  weeklyLocalHour
} from "@/lib/weekly-performance-format";
import { getWeeklyPerformanceTip } from "@/lib/weekly-performance-copy";
import { generateWeeklyPerformanceInsight } from "@/lib/weekly-performance-insight-service";
import { buildWeeklyPerformanceTeamSections } from "@/lib/weekly-performance-team-sections";
import type {
  WeeklyPerformanceHeatmapRow,
  WeeklyPerformanceMetric,
  WeeklyPerformanceSnapshot,
  WeeklyPerformanceTopPage
} from "@/lib/weekly-performance-types";
import type {
  WeeklyPerformanceHandledConversationRow,
  WeeklyPerformanceTeamMemberRow
} from "@/lib/repositories/weekly-performance-team-repository";

function filterWeek(conversations: AnalyticsConversationRecord[], weekStart: string, timeZone: string) {
  return conversations.filter((conversation) => isConversationInLocalWeek(conversation.createdAt, weekStart, timeZone));
}

function rateMetric(label: string, current: number | null, previous: number | null): WeeklyPerformanceMetric {
  if (current == null) return { label, value: "—", trendLabel: "—", trendTone: "neutral", trendDirection: "none" };
  if (previous == null) return { label, value: percent(current), trendLabel: "—", trendTone: "neutral", trendDirection: "none" };
  const delta = current - previous;
  return { label, value: percent(current), trendLabel: `${delta >= 0 ? "↑" : "↓"} ${Math.round(Math.abs(delta))}% vs last week`, trendTone: Math.abs(delta) < 0.5 ? "neutral" : delta > 0 ? "positive" : "negative", trendDirection: Math.abs(delta) < 0.5 ? "flat" : delta >= 0 ? "up" : "down" };
}

function satisfactionMetric(current: number | null, previous: number | null): WeeklyPerformanceMetric {
  if (current == null) return { label: "Satisfaction", value: "—", trendLabel: "—", trendTone: "neutral", trendDirection: "none" };
  if (previous == null) return { label: "Satisfaction", value: formatSatisfaction(current), trendLabel: "—", trendTone: "neutral", trendDirection: "none" };
  const delta = current - previous;
  return { label: "Satisfaction", value: formatSatisfaction(current), trendLabel: `${delta >= 0 ? "↑" : "↓"} ${Math.abs(delta).toFixed(1)} vs last week`, trendTone: Math.abs(delta) < 0.05 ? "neutral" : delta > 0 ? "positive" : "negative", trendDirection: Math.abs(delta) < 0.05 ? "flat" : delta >= 0 ? "up" : "down" };
}

function conversationMetric(current: number, previous: number): WeeklyPerformanceMetric {
  if (previous <= 0) return { label: "Conversations", value: String(current), trendLabel: "—", trendTone: "neutral", trendDirection: "none" };
  const delta = ((current - previous) / previous) * 100;
  return { label: "Conversations", value: String(current), trendLabel: `${delta >= 0 ? "↑" : "↓"} ${Math.round(Math.abs(delta))}% vs last week`, trendTone: Math.abs(delta) < 0.5 ? "neutral" : delta > 0 ? "positive" : "negative", trendDirection: Math.abs(delta) < 0.5 ? "flat" : delta >= 0 ? "up" : "down" };
}

function responseMetric(current: number | null, previous: number | null): WeeklyPerformanceMetric {
  if (current == null || previous == null || previous <= 0) return { label: "Avg response", value: formatDuration(current), trendLabel: "—", trendTone: "neutral", trendDirection: "none" };
  const delta = ((current - previous) / previous) * 100;
  return { label: "Avg response", value: formatDuration(current), trendLabel: `${delta >= 0 ? "↑" : "↓"} ${Math.round(Math.abs(delta))}% vs last week`, trendTone: delta < 0 ? "positive" : "negative", trendDirection: delta >= 0 ? "up" : "down" };
}

function topPages(conversations: AnalyticsConversationRecord[]): WeeklyPerformanceTopPage[] {
  const counts = new Map<string, number>();
  conversations.forEach((conversation) => counts.set(pageLabelFromUrl(conversation.pageUrl), (counts.get(pageLabelFromUrl(conversation.pageUrl)) ?? 0) + 1));
  const items = [...counts.entries()].sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0])).slice(0, 5);
  const maxCount = items[0]?.[1] ?? 1;
  return items.map(([label, count]) => ({ label: truncateLabel(label), count, widthPercent: Math.max(12, Math.round((count / maxCount) * 100)) }));
}

export async function buildWeeklyPerformanceSnapshot(input: {
  teamName: string;
  conversations: AnalyticsConversationRecord[];
  handledConversations: WeeklyPerformanceHandledConversationRow[];
  teamMembers: WeeklyPerformanceTeamMemberRow[];
  weekStart: string;
  teamTimeZone: string;
  reportUrl: string;
  settingsUrl: string;
  widgetUrl: string;
  includeAiInsights: boolean;
  includeTeamLeaderboard: boolean;
}): Promise<WeeklyPerformanceSnapshot> {
  const current = filterWeek(input.conversations, input.weekStart, input.teamTimeZone);
  const previous = filterWeek(input.conversations, shiftDateKey(input.weekStart, -7), input.teamTimeZone);
  const currentResponse = average(current.map((conversation) => conversation.firstResponseSeconds));
  const previousResponse = average(previous.map((conversation) => conversation.firstResponseSeconds));
  const currentResolution = current.length ? (current.filter((conversation) => conversation.status === "resolved").length / current.length) * 100 : null;
  const previousResolution = previous.length ? (previous.filter((conversation) => conversation.status === "resolved").length / previous.length) * 100 : null;
  const currentSatisfaction = average(current.map((conversation) => conversation.rating));
  const previousSatisfaction = average(previous.map((conversation) => conversation.rating));
  const heatmap: WeeklyPerformanceHeatmapRow[] = Array.from(
    { length: WEEKLY_HEATMAP_DAY_LABELS.length },
    (_, rowIndex) => ({
      label: WEEKLY_HEATMAP_DAY_LABELS[rowIndex],
      cells: WEEKLY_HEATMAP_HOURS.map(() => ({ count: 0, intensity: "empty" }))
    })
  );

  current.forEach((conversation) => {
    const dayIndex = weeklyLocalDayIndex(conversation.createdAt, input.teamTimeZone);
    const hourIndex = WEEKLY_HEATMAP_HOURS.indexOf(weeklyLocalHour(conversation.createdAt, input.teamTimeZone));
    if (dayIndex >= 0 && hourIndex >= 0) heatmap[dayIndex]!.cells[hourIndex]!.count += 1;
  });

  const nonZeroCells = heatmap.flatMap((row) => row.cells.map((cell) => cell.count).filter(Boolean));
  const thresholds = { low: percentileThreshold(nonZeroCells, 0.25), medium: percentileThreshold(nonZeroCells, 0.75), high: percentileThreshold(nonZeroCells, 0.95), peak: nonZeroCells[nonZeroCells.length - 1] ?? 0 };
  let peakLabel: string | null = null;
  let peakCount = 0;
  heatmap.forEach((row, dayIndex) => row.cells.forEach((cell, hourIndex) => {
    cell.intensity = heatmapIntensity(cell.count, thresholds);
    if (cell.count > peakCount) {
      peakCount = cell.count;
      peakLabel = `${WEEKLY_HEATMAP_DAY_LABELS[dayIndex]} ${peakTimeRange(WEEKLY_HEATMAP_HOURS[hourIndex] ?? 8)} (${cell.count} conversations)`;
    }
  }));

  const teamSections = buildWeeklyPerformanceTeamSections({ teamMembers: input.teamMembers, handledConversations: input.handledConversations.filter((row) => isConversationInLocalWeek(row.handled_at, input.weekStart, input.teamTimeZone)) });
  const insightInput = { totalConversations: current.length, previousConversations: previous.length, avgResponseSeconds: currentResponse, previousAvgResponseSeconds: previousResponse, resolutionRate: currentResolution, previousResolutionRate: previousResolution, satisfactionScore: currentSatisfaction, previousSatisfactionScore: previousSatisfaction };

  const metrics = [conversationMetric(current.length, previous.length), responseMetric(currentResponse, previousResponse), rateMetric("Resolution rate", currentResolution, previousResolution)];
  if (currentSatisfaction != null || previousSatisfaction != null) metrics.push(satisfactionMetric(currentSatisfaction, previousSatisfaction));

  return {
    teamName: input.teamName,
    dateRange: `${formatDateKeyLabel(input.weekStart, "short")} – ${formatDateKeyLabel(shiftDateKey(input.weekStart, 6), "short")}`,
    previewText: current.length > 0 ? `${current.length} conversations, ${formatDuration(currentResponse)} avg response time` : "Quiet week in chat — review your widget and stay ready",
    reportUrl: input.reportUrl,
    settingsUrl: input.settingsUrl,
    widgetUrl: input.widgetUrl,
    quietWeek: current.length === 0,
    metrics,
    heatmapHours: WEEKLY_HEATMAP_HOUR_LABELS,
    heatmapRows: heatmap,
    peakLabel,
    topPages: topPages(current),
    insight: input.includeAiInsights ? await generateWeeklyPerformanceInsight(insightInput) : null,
    tip: getWeeklyPerformanceTip(input.weekStart),
    teamPerformance: input.includeTeamLeaderboard ? teamSections.teamPerformance : [],
    personalPerformanceByUserId: teamSections.personalPerformanceByUserId
  };
}
