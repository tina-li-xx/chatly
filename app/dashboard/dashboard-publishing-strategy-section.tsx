import { formatBlogDate } from "@/lib/blog-utils";
import type { DashboardPublishingSeoSnapshot } from "@/lib/data/dashboard-publishing-seo";
import { formatPublishingAnalysisLabel } from "./dashboard-publishing-analysis-label";
import { SettingsCard, SettingsSectionHeader } from "./dashboard-settings-shared";

export function DashboardPublishingStrategySection({
  snapshot
}: {
  snapshot: DashboardPublishingSeoSnapshot;
}) {
  const { profile } = snapshot;

  return (
    <div className="space-y-6">
      <SettingsSectionHeader
        title="Analysis"
        subtitle="This page combines live audience, competitor, and keyword analysis with Chatting's existing source-of-truth positioning."
      />

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <SettingsCard
          title="Live market readout"
          description={
            snapshot.analysis
              ? `${formatPublishingAnalysisLabel({
                  analysisSource: snapshot.analysis.source,
                  researchSource: snapshot.analysis.researchSource
                })} analysis updated ${formatBlogDate(snapshot.analysis.generatedAt)}.`
              : "Analysis is unavailable right now."
          }
        >
          {snapshot.analysis ? (
            <div className="space-y-5">
              <p className="text-sm leading-6 text-slate-700">{snapshot.analysis.summary}</p>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Audience insights</p>
                <div className="mt-3 space-y-3">
                  {snapshot.analysis.audienceInsights.map((item) => (
                    <div key={item.label} className="rounded-xl bg-slate-50 px-4 py-3">
                      <p className="font-semibold text-slate-900">{item.label}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{item.rationale}</p>
                      <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">{item.opportunity}</p>
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

        <SettingsCard title="Keyword opportunities" description="These are the highest-priority angles the analysis step believes Chatting can plausibly win next.">
          {snapshot.analysis ? (
            <div className="space-y-3">
              {snapshot.analysis.keywordOpportunities.slice(0, 6).map((item) => (
                <div key={item.keyword} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="font-semibold text-slate-900">{item.keyword}</p>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Score {item.priority}</p>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">{item.audienceLabel} • {item.intent} • {item.difficulty}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.rationale}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No keyword analysis is available right now.</p>
          )}
        </SettingsCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <SettingsCard title="Positioning">
          <ul className="space-y-2 text-sm leading-6 text-slate-700">
            {profile.positioning.map((item) => <li key={item}>• {item}</li>)}
          </ul>
        </SettingsCard>
        <SettingsCard title="Best-fit buyers">
          <ul className="space-y-2 text-sm leading-6 text-slate-700">
            {profile.bestFit.map((item) => <li key={item}>• {item}</li>)}
          </ul>
        </SettingsCard>
        <SettingsCard title="Best-fit content">
          <ul className="space-y-2 text-sm leading-6 text-slate-700">
            {profile.contentFit.map((item) => <li key={item}>• {item}</li>)}
          </ul>
        </SettingsCard>
        <SettingsCard title="Claims discipline">
          <ul className="space-y-2 text-sm leading-6 text-slate-700">
            {profile.claimsDiscipline.map((item) => <li key={item}>• {item}</li>)}
          </ul>
        </SettingsCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <SettingsCard title="Source of truth" description="Core product framing and SEO metadata are pulled from the existing Chatting marketing modules and docs.">
          <dl className="space-y-4 text-sm text-slate-700">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Canonical URL</dt>
              <dd className="mt-1 break-all text-slate-900">{profile.canonicalUrl}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">SEO title</dt>
              <dd className="mt-1 text-slate-900">{profile.seoTitle}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Pricing anchor</dt>
              <dd className="mt-1 text-slate-900">{profile.pricingAnchor}</dd>
            </div>
          </dl>
        </SettingsCard>

        <SettingsCard title="Competitors, themes, and CTAs">
          <div className="space-y-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Competitor framing</p>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {profile.competitors.map((competitor) => (
                  <div key={competitor.slug} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="font-medium text-slate-900">{competitor.name}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{competitor.summary}</p>
                  </div>
                ))}
              </div>
            </div>
            {snapshot.analysis ? (
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Competitor gaps from the analysis step</p>
                <div className="mt-3 space-y-3">
                  {snapshot.analysis.competitorFindings.map((item) => (
                    <div key={item.slug} className="rounded-xl bg-slate-50 px-4 py-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-semibold text-slate-900">{item.name}</p>
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{item.coverage}</p>
                      </div>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{item.finding}</p>
                      <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">{item.recommendedKeyword}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Content themes</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {profile.themes.map((theme) => (
                  <span key={theme.slug} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                    {theme.label}
                  </span>
                ))}
              </div>
            </div>
            {snapshot.analysis?.contentGaps.length ? (
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Current content gaps</p>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
                  {snapshot.analysis.contentGaps.map((item) => <li key={item}>• {item}</li>)}
                </ul>
              </div>
            ) : null}
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Primary CTAs</p>
              <div className="mt-3 space-y-2 text-sm text-slate-700">
                {profile.ctas.map((cta) => (
                  <p key={cta.id}>
                    <span className="font-semibold text-slate-900">{cta.label}</span>{" "}
                    <span className="font-mono text-xs text-slate-500">{cta.href}</span>
                  </p>
                ))}
              </div>
            </div>
          </div>
        </SettingsCard>
      </div>
    </div>
  );
}
