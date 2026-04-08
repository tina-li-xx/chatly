"use client";

import { useState } from "react";
import { Button, ButtonLink } from "../components/ui/Button";
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
      <div className="space-y-6 px-6 py-6">
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
      </div>

      <div className="flex justify-end border-t border-slate-200 px-6 py-5">
        <Button type="button" size="md" onClick={onClose}>
          Done
        </Button>
      </div>
    </DashboardModal>
  );
}
