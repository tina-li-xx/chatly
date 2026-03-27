"use client";

import { startTransition, useState } from "react";
import type {
  AnalyticsConversationRecord,
  AnalyticsDataset,
  AnalyticsReplyEventRecord
} from "@/lib/data/analytics";
import { classNames } from "@/lib/utils";
import { CalendarIcon, ChevronDownIcon, DownloadIcon } from "./dashboard-ui";
import {
  DATE_PRESET_OPTIONS,
  GRANULARITY_OPTIONS,
  type AnalyticsDatePreset,
  type AnalyticsGranularity
} from "./dashboard-analytics-types";
import {
  average,
  buildStatSummary,
  filterConversations,
  filterReplyEvents,
  helpfulScore,
  resolveDateRange,
  toDateInputValue,
  addDays
} from "./dashboard-analytics-core";
import {
  buildConversationChartPoints,
  buildHeatMap,
  buildRatingBreakdown,
  buildResponseBuckets,
  buildTagBreakdown,
  buildTeamRows,
  buildTopPages,
  exportAnalytics
} from "./dashboard-analytics-data";
import {
  AnalyticsEmptyState,
  HeatMap,
  LineChart,
  ResponseTimeChart,
  StatCard
} from "./dashboard-analytics-primary-charts";
import {
  DonutChart,
  SatisfactionBreakdown,
  TeamPerformanceTable,
  TopPagesCard
} from "./dashboard-analytics-secondary-charts";

type DashboardAnalyticsPageProps = {
  initialDataset: AnalyticsDataset;
  userEmail: string;
};

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function DashboardAnalyticsPage({
  initialDataset,
  userEmail
}: DashboardAnalyticsPageProps) {
  const today = new Date();
  const [datePreset, setDatePreset] = useState<AnalyticsDatePreset>("7d");
  const [granularity, setGranularity] = useState<AnalyticsGranularity>("daily");
  const [customStart, setCustomStart] = useState(toDateInputValue(addDays(startOfDay(today), -6)));
  const [customEnd, setCustomEnd] = useState(toDateInputValue(today));

  const dateRange = resolveDateRange(datePreset, customStart, customEnd);
  const currentConversations = filterConversations(
    initialDataset.conversations,
    dateRange.start,
    dateRange.end
  );
  const previousConversations = filterConversations(
    initialDataset.conversations,
    dateRange.previousStart,
    dateRange.previousEnd
  );
  const currentReplyEvents = filterReplyEvents(initialDataset.replyEvents, dateRange.start, dateRange.end);
  const summary = buildStatSummary(currentConversations, previousConversations);
  const conversationPoints = buildConversationChartPoints(currentConversations, dateRange, granularity);
  const responsePoints = buildResponseBuckets(currentConversations, dateRange, granularity);
  const responseAverage = average(
    currentConversations
      .map((conversation) => conversation.firstResponseSeconds)
      .filter((value): value is number => value != null)
  );
  const replyAverage = average(currentReplyEvents.map((event) => event.responseSeconds));
  const resolutionAverage = average(
    currentConversations
      .map((conversation) => conversation.resolutionSeconds)
      .filter((value): value is number => value != null)
  );
  const heatMap = buildHeatMap(currentConversations);
  const topPages = buildTopPages(currentConversations);
  const ratingBreakdown = buildRatingBreakdown(currentConversations);
  const tagBreakdown = buildTagBreakdown(currentConversations);
  const teamRows = buildTeamRows(currentConversations, userEmail);
  const helpfulAverage = helpfulScore(currentConversations);

  if (!initialDataset.conversations.length) {
    return (
      <AnalyticsEmptyState
        title="No data yet"
        description="Analytics will start filling in as soon as visitors begin conversations on your site."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm text-slate-500">Showing {dateRange.label}</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-end">
          <div className="relative">
            <CalendarIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <select
              value={datePreset}
              onChange={(event) => {
                const nextValue = event.target.value as AnalyticsDatePreset;
                startTransition(() => setDatePreset(nextValue));
              }}
              className="h-10 appearance-none rounded-lg border border-slate-200 bg-white pl-10 pr-10 text-sm text-slate-700"
            >
              {DATE_PRESET_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>

          {datePreset === "custom" ? (
            <>
              <input
                type="date"
                value={customStart}
                onChange={(event) => {
                  const nextValue = event.target.value;
                  startTransition(() => setCustomStart(nextValue));
                }}
                className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700"
              />
              <input
                type="date"
                value={customEnd}
                onChange={(event) => {
                  const nextValue = event.target.value;
                  startTransition(() => setCustomEnd(nextValue));
                }}
                className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700"
              />
            </>
          ) : null}

          <button
            type="button"
            onClick={() => exportAnalytics(currentConversations, dateRange.label)}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-700 transition hover:bg-slate-50"
          >
            <DownloadIcon className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {!currentConversations.length ? (
        <AnalyticsEmptyState
          title="No data for this period"
          description="Try switching the date range to see how conversations and response times are moving."
        />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard {...summary.total} />
            <StatCard {...summary.responseTime} />
            <StatCard {...summary.resolutionRate} />
            <StatCard {...summary.satisfaction} />
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <h3 className="text-base font-medium text-slate-900">Conversations over time</h3>
              <div className="inline-flex rounded-lg bg-slate-100 p-1">
                {GRANULARITY_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      startTransition(() => setGranularity(option.value));
                    }}
                    className={classNames(
                      "rounded-md px-3 py-1.5 text-[13px] transition",
                      granularity === option.value
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            <LineChart points={conversationPoints} />
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <ResponseTimeChart
              points={responsePoints}
              averageSeconds={responseAverage}
              replyAverageSeconds={replyAverage}
              resolutionAverageSeconds={resolutionAverage}
            />
            <HeatMap rows={heatMap} />
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,3fr)_minmax(320px,2fr)]">
            <TeamPerformanceTable rows={teamRows} trendPoints={conversationPoints.map((point) => point.value)} />
            <TopPagesCard pages={topPages} />
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <SatisfactionBreakdown score={helpfulAverage} rows={ratingBreakdown} />
            <DonutChart tags={tagBreakdown} />
          </div>
        </>
      )}
    </div>
  );
}
