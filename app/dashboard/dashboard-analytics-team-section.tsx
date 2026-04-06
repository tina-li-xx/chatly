"use client";

import type { TeamRow } from "./dashboard-analytics-types";
import { TeamPerformanceTable } from "./dashboard-analytics-secondary-charts";

export function DashboardAnalyticsTeamSection({
  rows,
  trendPoints
}: {
  rows: TeamRow[];
  trendPoints: number[];
}) {
  return <TeamPerformanceTable rows={rows} trendPoints={trendPoints} />;
}
