import { formatBlogDate } from "@/lib/blog-utils";
import type { DashboardPublishingSeoSnapshot } from "@/lib/data/dashboard-publishing-seo";
import { formatPublishingAnalysisLabel } from "./dashboard-publishing-analysis-label";
import { SettingsCard, SettingsSectionHeader } from "./dashboard-settings-shared";

function statusTone(status: "ready" | "unavailable") {
  return status === "ready"
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : "border-amber-200 bg-amber-50 text-amber-700";
}

export function DashboardPublishingOverviewSection({
  snapshot,
  queuedPostCount
}: {
  snapshot: DashboardPublishingSeoSnapshot;
  queuedPostCount: number;
}) {
  const latestPlan = snapshot.planRuns[0];
  const stats = [
    { label: "Themes", value: snapshot.profile.themes.length },
    { label: "Competitors", value: snapshot.profile.competitors.length },
    { label: "Plan runs", value: snapshot.planRuns.length },
    { label: "Queued posts", value: queuedPostCount }
  ];
  const topKeywords = snapshot.analysis?.keywordOpportunities.slice(0, 3) ?? [];

  return (
    <div className="space-y-6">
      <SettingsSectionHeader
        title="SEO Autopilot"
        subtitle="Chatting's internal publishing workspace now separates live analysis, planning, drafts, and queue review into focused internal panes."
        actions={
          <div className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${statusTone(snapshot.database.status)}`}>
            {snapshot.database.message}
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <SettingsCard key={stat.label} className="p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{stat.label}</p>
            <p className="mt-3 font-serif text-3xl font-semibold tracking-[-0.02em] text-slate-900">{stat.value}</p>
          </SettingsCard>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <SettingsCard
          title="Live analysis"
          description={
            snapshot.analysis
              ? `${formatPublishingAnalysisLabel({
                  analysisSource: snapshot.analysis.source,
                  researchSource: snapshot.analysis.researchSource
                })} analysis updated ${formatBlogDate(snapshot.analysis.generatedAt)}.`
              : "Analysis could not be generated for this view."
          }
        >
          {snapshot.analysis ? (
            <div className="space-y-4 text-sm text-slate-700">
              <p className="leading-6 text-slate-700">{snapshot.analysis.summary}</p>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Top keyword opportunities</p>
                <div className="mt-3 space-y-2">
                  {topKeywords.map((keyword) => (
                    <div key={keyword.keyword} className="rounded-xl bg-slate-50 px-4 py-3">
                      <p className="font-semibold text-slate-900">{keyword.keyword}</p>
                      <p className="mt-1 text-slate-500">{keyword.audienceLabel} • {keyword.intent}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
              Analysis is unavailable right now.
            </div>
          )}
        </SettingsCard>

        <SettingsCard title="Latest pipeline state" description="This pane shows what the internal SEO workflow has already generated into planning and draft state.">
          <div className="space-y-4 text-sm text-slate-700">
            <div className="rounded-xl bg-slate-50 px-4 py-3">
              <p className="font-semibold text-slate-900">Latest plan run</p>
              <p className="mt-1 text-slate-600">{latestPlan ? `${latestPlan.itemCount} items saved for review.` : "No plan run has been saved yet."}</p>
            </div>
            <div className="rounded-xl bg-slate-50 px-4 py-3">
              <p className="font-semibold text-slate-900">Generated drafts</p>
              <p className="mt-1 text-slate-600">
                {snapshot.drafts.length ? `${snapshot.drafts.length} draft${snapshot.drafts.length === 1 ? "" : "s"} saved.` : "No generated drafts yet."}
              </p>
            </div>
            <div className="rounded-xl bg-blue-50 px-4 py-3 text-blue-900">
              <p className="font-semibold">Next step</p>
              <p className="mt-1 text-sm leading-6 text-blue-800">Use the Analysis pane to inspect buyer, competitor, and keyword findings before moving into plan runs and the publishing queue.</p>
            </div>
          </div>
        </SettingsCard>
      </div>
    </div>
  );
}
