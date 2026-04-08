"use client";

import { useState } from "react";
import type { BillingPlanKey } from "@/lib/billing-plans";
import { isPaidPlan } from "@/lib/billing-plans";
import { Button } from "../components/ui/Button";
import { useToast } from "../ui/toast-provider";
import { buildSettingsSectionHref } from "./dashboard-settings-section";
import { DashboardSettingsScaffold } from "./dashboard-settings-scaffold";
import { SettingsIntegrationsConfirmModal } from "./dashboard-settings-integrations-confirm-modal";
import {
  IntegrationsSkeletonGrid,
  IntegrationFieldLabel,
  IntegrationStatusBadge
} from "./dashboard-settings-integrations-primitives";
import { SettingsIntegrationsWebhookResponseModal } from "./dashboard-settings-integrations-webhook-response-modal";
import { SettingsIntegrationsWebhookModal } from "./dashboard-settings-integrations-webhook-modal";
import { ArrowLeftIcon, PlusIcon } from "./dashboard-ui";
import { useDashboardIntegrationsState } from "./use-dashboard-integrations-state";

export function DashboardSettingsIntegrationsWebhooksPage({ planKey }: { planKey: BillingPlanKey }) {
  const { showToast } = useToast();
  const { state, hydrated, saveWebhook, deleteWebhook, testWebhook } = useDashboardIntegrationsState();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [responseId, setResponseId] = useState<string | null>(null);
  const editingWebhook = state.webhooks.find((endpoint) => endpoint.id === editingId) ?? null;
  const deletingWebhook = state.webhooks.find((endpoint) => endpoint.id === deletingId) ?? null;
  const responseWebhook = state.webhooks.find((endpoint) => endpoint.id === responseId) ?? null;
  const unlocked = isPaidPlan(planKey);

  return (
    <DashboardSettingsScaffold activeSection="integrations" onSetActiveSection={() => {}} isDirty={false} isSaving={false} onDiscard={() => {}} onSave={() => {}}>
      <div className="space-y-6">
        <a href={buildSettingsSectionHref("integrations")} className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900">
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Integrations
        </a>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Webhooks</h2>
            <p className="mt-1 text-sm text-slate-500">Send events to any URL when things happen in Chatting</p>
          </div>
          <Button type="button" size="md" onClick={() => setEditingId("new")} leadingIcon={<PlusIcon className="h-4 w-4" />} disabled={!unlocked}>
            Add webhook
          </Button>
        </div>

        {!unlocked ? (
          <div className="rounded-xl border border-violet-200 bg-violet-50 px-6 py-6">
            <p className="text-sm font-semibold text-violet-700">Webhooks unlock on Growth</p>
            <p className="mt-2 text-sm leading-6 text-violet-700">Upgrade to Growth to send Chatting events to your own endpoints and automation tools.</p>
            <a href={buildSettingsSectionHref("billing")} className="mt-4 inline-flex h-11 items-center justify-center rounded-2xl border border-violet-200 bg-white px-5 text-sm font-semibold text-violet-700 transition hover:bg-violet-100">
              Upgrade to Growth
            </a>
          </div>
        ) : hydrated ? (
          <div className="space-y-4">
            {state.webhooks.map((webhook) => (
              <article key={webhook.id} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-base font-semibold text-slate-900">{webhook.url}</h3>
                      <IntegrationStatusBadge tone="success" label="Active" />
                    </div>
                    <p className="text-sm text-slate-500">Events: {webhook.events.join(", ")}</p>
                    <p className="text-sm text-slate-500">Last triggered: {webhook.lastTriggeredLabel}</p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button type="button" variant="secondary" size="md" onClick={() => setEditingId(webhook.id)}>
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="md"
                      onClick={() => {
                        const result = testWebhook(webhook.id);
                        showToast(result.tone, result.title, result.message);
                      }}
                    >
                      Test
                    </Button>
                    <button type="button" onClick={() => setDeletingId(webhook.id)} className="inline-flex h-11 items-center justify-center rounded-2xl px-1 text-sm font-medium text-slate-400 transition hover:text-red-600">
                      Delete
                    </button>
                  </div>
                </div>

                {webhook.lastTestTone ? (
                  <div className={`mt-5 rounded-xl border px-4 py-3 text-sm ${webhook.lastTestTone === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}>
                    <p className="font-medium">{webhook.lastTestTone === "success" ? "Test successful" : "Test failed"}</p>
                    <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
                      <p>{webhook.lastResponseLabel}</p>
                      {webhook.lastTestTone === "error" && webhook.lastResponseBody ? (
                        <Button type="button" variant="secondary" size="md" className="h-9 rounded-xl px-4 text-sm" onClick={() => setResponseId(webhook.id)}>
                          View response
                        </Button>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </article>
            ))}

            {state.webhooks.length > 0 ? (
              <button type="button" onClick={() => setEditingId("new")} className="flex w-full items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-8 text-sm font-medium text-slate-500 transition hover:border-blue-300 hover:text-blue-600">
                + Add webhook
              </button>
            ) : null}
          </div>
        ) : (
          <IntegrationsSkeletonGrid />
        )}

        {unlocked && hydrated && state.webhooks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
            <IntegrationFieldLabel>First endpoint</IntegrationFieldLabel>
            <p className="mt-3 text-base font-semibold text-slate-900">No webhooks yet</p>
            <p className="mt-2 text-sm leading-6 text-slate-500">Add an endpoint to start sending conversation, contact, and tag events.</p>
          </div>
        ) : null}
      </div>

      {unlocked && editingId ? (
        <SettingsIntegrationsWebhookModal
          webhook={editingId === "new" ? null : editingWebhook}
          onClose={() => setEditingId(null)}
          onSave={(input) => {
            saveWebhook(input);
            setEditingId(null);
            showToast("success", input.id ? "Webhook updated" : "Webhook added");
          }}
        />
      ) : null}

      {unlocked && deletingWebhook ? (
        <SettingsIntegrationsConfirmModal
          title="Delete webhook?"
          description={`You'll stop sending Chatting events to ${deletingWebhook.url}.`}
          confirmLabel="Delete webhook"
          onClose={() => setDeletingId(null)}
          onConfirm={() => {
            deleteWebhook(deletingWebhook.id);
            setDeletingId(null);
            showToast("success", "Webhook deleted");
          }}
        />
      ) : null}

      {responseWebhook?.lastResponseBody ? (
        <SettingsIntegrationsWebhookResponseModal url={responseWebhook.url} responseBody={responseWebhook.lastResponseBody} onClose={() => setResponseId(null)} />
      ) : null}
    </DashboardSettingsScaffold>
  );
}
