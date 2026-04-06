import Link from "next/link";
import { Button } from "../components/ui/Button";
import { DashboardAiAssistActivityBadge } from "./dashboard-ai-assist-activity-badge";
import { aiActivityDateHeading, groupAiAssistActivity } from "./dashboard-analytics-ai-assist-activity-page.utils";
import type { DashboardAiAssistUsageActivity } from "@/lib/data/settings-ai-assist-usage";
import {
  describeDashboardAiAssistActivity,
  explainDashboardAiAssistActivity,
  formatDashboardAiAssistConversationPreview
} from "@/lib/data/settings-ai-assist-activity-copy";
import { initialsFromLabel } from "@/lib/user-display";

export function DashboardAnalyticsAiAssistActivityList({
  activity,
  hasAnyActivity,
  hasMore,
  loadingMore,
  onClearFilters,
  onLoadMore
}: {
  activity: DashboardAiAssistUsageActivity[];
  hasAnyActivity: boolean;
  hasMore: boolean;
  loadingMore: boolean;
  onClearFilters: () => void;
  onLoadMore: () => void;
}) {
  if (!hasAnyActivity) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white px-6 py-12 text-center">
        <h4 className="text-lg font-medium text-slate-900">No AI Assist activity yet</h4>
        <p className="mt-3 text-sm leading-6 text-slate-600">Your team has not used AI features yet. Try suggesting a reply or summarizing a conversation to get started.</p>
      </div>
    );
  }

  if (!activity.length) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white px-6 py-12 text-center">
        <h4 className="text-lg font-medium text-slate-900">No activity found</h4>
        <p className="mt-3 text-sm leading-6 text-slate-600">Try adjusting your filters or date range.</p>
        <div className="mt-5">
          <Button
            type="button"
            size="md"
            variant="secondary"
            className="h-auto border-0 bg-transparent px-0 text-sm text-blue-600 hover:bg-transparent hover:text-blue-700"
            onClick={onClearFilters}
          >
            Clear filters
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
      {groupAiAssistActivity(activity).map((group) => (
        <div key={group.date}>
          <div className="border-b border-slate-100 pb-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">{aiActivityDateHeading(group.date)}</p>
          </div>
          <div className="divide-y divide-slate-100">
            {group.activity.map((item) => {
              const conversationPreview = formatDashboardAiAssistConversationPreview(
                item.conversationPreview
              );
              const row = (
                <div className="flex gap-3 px-1 py-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">{initialsFromLabel(item.actorLabel)}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        <span className="font-medium text-slate-900">{item.actorLabel}</span>
                        <span className="text-slate-300">·</span>
                        <span className="text-slate-600">{describeDashboardAiAssistActivity(item)}</span>
                        <DashboardAiAssistActivityBadge item={item} explanation={explainDashboardAiAssistActivity(item)} bordered titleCase />
                      </div>
                      <span className="text-[13px] text-slate-400">{new Intl.DateTimeFormat("en-GB", { hour: "numeric", minute: "2-digit" }).format(new Date(item.createdAt))}</span>
                    </div>
                    {conversationPreview ? <p className="mt-1 truncate text-[13px] text-slate-500">{conversationPreview}</p> : null}
                  </div>
                </div>
              );

              return item.conversationId ? (
                <Link key={item.id} href={`/dashboard/inbox?id=${item.conversationId}`} className="block rounded-lg transition hover:bg-slate-50">{row}</Link>
              ) : (
                <div key={item.id}>{row}</div>
              );
            })}
          </div>
        </div>
      ))}

      {hasMore ? (
        <div className="flex justify-center border-t border-slate-100 pt-4">
          <Button
            type="button"
            size="md"
            variant="secondary"
            className="h-10 bg-white text-sm text-slate-700"
            disabled={loadingMore}
            onClick={onLoadMore}
            leadingIcon={
              loadingMore ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-slate-500" />
              ) : undefined
            }
          >
            {loadingMore ? "Loading..." : "Load more"}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
