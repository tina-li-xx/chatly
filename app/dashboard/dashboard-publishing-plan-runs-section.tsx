import type { DashboardPublishingSeoSnapshot } from "@/lib/data/dashboard-publishing-seo";
import { DashboardPublishingGenerateDraftButton } from "./dashboard-publishing-generate-draft-button";
import {
  formatPublishingPriorityLabel,
  formatPublishingSnapshotDate
} from "./dashboard-publishing-formatting";
import { DashboardPublishingRegenerateButton } from "./dashboard-publishing-regenerate-button";
import { formatPublishingAnalysisLabel } from "./dashboard-publishing-analysis-label";
import { SettingsCard, SettingsSectionHeader } from "./dashboard-settings-shared";

export function DashboardPublishingPlanRunsSection({
  snapshot
}: {
  snapshot: DashboardPublishingSeoSnapshot;
}) {
  const currentRun = snapshot.planRuns.find((run) => run.role === "current") ?? null;
  const upcomingRun = snapshot.planRuns.find((run) => run.role === "upcoming") ?? null;
  const historicalRuns = snapshot.planRuns.filter((run) => run.role === "historical");
  const remainingItems = currentRun?.items.filter((item) => item.status === "planned") ?? [];

  return (
    <div className="space-y-6">
      <SettingsSectionHeader
        title="Plan runs"
        subtitle="This is the actual 30-day SEO plan Chatting is working from, ranked and spaced from the current stored keyword research layer."
      />

      {snapshot.planRuns.length === 0 ? (
        <SettingsCard>
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">No plan runs yet.</div>
        </SettingsCard>
      ) : (
        <div className="space-y-6">
          {currentRun ? (
            <SettingsCard
              title="Current 30-day plan"
              description={`${remainingItems.length} topics still waiting for drafts • ${formatPublishingAnalysisLabel({
                analysisSource: currentRun.analysisSource,
                researchSource: currentRun.researchSource
              })} analysis • generated ${formatPublishingSnapshotDate(currentRun.generatedAt)}`}
            >
              {currentRun.summary ? <p className="text-sm leading-6 text-slate-700">{currentRun.summary}</p> : null}
              {remainingItems.length ? (
                <div className="mt-5 grid gap-3 lg:grid-cols-2">
                  {remainingItems.map((item) => (
                    <div key={item.id} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <p className="font-semibold text-slate-900">
                          Day {item.position}: {item.title}
                        </p>
                        <p className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold tracking-[0.01em] text-slate-600">
                          {formatPublishingPriorityLabel(item.priorityScore)}
                        </p>
                      </div>
                      <p className="mt-1 text-sm text-slate-500">{item.targetKeyword} • {item.searchIntent} • {item.categorySlug}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{item.rationale}</p>
                      <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-slate-200 pt-3">
                        <DashboardPublishingGenerateDraftButton targetId={item.id} />
                        <DashboardPublishingRegenerateButton kind="plan-item" targetId={item.id} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-5 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                  Every topic in the current plan already has a draft. Review them in Drafts or Queue.
                </div>
              )}
            </SettingsCard>
          ) : null}

          {upcomingRun ? (
            <SettingsCard
              title="Upcoming 30-day run"
              description={`${upcomingRun.itemCount} topics already queued after the current run • generated ${formatPublishingSnapshotDate(upcomingRun.generatedAt)}`}
            >
              {upcomingRun.summary ? <p className="text-sm leading-6 text-slate-700">{upcomingRun.summary}</p> : null}
              <div className="mt-5 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                This next run stays separate until the current run is exhausted.
              </div>
            </SettingsCard>
          ) : null}

          {historicalRuns.length ? (
            <SettingsCard title="Recent runs" description="Older runs stay here for comparison after the newest plan takes over.">
              <div className="space-y-3 text-sm text-slate-700">
                {historicalRuns.map((run) => (
                  <div key={run.id} className="rounded-xl border border-slate-200 px-4 py-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="font-mono text-xs text-slate-500">{run.id}</p>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{run.status} • {formatPublishingSnapshotDate(run.generatedAt)}</p>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{run.summary || `${run.itemCount} planned topics.`}</p>
                  </div>
                ))}
              </div>
            </SettingsCard>
          ) : null}
        </div>
      )}
    </div>
  );
}
