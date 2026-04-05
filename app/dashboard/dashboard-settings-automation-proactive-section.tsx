"use client";

import { useState } from "react";
import type { DashboardBillingSummary } from "@/lib/data/billing-types";
import { getAutomationPromptLimit } from "@/lib/plan-limits";
import type { DashboardAutomationPagePrompt, DashboardAutomationSettings } from "@/lib/data/settings-types";
import { Button } from "../components/ui/Button";
import { AutomationEmptyState, AutomationSectionCard, AutomationUpgradeCard } from "./dashboard-settings-automation-ui";
import { promptDelayLabel } from "./dashboard-settings-automation-options";
import {
  createProactivePrompt,
  isEmptyProactivePrompt,
  proactiveLimitCopy,
  reorderProactivePrompts,
  proactiveUpgradeDescription,
  proactiveUpgradeTitle,
  PROACTIVE_MESSAGE_EXAMPLES
} from "./dashboard-settings-automation-proactive-helpers";
import { SettingsAutomationProactiveRulesList } from "./dashboard-settings-automation-proactive-list";
import { PlusIcon, SendIcon } from "./dashboard-ui";

export function SettingsAutomationProactiveSection({
  automation,
  billing,
  onChange,
  onAnnounce
}: {
  automation: DashboardAutomationSettings;
  billing: DashboardBillingSummary;
  onChange: (updater: (current: DashboardAutomationSettings) => DashboardAutomationSettings) => void;
  onAnnounce: (message: string) => void;
}) {
  const [expandedPromptId, setExpandedPromptId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [dragPromptId, setDragPromptId] = useState<string | null>(null);
  const [dropPromptId, setDropPromptId] = useState<string | null>(null);
  const limit = getAutomationPromptLimit(billing.planKey);
  const prompts = automation.proactive.pagePrompts;
  const atLimit = limit !== null && prompts.length >= limit;
  const resolvedExpandedPromptId =
    prompts.some((prompt) => prompt.id === expandedPromptId) ? expandedPromptId : prompts.length === 1 ? prompts[0].id : null;
  const updatePagePrompts = (updater: (prompts: DashboardAutomationPagePrompt[]) => DashboardAutomationPagePrompt[]) =>
    onChange((current) => ({ ...current, proactive: { ...current.proactive, pagePrompts: updater(current.proactive.pagePrompts) } }));
  const clearDragState = () => {
    setDropPromptId(null);
    setDragPromptId(null);
  };
  const openPrompt = (promptId: string) => {
    setExpandedPromptId(promptId);
    setPendingDeleteId(null);
  };

  const addRule = () => {
    const prompt = createProactivePrompt();
    openPrompt(prompt.id);
    updatePagePrompts((currentPrompts) => [...currentPrompts, prompt]);
    onAnnounce("Proactive message rule added.");
  };

  const updatePrompt = (id: string, updater: (prompt: DashboardAutomationPagePrompt) => DashboardAutomationPagePrompt) =>
    updatePagePrompts((currentPrompts) => currentPrompts.map((prompt) => (prompt.id === id ? updater(prompt) : prompt)));

  const deletePrompt = (id: string) => {
    setPendingDeleteId(null);
    setExpandedPromptId((current) => (current === id ? null : current));
    updatePagePrompts((currentPrompts) => currentPrompts.filter((prompt) => prompt.id !== id));
    onAnnounce("Proactive message rule deleted.");
  };

  const reorderPrompt = (promptId: string, targetPromptId: string) => {
    updatePagePrompts((currentPrompts) => reorderProactivePrompts(currentPrompts, promptId, targetPromptId));
    clearDragState();
  };
  const requestDelete = (prompt: DashboardAutomationPagePrompt) => {
    if (isEmptyProactivePrompt(prompt)) {
      deletePrompt(prompt.id);
      return;
    }
    setPendingDeleteId(prompt.id);
  };

  return (
    <AutomationSectionCard title="Proactive messages" description="Show different messages on different pages" icon={SendIcon}>
      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-6">
          <div className="max-w-2xl">
            <p className="max-w-2xl text-sm leading-6 text-slate-600">
              When a visitor lands on a matching page, we&apos;ll show your message after the delay you set. Great for
              pricing pages, checkout, or high-intent pages where visitors might need help.
            </p>
          </div>
          <button
            type="button"
            disabled={atLimit}
            className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap text-sm font-medium text-blue-600 transition hover:text-blue-700 disabled:cursor-not-allowed disabled:text-slate-300"
            onClick={addRule}
          >
            <PlusIcon className="h-4 w-4" />
            Add rule
          </button>
        </div>

        <div className="space-y-5 px-6 py-6">
          {prompts.length ? (
            <>
              <SettingsAutomationProactiveRulesList
                prompts={prompts}
                expandedPromptId={resolvedExpandedPromptId}
                pendingDeleteId={pendingDeleteId}
                dragPromptId={dragPromptId}
                dropPromptId={dropPromptId}
                renderDeleteRequest={requestDelete}
                onExpand={openPrompt}
                onCollapse={() => setExpandedPromptId(null)}
                onUpdatePrompt={(promptId, next) => updatePrompt(promptId, () => next)}
                onCancelDelete={() => setPendingDeleteId(null)}
                onConfirmDelete={deletePrompt}
                onDragStart={(promptId) => {
                  setDragPromptId(promptId);
                  setDropPromptId(promptId);
                }}
                onDragEnd={clearDragState}
                onDragEnter={(promptId) => (event) => {
                  event.preventDefault();
                  if (dragPromptId) setDropPromptId(promptId);
                }}
                onDragOver={(promptId) => (event) => {
                  event.preventDefault();
                  if (dragPromptId && dropPromptId !== promptId) setDropPromptId(promptId);
                }}
                onDrop={(promptId) => (event) => {
                  event.preventDefault();
                  if (dragPromptId) reorderPrompt(dragPromptId, promptId);
                }}
              />

              {!atLimit ? (
                <button
                  type="button"
                  className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 px-4 py-4 text-sm font-medium text-slate-500 transition hover:border-blue-200 hover:bg-slate-50 hover:text-blue-600"
                  onClick={addRule}
                >
                  <PlusIcon className="h-4 w-4" />
                  Add rule
                </button>
              ) : null}

              <div className="space-y-2">
                <p className="text-sm text-slate-500">Rules are checked top to bottom. First match wins.</p>
                {limit !== null ? (
                  <p className="text-sm text-slate-400">{proactiveLimitCopy(limit, prompts.length, billing.planName)}</p>
                ) : null}
              </div>
            </>
          ) : (
            <div className="space-y-5">
              <AutomationEmptyState
                icon={<SendIcon className="h-6 w-6" />}
                title="No proactive messages yet"
                description="Reach out to visitors on high-intent pages like pricing, checkout, or demo request forms."
                action={
                  <Button type="button" size="md" onClick={addRule}>Add your first rule</Button>
                }
              />

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-400">Common starting points</p>
                <div className="mt-4 grid gap-3 lg:grid-cols-2">
                  {PROACTIVE_MESSAGE_EXAMPLES.slice(0, 4).map((example) => (
                    <div key={example.pagePath} className="rounded-xl border border-slate-200 bg-white px-4 py-4">
                      <p className="text-sm font-semibold text-slate-900">{example.pagePath}</p>
                      <p className="mt-1 text-sm text-slate-600">&quot;{example.message}&quot;</p>
                      <p className="mt-2 text-xs text-slate-400">{promptDelayLabel(example.delaySeconds)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {atLimit ? (
            <AutomationUpgradeCard
              title={proactiveUpgradeTitle(limit ?? 1)}
              description={proactiveUpgradeDescription(billing.planKey)}
              actionLabel="Upgrade now →"
            />
          ) : null}
        </div>
      </div>
    </AutomationSectionCard>
  );
}
