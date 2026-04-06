"use client";

import type { ReactNode } from "react";
import type { BillingPlanKey } from "@/lib/billing-plans";
import type { DashboardAiAssistSettings } from "@/lib/data/settings-ai-assist";
import type { DashboardAiAssistUsageSnapshot } from "@/lib/data/settings-ai-assist-usage";
import { ButtonLink } from "../components/ui/Button";
import { SettingsCard, SettingsSectionHeader, ToggleRow } from "./dashboard-settings-shared";
import { SettingsAiAssistActivityCard } from "./dashboard-settings-ai-assist-activity-card";

export function SettingsAiAssistSection({
  title,
  subtitle,
  headerActions,
  aiAssist,
  planKey,
  usage,
  onUpdateAiAssist
}: {
  title: string;
  subtitle: string;
  headerActions?: ReactNode;
  aiAssist: DashboardAiAssistSettings;
  planKey: BillingPlanKey;
  usage?: DashboardAiAssistUsageSnapshot;
  onUpdateAiAssist: <K extends keyof DashboardAiAssistSettings>(
    key: K,
    value: DashboardAiAssistSettings[K]
  ) => void;
}) {
  const aiAssistUnlocked = planKey === "starter" || planKey === "growth";

  return (
    <div className="space-y-6">
      <SettingsSectionHeader title={title} subtitle={subtitle} actions={headerActions} />

      <SettingsCard
        title="Inbox AI assist"
        description="Small, useful AI features that help your team reply faster while keeping humans in control."
      >
        {aiAssistUnlocked ? (
          <div className="space-y-3">
            <ToggleRow
              label="Reply suggestions"
              description="Show AI reply suggestions in the composer."
              checked={aiAssist.replySuggestionsEnabled}
              onChange={(value) => onUpdateAiAssist("replySuggestionsEnabled", value)}
            />
            <ToggleRow
              label="Conversation summaries"
              description="Summarize long conversations with one click."
              checked={aiAssist.conversationSummariesEnabled}
              onChange={(value) => onUpdateAiAssist("conversationSummariesEnabled", value)}
            />
            <ToggleRow
              label="Rewrite assistance"
              description="Rewrite selected draft text with a different tone."
              checked={aiAssist.rewriteAssistanceEnabled}
              onChange={(value) => onUpdateAiAssist("rewriteAssistanceEnabled", value)}
            />
            <ToggleRow
              label="Suggested tags"
              description="Suggest tags after conversations are resolved."
              checked={aiAssist.suggestedTagsEnabled}
              onChange={(value) => onUpdateAiAssist("suggestedTagsEnabled", value)}
            />
          </div>
        ) : (
          <div className="rounded-xl border border-purple-200 bg-purple-50 px-5 py-5">
            <p className="text-sm font-semibold text-purple-700">AI Assist is not available on this plan</p>
            <p className="mt-2 text-sm leading-6 text-purple-700">
              Upgrade to use AI suggestions, summaries, rewrites, and suggested tags in the inbox.
            </p>
            <div className="mt-4">
              <ButtonLink href="/dashboard/settings?section=billing" size="md">
                Upgrade to Growth →
              </ButtonLink>
            </div>
          </div>
        )}
      </SettingsCard>

      <SettingsAiAssistActivityCard usage={usage} />
    </div>
  );
}
