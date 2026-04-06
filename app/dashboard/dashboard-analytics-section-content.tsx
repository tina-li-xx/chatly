import type { ComponentProps, ReactNode } from "react";
import { AnalyticsEmptyState } from "./dashboard-analytics-primary-charts";
import { DashboardAnalyticsConversationsSection } from "./dashboard-analytics-conversations-section";
import { DashboardAnalyticsOverviewSection } from "./dashboard-analytics-overview-section";
import type { AnalyticsSection } from "./dashboard-analytics-section";
import { DashboardAnalyticsTeamSection } from "./dashboard-analytics-team-section";

type DashboardAnalyticsSectionContentProps = {
  activeSection: AnalyticsSection;
  hasData: boolean;
  overview: ComponentProps<typeof DashboardAnalyticsOverviewSection>;
  conversations: ComponentProps<typeof DashboardAnalyticsConversationsSection>;
  team: ComponentProps<typeof DashboardAnalyticsTeamSection>;
  emptyState?: ReactNode;
};

const DEFAULT_EMPTY_STATE = (
  <AnalyticsEmptyState
    title="No data for this period"
    description="Try switching the date range to see how conversations and response times are moving."
  />
);

export const NO_ANALYTICS_YET_STATE = (
  <div className="rounded-xl border border-slate-200 bg-white">
    <div className="px-6 py-14 text-center">
      <h3 className="text-lg font-medium text-slate-900">No data yet</h3>
      <p className="mt-2 text-sm text-slate-500">
        Analytics will start filling in as soon as visitors begin conversations on your site.
      </p>
    </div>
  </div>
);

export function DashboardAnalyticsSectionContent({
  activeSection,
  hasData,
  overview,
  conversations,
  team,
  emptyState = DEFAULT_EMPTY_STATE
}: DashboardAnalyticsSectionContentProps) {
  if (!hasData) {
    return <>{emptyState}</>;
  }

  switch (activeSection) {
    case "overview":
      return <DashboardAnalyticsOverviewSection {...overview} />;
    case "conversations":
      return <DashboardAnalyticsConversationsSection {...conversations} />;
    default:
      return <DashboardAnalyticsTeamSection {...team} />;
  }
}
