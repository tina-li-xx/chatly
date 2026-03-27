import {
  getDashboardHomeOverview,
  getDashboardHomeResponseMetrics,
  getDashboardHomeSatisfactionMetrics,
  getPreviousWeekConversationCount,
  listDashboardHomeChartPoints
} from "@/lib/repositories/dashboard-home-repository";
import { isSiteWidgetInstalled } from "@/lib/site-installation";
import type { ConversationSummary } from "@/lib/types";
import { listConversationSummaries } from "./conversations";
import { listSitesForUser } from "./sites";

export type DashboardHomeData = {
  hasWidgetInstalled: boolean;
  widgetSiteIds: string[];
  unreadCount: number;
  openConversations: number;
  openConversationsDelta: number;
  resolvedToday: number;
  resolvedTodayDelta: number;
  avgResponseSeconds: number | null;
  avgResponseDeltaPercent: number | null;
  satisfactionPercent: number | null;
  satisfactionDeltaPercent: number | null;
  recentConversations: ConversationSummary[];
  chart: {
    total: number;
    changePercent: number | null;
    points: Array<{
      label: string;
      count: number;
    }>;
  };
};

function toNumber(value: string | null | undefined) {
  return value == null ? null : Number(value);
}

function roundToWhole(value: number | null) {
  return value == null || Number.isNaN(value) ? null : Math.round(value);
}

function percentChange(current: number | null, previous: number | null) {
  if (current == null || previous == null || previous === 0) {
    return null;
  }

  return Math.round(((current - previous) / Math.abs(previous)) * 100);
}

export async function getDashboardHomeData(userId: string): Promise<DashboardHomeData> {
  const [summaries, sites, overview, response, satisfaction, chartRows, previousWeekCount] =
    await Promise.all([
      listConversationSummaries(userId),
      listSitesForUser(userId),
      getDashboardHomeOverview(userId),
      getDashboardHomeResponseMetrics(userId),
      getDashboardHomeSatisfactionMetrics(userId),
      listDashboardHomeChartPoints(userId),
      getPreviousWeekConversationCount(userId)
    ]);

  const currentWeekPoints = chartRows.map((row) => ({
    label: row.day_label.trim(),
    count: Number(row.count)
  }));
  const currentWeekTotal = currentWeekPoints.reduce((total, point) => total + point.count, 0);
  const previousWeekTotal = Number(previousWeekCount ?? 0);

  const currentAvgResponse = roundToWhole(toNumber(response?.current_avg_seconds));
  const previousAvgResponse = roundToWhole(toNumber(response?.previous_avg_seconds));
  const avgResponseDeltaPercent =
    currentAvgResponse != null && previousAvgResponse != null && previousAvgResponse > 0
      ? Math.round(((previousAvgResponse - currentAvgResponse) / previousAvgResponse) * 100)
      : null;

  const currentSatisfaction = roundToWhole(toNumber(satisfaction?.current_rate));
  const previousSatisfaction = roundToWhole(toNumber(satisfaction?.previous_rate));

  return {
    hasWidgetInstalled: sites.some((site) => isSiteWidgetInstalled(site)),
    widgetSiteIds: sites.map((site) => site.id),
    unreadCount: summaries.reduce((count, conversation) => count + conversation.unreadCount, 0),
    openConversations: Number(overview?.open_conversations ?? 0),
    openConversationsDelta: Number(overview?.opened_today ?? 0),
    resolvedToday: Number(overview?.resolved_today ?? 0),
    resolvedTodayDelta:
      Number(overview?.resolved_today ?? 0) - Number(overview?.resolved_yesterday ?? 0),
    avgResponseSeconds: currentAvgResponse,
    avgResponseDeltaPercent,
    satisfactionPercent: currentSatisfaction,
    satisfactionDeltaPercent: percentChange(currentSatisfaction, previousSatisfaction),
    recentConversations: summaries.slice(0, 4),
    chart: {
      total: currentWeekTotal,
      changePercent: percentChange(currentWeekTotal, previousWeekTotal),
      points: currentWeekPoints
    }
  };
}
