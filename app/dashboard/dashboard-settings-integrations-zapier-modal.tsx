"use client";

import { useState } from "react";
import { Button, ButtonLink } from "../components/ui/Button";
import {
  CHATTING_ZAPIER_API_REFERENCE_PATH,
  CHATTING_ZAPIER_SETUP_GUIDE_PATH,
  CHATTING_ZAPIER_STARTER_WORKFLOWS
} from "@/lib/chatting-zapier-starter-workflows";
import { useToast } from "../ui/toast-provider";
import { DashboardModal } from "./dashboard-modal";
import { IntegrationFieldLabel } from "./dashboard-settings-integrations-primitives";
import { ZAPIER_ACTION_OPTIONS, ZAPIER_TRIGGER_OPTIONS } from "./dashboard-integrations-types";

const ZAPIER_APP_URL =
  process.env.NEXT_PUBLIC_ZAPIER_APP_URL?.trim() || "https://zapier.com/apps";

export function SettingsIntegrationsZapierModal({
  apiKey,
  onClose,
  onActivate
}: {
  apiKey: string;
  onClose: () => void;
  onActivate: () => Promise<void> | void;
}) {
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (!navigator.clipboard?.writeText) {
      showToast("error", "Clipboard unavailable.", "Copy the API key manually for now.");
      return;
    }

    try {
      await navigator.clipboard.writeText(apiKey);
      setCopied(true);
      await onActivate();
      showToast("success", "API key copied");
    } catch {
      showToast("error", "We couldn't copy that just now.", "Please try again in a moment.");
    }
  }

  return (
    <DashboardModal title="Connect to Zapier" onClose={onClose} widthClass="max-w-[680px]">
      <div className="max-h-[calc(100vh-220px)] space-y-6 overflow-y-auto px-6 py-6">
        <div className="space-y-2 text-sm leading-6 text-slate-600">
          <p>1. Open Zapier and create a new Zap</p>
          <p>2. Search for &quot;Chatting&quot; as your trigger app</p>
          <p>3. Paste this API key when prompted:</p>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
          <code className="min-w-0 flex-1 truncate text-sm text-slate-800">{apiKey}</code>
          <Button type="button" variant="secondary" size="md" onClick={handleCopy}>
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>

        <ButtonLink href={ZAPIER_APP_URL} target="_blank" rel="noreferrer" size="md">
          Open Chatting in Zapier
        </ButtonLink>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
          <a href={CHATTING_ZAPIER_SETUP_GUIDE_PATH} className="font-medium text-blue-700 transition hover:text-blue-800">
            View setup guide
          </a>
          <span className="text-slate-300" aria-hidden="true">
            •
          </span>
          <a href={CHATTING_ZAPIER_API_REFERENCE_PATH} className="font-medium text-blue-700 transition hover:text-blue-800">
            View API reference
          </a>
        </div>

        <div className="grid gap-6 border-t border-slate-200 pt-6 md:grid-cols-2">
          <div className="space-y-3">
            <IntegrationFieldLabel>Available triggers</IntegrationFieldLabel>
            <ul className="space-y-2 text-sm leading-6 text-slate-600">
              {ZAPIER_TRIGGER_OPTIONS.map((item) => (
                <li key={item}>- {item}</li>
              ))}
            </ul>
          </div>
          <div className="space-y-3">
            <IntegrationFieldLabel>Available actions</IntegrationFieldLabel>
            <ul className="space-y-2 text-sm leading-6 text-slate-600">
              {ZAPIER_ACTION_OPTIONS.map((item) => (
                <li key={item}>- {item}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
          <div className="border-b border-slate-200 px-4 py-3">
            <IntegrationFieldLabel>Starter workflows to copy</IntegrationFieldLabel>
          </div>
          <div className="divide-y divide-slate-200">
            {CHATTING_ZAPIER_STARTER_WORKFLOWS.map((workflow) => (
              <div key={workflow.name} className="space-y-2 bg-white px-4 py-4">
                <p className="text-sm font-semibold text-slate-900">{workflow.name}</p>
                <p className="text-sm leading-6 text-slate-600">{workflow.description}</p>
                <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-400">Build with</p>
                <p className="text-sm text-slate-700">{workflow.recipe}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end border-t border-slate-200 px-6 py-5">
        <Button type="button" size="md" onClick={onClose}>
          Done
        </Button>
      </div>
    </DashboardModal>
  );
}
