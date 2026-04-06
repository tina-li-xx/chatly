"use client";

import { DashboardAnalyticsScaffold } from "./dashboard-analytics-scaffold";
import type { AnalyticsSection } from "./dashboard-analytics-section";
import { ActivitySkeleton, AiAssistSkeleton, ToolbarSkeleton } from "./dashboard-analytics-loading-ai";
import {
  ConversationsSkeleton,
  OverviewSkeleton,
  TeamSkeleton
} from "./dashboard-analytics-loading-sections";

function sectionSkeleton(activeSection: AnalyticsSection, showAllAiActivity: boolean) {
  if (showAllAiActivity) return <ActivitySkeleton />;
  if (activeSection === "overview") return <OverviewSkeleton />;
  if (activeSection === "conversations") return <ConversationsSkeleton />;
  if (activeSection === "teamPerformance") return <TeamSkeleton />;
  return <AiAssistSkeleton />;
}

export function DashboardAnalyticsLoading({
  activeSection,
  showAllAiActivity = false
}: {
  activeSection: AnalyticsSection;
  showAllAiActivity?: boolean;
}) {
  return (
    <div className="space-y-6">
      {!showAllAiActivity ? <ToolbarSkeleton /> : null}
      <DashboardAnalyticsScaffold activeSection={activeSection}>
        {sectionSkeleton(activeSection, showAllAiActivity)}
      </DashboardAnalyticsScaffold>
    </div>
  );
}
