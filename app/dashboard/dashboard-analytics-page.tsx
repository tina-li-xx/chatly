"use client";

import { useState } from "react";
import type { AnalyticsDataset } from "@/lib/data/analytics";
import {
  type AnalyticsDatePreset,
  type AnalyticsGranularity
} from "./dashboard-analytics-types";
import {
  average,
  averageRatingScore,
  buildStatSummary,
  filterConversations,
  filterReplyEvents,
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
import { DashboardAnalyticsAiAssistActivityPage } from "./dashboard-analytics-ai-assist-activity-page";
import { DashboardAnalyticsAiAssistSection } from "./dashboard-analytics-ai-assist-section";
import { DashboardAnalyticsScaffold } from "./dashboard-analytics-scaffold";
import {
  DashboardAnalyticsSectionContent,
  NO_ANALYTICS_YET_STATE
} from "./dashboard-analytics-section-content";
import { type AnalyticsSection } from "./dashboard-analytics-section";
import { DashboardAnalyticsToolbar } from "./dashboard-analytics-toolbar";

type DashboardAnalyticsPageProps = {
  initialDataset: AnalyticsDataset;
  userEmail: string;
  activeSection?: AnalyticsSection;
  showAllAiActivity?: boolean;
};

function wrapAnalyticsSection(activeSection: AnalyticsSection, content: React.ReactNode) {
  return (
    <div className="space-y-6">
      <DashboardAnalyticsScaffold activeSection={activeSection}>
        {content}
      </DashboardAnalyticsScaffold>
    </div>
  );
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function DashboardAnalyticsPage({
  initialDataset,
  userEmail,
  activeSection = "overview",
  showAllAiActivity = false
}: DashboardAnalyticsPageProps) {
  const today = new Date();
  const [datePreset, setDatePreset] = useState<AnalyticsDatePreset>("7d");
  const [granularity, setGranularity] = useState<AnalyticsGranularity>("daily");
  const [customStart, setCustomStart] = useState(toDateInputValue(addDays(startOfDay(today), -6)));
  const [customEnd, setCustomEnd] = useState(toDateInputValue(today));

  if (activeSection === "aiAssist" && showAllAiActivity && initialDataset.aiAssistActivityPage) {
    return wrapAnalyticsSection(
      activeSection,
      <DashboardAnalyticsAiAssistActivityPage data={initialDataset.aiAssistActivityPage} />
    );
  }

  if (activeSection === "aiAssist" && initialDataset.aiAssist) {
    return wrapAnalyticsSection(
      activeSection,
      <DashboardAnalyticsAiAssistSection usage={initialDataset.aiAssist} />
    );
  }

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
  const averageRating = averageRatingScore(currentConversations);

  if (!initialDataset.conversations.length) {
    return (
      <DashboardAnalyticsSectionContent
        activeSection={activeSection}
        hasData={false}
        overview={{
          cards: [],
          conversationPoints: [],
          granularity,
          onGranularityChange: setGranularity
        }}
        conversations={{
          responsePoints: [],
          responseAverage: null,
          replyAverage: null,
          resolutionAverage: null,
          heatMap: [],
          topPages: [],
          averageRating: null,
          ratingBreakdown: [],
          tagBreakdown: []
        }}
        team={{ rows: [], trendPoints: [] }}
        emptyState={NO_ANALYTICS_YET_STATE}
      />
    );
  }

  return (
    <div className="space-y-6">
      <DashboardAnalyticsToolbar
        label={dateRange.label}
        datePreset={datePreset}
        customStart={customStart}
        customEnd={customEnd}
        onDatePresetChange={setDatePreset}
        onCustomStartChange={setCustomStart}
        onCustomEndChange={setCustomEnd}
        onExport={() => exportAnalytics(currentConversations, dateRange.label)}
      />
      <DashboardAnalyticsScaffold activeSection={activeSection}>
        <DashboardAnalyticsSectionContent
          activeSection={activeSection}
          hasData={currentConversations.length > 0}
          overview={{
            cards: [
              summary.total,
              summary.responseTime,
              summary.resolutionRate,
              summary.satisfaction
            ],
            conversationPoints,
            granularity,
            onGranularityChange: setGranularity
          }}
          conversations={{
            responsePoints,
            responseAverage,
            replyAverage,
            resolutionAverage,
            heatMap,
            topPages,
            averageRating,
            ratingBreakdown,
            tagBreakdown
          }}
          team={{
            rows: teamRows,
            trendPoints: conversationPoints.map((point) => point.value)
          }}
        />
      </DashboardAnalyticsScaffold>
    </div>
  );
}
