"use client";

import { ButtonLink } from "../components/ui/Button";
import { DashboardAiAssistActivityBadge } from "./dashboard-ai-assist-activity-badge";
import type { DashboardAiAssistUsageSnapshot } from "@/lib/data/settings-ai-assist-usage";
import {
  describeDashboardAiAssistActivity,
  explainDashboardAiAssistActivity,
  formatDashboardAiAssistConversationPreview
} from "@/lib/data/settings-ai-assist-activity-copy";
import {
  SettingsCard,
  SettingsCardBody,
  SettingsCardEmptyState,
  SettingsCardRow,
  SettingsCardRows
} from "./dashboard-settings-shared";

function dateLabel(value: string | null) {
  if (!value) {
    return "No activity yet";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

function resetLabel(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short"
  }).format(new Date(value));
}

function meterMessage(meter: DashboardAiAssistUsageSnapshot["meter"]) {
  if (meter.state === "limited") {
    return `Limit reached. AI features are paused until ${resetLabel(meter.resetsAt)}.`;
  }

  if (meter.state === "warning" && meter.remaining != null) {
    return `${meter.remaining} requests remaining in this billing cycle.`;
  }

  return `Requests used in this billing cycle. Resets ${resetLabel(meter.resetsAt)}.`;
}

function meterTone(meter: DashboardAiAssistUsageSnapshot["meter"]) {
  if (meter.state === "limited") {
    return "bg-red-500";
  }

  if (meter.state === "warning") {
    return "bg-amber-500";
  }

  return "bg-blue-500";
}

export function SettingsAiAssistActivityCard({
  usage
}: {
  usage?: DashboardAiAssistUsageSnapshot;
}) {
  if (!usage) {
    return null;
  }

  return (
    <SettingsCard
      title="Usage & Activity"
      description={
        usage.viewerCanSeeTeamUsage
          ? `Track ${usage.monthLabel} AI Assist requests, recent usage, and how much of the team's usage is yours.`
          : `Track ${usage.monthLabel} AI Assist usage and your recent activity.`
      }
    >
      <SettingsCardBody className="space-y-4">
        {usage.viewerCanSeeTeamUsage ? (
          <div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-200">
              <div
                className={`h-full rounded-full ${meterTone(usage.meter)}`}
                style={{
                  width: `${usage.meter.used === 0 ? 0 : Math.max(2, usage.meter.percentUsed)}%`
                }}
              />
            </div>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-medium text-slate-900">
                {usage.meter.limit == null
                  ? `${usage.meter.used} requests used`
                  : `${usage.meter.used} / ${usage.meter.limit} requests`}
              </p>
              {(usage.meter.state === "warning" || usage.meter.state === "limited") ? (
                <ButtonLink href="/dashboard/settings?section=billing" size="md">
                  Upgrade for more →
                </ButtonLink>
              ) : null}
            </div>
            <p className="mt-1 text-sm text-slate-600">{meterMessage(usage.meter)}</p>
          </div>
        ) : null}
        <div className="grid gap-3 md:grid-cols-3">
          {(usage.viewerCanSeeTeamUsage
            ? [
                ["Team requests", usage.overview.requests],
                ["Suggestions used", usage.overview.used],
                ["Your share", `${usage.viewer.teamSharePercent}%`]
              ]
            : [
                ["Your requests", usage.viewer.requests],
                ["Suggestions used", usage.viewer.used],
                ["Acceptance", `${usage.viewer.acceptanceRate}%`]
              ]).map(([label, value]) => (
            <div key={String(label)} className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                {label}
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{String(value)}</p>
            </div>
          ))}
        </div>
      </SettingsCardBody>
      <SettingsCardRows>
        {usage.activity.length ? (
          usage.activity.map((item) => {
            const explanation = explainDashboardAiAssistActivity(item);
            const conversationPreview = formatDashboardAiAssistConversationPreview(
              item.conversationPreview
            );

            return (
              <SettingsCardRow key={item.id}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{item.actorLabel}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <p className="text-sm text-slate-600">{describeDashboardAiAssistActivity(item)}</p>
                      <DashboardAiAssistActivityBadge item={item} explanation={explanation} />
                    </div>
                    {conversationPreview ? (
                      <p className="mt-1 truncate text-[13px] text-slate-500">
                        {conversationPreview}
                      </p>
                    ) : null}
                  </div>
                  <div className="text-[13px] text-slate-500">{dateLabel(item.createdAt)}</div>
                </div>
              </SettingsCardRow>
            );
          })
        ) : (
          <SettingsCardEmptyState>
            {usage.viewerCanSeeTeamUsage
              ? "AI Assist activity will appear here after your team starts using summaries, suggestions, rewrites, or suggested tags."
              : "Your AI Assist activity will appear here after you start using summaries, suggestions, rewrites, or suggested tags."}
          </SettingsCardEmptyState>
        )}
      </SettingsCardRows>
    </SettingsCard>
  );
}
