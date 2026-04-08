"use client";

import { Button } from "../components/ui/Button";
import { DashboardModal } from "./dashboard-modal";

export function SettingsIntegrationsWebhookResponseModal({
  url,
  responseBody,
  onClose
}: {
  url: string;
  responseBody: string;
  onClose: () => void;
}) {
  return (
    <DashboardModal title="Webhook response" description={url} onClose={onClose} widthClass="max-w-[640px]">
      <div className="px-6 py-6">
        <pre className="max-h-[420px] overflow-auto rounded-xl border border-slate-200 bg-slate-950 px-4 py-4 text-sm leading-6 text-slate-100">
          {responseBody}
        </pre>
      </div>

      <div className="flex justify-end border-t border-slate-200 px-6 py-5">
        <Button type="button" variant="secondary" size="md" onClick={onClose}>
          Close
        </Button>
      </div>
    </DashboardModal>
  );
}
