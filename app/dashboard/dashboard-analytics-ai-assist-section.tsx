"use client";

import { Button } from "../components/ui/Button";
import type { DashboardAiAssistUsageSnapshot } from "@/lib/data/settings-ai-assist-usage";
import { DashboardAnalyticsAiAssistActivityLog } from "./dashboard-analytics-ai-assist-activity-log";
import { DashboardAnalyticsAiAssistTeamTable } from "./dashboard-analytics-ai-assist-team-table";

function trendLabel(value: number | null) {
  if (value == null) {
    return "—";
  }

  return `${value > 0 ? "↑" : value < 0 ? "↓" : "•"} ${Math.abs(value)}%`;
}

function exportActivityCsv(usage: DashboardAiAssistUsageSnapshot) {
  const rows = usage.activity.map((item) => [
    item.createdAt,
    item.actorEmail ?? "",
    item.feature,
    item.action,
    item.conversationId ?? "",
    item.conversationPreview ?? ""
  ]);
  const csv = [["Timestamp", "User", "Type", "Action", "Conversation ID", "Conversation reference"], ...rows]
    .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `chatting-ai-assist-${usage.monthLabel.toLowerCase().replaceAll(" ", "-")}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function DashboardAnalyticsAiAssistSection({
  usage
}: {
  usage?: DashboardAiAssistUsageSnapshot;
}) {
  if (!usage) {
    return null;
  }

  const hasVisibleUsage = usage.viewerCanSeeTeamUsage
    ? Boolean(usage.overview.requests || usage.activity.length)
    : Boolean(usage.viewer.requests || usage.activity.length);

  if (!hasVisibleUsage) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white px-6 py-12 text-center">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">AI Assist</p>
        <h3 className="mt-3 text-xl font-semibold text-slate-900">
          {usage.viewerCanSeeTeamUsage ? "No AI Assist usage yet" : "No personal AI usage yet"}
        </h3>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
          {usage.viewerCanSeeTeamUsage
            ? "Your team has not used AI features in this billing cycle yet. Try suggesting a reply or summarizing a conversation to start building usage data."
            : "You have not used AI features in this billing cycle yet. Try suggesting a reply or summarizing a conversation to start building usage data."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 rounded-xl border border-slate-200 bg-white p-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">AI Assist</p>
          <h3 className="mt-2 text-xl font-semibold text-slate-900">
            {usage.viewerCanSeeTeamUsage ? "Team AI usage" : "Your AI usage"}
          </h3>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">{usage.monthLabel}</span>
          {usage.activity.length ? (
            <Button type="button" size="md" variant="secondary" onClick={() => exportActivityCsv(usage)}>
              Export CSV
            </Button>
          ) : null}
        </div>
      </div>

      {usage.viewerCanSeeTeamUsage ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
          <div className="h-3 overflow-hidden rounded-full bg-slate-200">
            <div
              className={`h-full rounded-full ${usage.meter.state === "limited" ? "bg-red-500" : usage.meter.state === "warning" ? "bg-amber-500" : "bg-blue-500"}`}
              style={{
                width: `${usage.meter.used === 0 ? 0 : Math.max(2, usage.meter.percentUsed)}%`
              }}
            />
          </div>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-lg font-semibold text-slate-900">{`${usage.meter.used} / ${usage.meter.limit ?? "∞"} requests`}</p>
            <p className="text-sm text-slate-600">{`Resets ${new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }).format(new Date(usage.meter.resetsAt))}`}</p>
          </div>
        </div>
      ) : null}

      {usage.viewerCanSeeTeamUsage ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              ["Requests", usage.overview.requests, usage.trend.requests],
              ["Used", usage.overview.used, usage.trend.used],
              ["Acceptance", `${usage.overview.acceptanceRate}%`, usage.trend.acceptanceRate],
              ["Summaries", usage.overview.summaries, usage.trend.summaries]
            ].map(([label, value, trendValue]) => (
              <div key={String(label)} className="rounded-xl bg-slate-50 px-5 py-5">
                <p className="text-[13px] text-slate-500">{label}</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{String(value)}</p>
                <p
                  className={`mt-2 text-sm ${trendValue == null ? "text-slate-400" : Number(trendValue) < 0 ? "text-red-600" : "text-green-600"}`}
                >
                  {trendLabel(trendValue as number | null)}
                </p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-slate-200 p-5">
            <h4 className="text-base font-medium text-slate-900">Usage by type</h4>
            <div className="mt-5 space-y-4">
              {Object.entries(usage.overview.requestedByFeature).map(([feature, count]) => (
                <div key={feature}>
                  <div className="mb-1 flex items-center justify-between gap-3 text-sm text-slate-700">
                    <span>{feature === "reply" ? "Reply suggestions" : feature === "summary" ? "Summaries" : feature === "rewrite" ? "Rewrites" : "Tag suggestions"}</span>
                    <span className="text-slate-500">{count}</span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-100">
                    <div className="h-3 rounded-full bg-blue-500" style={{ width: `${usage.overview.requests ? Math.max(6, Math.round((count / usage.overview.requests) * 100)) : 0}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DashboardAnalyticsAiAssistTeamTable rows={usage.teamMembers} />
        </>
      ) : null}

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
        <h4 className="text-base font-medium text-slate-900">Your AI usage</h4>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {[
            ["Requests", usage.viewer.requests],
            ["Used", usage.viewer.used],
            ["Acceptance", `${usage.viewer.acceptanceRate}%`]
          ].map(([label, value]) => (
            <div key={String(label)} className="rounded-lg border border-slate-200 bg-white px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">{label}</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{String(value)}</p>
            </div>
          ))}
        </div>
        {usage.viewerCanSeeTeamUsage ? (
          <p className="mt-4 text-sm text-slate-600">{`You've used ${usage.viewer.requests} of the team's ${usage.overview.requests} AI requests in this billing cycle.`}</p>
        ) : (
          <p className="mt-4 text-sm text-slate-600">
            Track your own AI Assist activity for this billing cycle.
          </p>
        )}
      </div>

      <DashboardAnalyticsAiAssistActivityLog activity={usage.activity} />
    </div>
  );
}
