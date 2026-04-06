"use client";

import type {
  ChartPoint,
  HeatMapCell,
  RatingBreakdown,
  TagBreakdown
} from "./dashboard-analytics-types";
import { HeatMap, ResponseTimeChart } from "./dashboard-analytics-primary-charts";
import {
  DonutChart,
  SatisfactionBreakdown,
  TopPagesCard
} from "./dashboard-analytics-secondary-charts";

export function DashboardAnalyticsConversationsSection({
  responsePoints,
  responseAverage,
  replyAverage,
  resolutionAverage,
  heatMap,
  topPages,
  averageRating,
  ratingBreakdown,
  tagBreakdown
}: {
  responsePoints: ChartPoint[];
  responseAverage: number | null;
  replyAverage: number | null;
  resolutionAverage: number | null;
  heatMap: HeatMapCell[];
  topPages: Array<{ page: string; count: number }>;
  averageRating: number | null;
  ratingBreakdown: RatingBreakdown[];
  tagBreakdown: TagBreakdown[];
}) {
  return (
    <>
      <div className="grid gap-6 xl:grid-cols-2">
        <ResponseTimeChart
          points={responsePoints}
          averageSeconds={responseAverage}
          replyAverageSeconds={replyAverage}
          resolutionAverageSeconds={resolutionAverage}
        />
        <HeatMap rows={heatMap} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <TopPagesCard pages={topPages} />
        <SatisfactionBreakdown score={averageRating} rows={ratingBreakdown} />
      </div>

      <DonutChart tags={tagBreakdown} />
    </>
  );
}
