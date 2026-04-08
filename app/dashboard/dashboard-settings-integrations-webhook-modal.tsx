"use client";

import { useState } from "react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { useToast } from "../ui/toast-provider";
import { DashboardModal } from "./dashboard-modal";
import {
  IntegrationCheckbox,
  IntegrationFieldLabel
} from "./dashboard-settings-integrations-primitives";
import {
  WEBHOOK_EVENT_OPTIONS,
  type DashboardWebhookEndpoint,
  type SaveWebhookInput,
  type WebhookEventKey
} from "./dashboard-integrations-types";

export function SettingsIntegrationsWebhookModal({
  webhook,
  onClose,
  onSave
}: {
  webhook: DashboardWebhookEndpoint | null;
  onClose: () => void;
  onSave: (input: SaveWebhookInput) => void;
}) {
  const { showToast } = useToast();
  const [url, setUrl] = useState(webhook?.url ?? "https://");
  const [secret, setSecret] = useState(webhook?.secret ?? "");
  const [events, setEvents] = useState<WebhookEventKey[]>(webhook?.events ?? ["conversation.created", "conversation.resolved"]);

  function toggleEvent(value: WebhookEventKey, checked: boolean) {
    setEvents((current) => (checked ? [...current, value] : current.filter((event) => event !== value)));
  }

  function handleSave() {
    if (!/^https:\/\/.+/i.test(url.trim())) {
      showToast("error", "Enter a valid HTTPS endpoint.", "We only send webhooks to secure URLs.");
      return;
    }

    if (events.length === 0) {
      showToast("error", "Choose at least one event.", "That tells Chatting which payloads to send.");
      return;
    }

    onSave({ id: webhook?.id, url: url.trim(), events, secret: secret.trim() });
  }

  return (
    <DashboardModal title={webhook ? "Edit webhook" : "Add webhook"} onClose={onClose} widthClass="max-w-[720px]">
      <div className="space-y-6 px-6 py-6">
        <div className="space-y-3">
          <IntegrationFieldLabel>Endpoint URL</IntegrationFieldLabel>
          <Input value={url} onChange={(event) => setUrl(event.currentTarget.value)} />
          <p className="text-sm leading-6 text-slate-500">We&apos;ll POST JSON to this URL when events occur.</p>
        </div>

        <div className="space-y-4 border-t border-slate-200 pt-6">
          <IntegrationFieldLabel>Events to send</IntegrationFieldLabel>
          <div className="space-y-2">
            {WEBHOOK_EVENT_OPTIONS.map((option) => (
              <IntegrationCheckbox
                key={option.value}
                checked={events.includes(option.value)}
                label={option.label}
                description={option.description}
                onChange={(checked) => toggleEvent(option.value, checked)}
              />
            ))}
          </div>
        </div>

        <div className="space-y-3 border-t border-slate-200 pt-6">
          <IntegrationFieldLabel>Secret (optional)</IntegrationFieldLabel>
          <Input value={secret} onChange={(event) => setSecret(event.currentTarget.value)} placeholder="whsec_..." />
          <p className="text-sm leading-6 text-slate-500">Used to sign payloads. Verify with the `X-Chatting-Signature` header.</p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-5">
        <Button type="button" variant="secondary" size="md" onClick={onClose}>
          Cancel
        </Button>
        <Button type="button" size="md" onClick={handleSave}>
          {webhook ? "Save webhook" : "Save webhook"}
        </Button>
      </div>
    </DashboardModal>
  );
}
