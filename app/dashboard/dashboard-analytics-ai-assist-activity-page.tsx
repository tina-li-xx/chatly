"use client";

import Link from "next/link";
import { Button } from "../components/ui/Button";
import { DashboardAnalyticsAiAssistActivityFilters } from "./dashboard-analytics-ai-assist-activity-filters";
import { DashboardAnalyticsAiAssistActivityList } from "./dashboard-analytics-ai-assist-activity-list";
import {
  defaultAiActivityFilters
} from "@/lib/data/analytics-ai-assist-activity-filters";
import type { AnalyticsAiAssistActivityPageData } from "@/lib/data/analytics-ai-assist-activity-page";
import { useDashboardAnalyticsAiAssistActivityPage } from "./use-dashboard-analytics-ai-assist-activity-page";
import { DownloadIcon } from "./dashboard-ui";

export function DashboardAnalyticsAiAssistActivityPage({
  data
}: {
  data: AnalyticsAiAssistActivityPageData;
}) {
  const {
    activity,
    exportCsv,
    exporting,
    filters,
    hasMore,
    loadMore,
    loadingMore,
    updateCustomDate,
    navigate
  } = useDashboardAnalyticsAiAssistActivityPage(data);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Link
          href="/dashboard/analytics?section=aiAssist"
          className="inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-slate-700"
        >
          ← Back to AI Assist
        </Link>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <h3 className="text-2xl font-semibold text-slate-900">AI Assist Activity</h3>
          {data.hasAnyActivity ? (
            <Button
              type="button"
              size="md"
              variant="secondary"
              className="h-10 gap-2 bg-white text-sm text-slate-700"
              onClick={() => void exportCsv()}
              disabled={exporting}
              leadingIcon={
                exporting ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-slate-500" />
                ) : (
                  <DownloadIcon className="h-4 w-4" />
                )
              }
            >
              {exporting ? "Exporting..." : "Export CSV"}
            </Button>
          ) : null}
        </div>
      </div>

      <DashboardAnalyticsAiAssistActivityFilters
        filters={filters}
        members={data.members}
        onTypeChange={(value) => navigate({ ...filters, type: value })}
        onMemberChange={(value) => navigate({ ...filters, memberId: value })}
        onDateChange={(value) => navigate({ ...filters, date: value })}
        onCustomStartChange={(value) => updateCustomDate("customStart", value)}
        onCustomEndChange={(value) => updateCustomDate("customEnd", value)}
      />

      <DashboardAnalyticsAiAssistActivityList
        activity={activity}
        hasAnyActivity={data.hasAnyActivity}
        hasMore={hasMore}
        loadingMore={loadingMore}
        onClearFilters={() => navigate(defaultAiActivityFilters())}
        onLoadMore={() => void loadMore()}
      />
    </div>
  );
}
