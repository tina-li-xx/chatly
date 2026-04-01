import {
  getDashboardHomeOverview,
  getDashboardHomeResponseMetrics,
  getDashboardHomeSatisfactionMetrics,
  getDashboardHomeConversationRange
} from "@/lib/repositories/dashboard-home-repository";
import { findAuthUserById } from "@/lib/repositories/auth-repository";
import { isSiteWidgetInstalled } from "@/lib/site-installation";
import type { ConversationSummary } from "@/lib/types";
import { resolvePreferredTimeZoneForUser } from "../user-timezone-preference";
import { listConversationSummaries } from "./conversations";
import {
  buildDashboardHomeChart,
  calculatePercentChange,
  type DashboardHomeChart,
  type DashboardHomeRangeDays
} from "./dashboard-home-chart";
import { getDashboardGrowthData, type DashboardHomeGrowthData } from "./dashboard-growth";
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
  chart: DashboardHomeChart;
  growth: DashboardHomeGrowthData;
};

function toNumber(value: string | null | undefined) {
  return value == null ? null : Number(value);
}

function roundToWhole(value: number | null) {
  return value == null || Number.isNaN(value) ? null : Math.round(value);
}

export async function getDashboardHomeData(
  userId: string,
  rangeDays: DashboardHomeRangeDays = 7
): Promise<DashboardHomeData> {
  const [user, summaries, sites, overview, response, satisfaction, timeZone] =
    await Promise.all([
      findAuthUserById(userId),
      listConversationSummaries(userId),
      listSitesForUser(userId),
      getDashboardHomeOverview(userId),
      getDashboardHomeResponseMetrics(userId),
      getDashboardHomeSatisfactionMetrics(userId),
      resolvePreferredTimeZoneForUser(userId)
    ]);

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  const chartRange = await getDashboardHomeConversationRange(userId, timeZone, rangeDays);
  const chart = buildDashboardHomeChart(chartRange.rows, chartRange.previousTotal, rangeDays);

  const currentAvgResponse = roundToWhole(toNumber(response?.current_avg_seconds));
  const previousAvgResponse = roundToWhole(toNumber(response?.previous_avg_seconds));
  const avgResponseDeltaPercent =
    currentAvgResponse != null && previousAvgResponse != null && previousAvgResponse > 0
      ? Math.round(((previousAvgResponse - currentAvgResponse) / previousAvgResponse) * 100)
      : null;

  const currentSatisfaction = roundToWhole(toNumber(satisfaction?.current_rate));
  const previousSatisfaction = roundToWhole(toNumber(satisfaction?.previous_rate));
  const hasWidgetInstalled = sites.some((site) => isSiteWidgetInstalled(site));
  const growth = await getDashboardGrowthData(
    userId,
    user.created_at,
    hasWidgetInstalled,
    currentAvgResponse
  );

  return {
    hasWidgetInstalled,
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
    satisfactionDeltaPercent: calculatePercentChange(currentSatisfaction, previousSatisfaction),
    recentConversations: summaries.slice(0, 4),
    chart,
    growth
  };
}
