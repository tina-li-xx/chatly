"use client";

import { useState } from "react";
import {
  INTEGRATION_OAUTH_MESSAGE_TYPE
} from "@/lib/browser-event-contracts";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { IntegrationLogo } from "./dashboard-settings-integrations-primitives";

export function DashboardSettingsIntegrationsAuthPopup({
  provider,
  shopDomain
}: {
  provider: "slack" | "shopify";
  shopDomain?: string;
}) {
  const [workspaceName, setWorkspaceName] = useState("Acme Corp");

  function sendMessage(detail: Record<string, unknown>) {
    window.opener?.postMessage({ type: INTEGRATION_OAUTH_MESSAGE_TYPE, ...detail }, window.location.origin);
    window.close();
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#DBEAFE_0%,#F8FAFC_45%,#FFFFFF_100%)] px-5 py-10 text-slate-900">
      <div className="mx-auto max-w-[420px] rounded-[28px] border border-slate-200 bg-white p-8 shadow-[0_24px_60px_rgba(15,23,42,0.12)]">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3">
            <IntegrationLogo kind={provider === "slack" ? "slack" : "shopify"} />
            <div>
              <h1 className="font-serif text-[28px] font-semibold tracking-[-0.02em] text-slate-900">
                {provider === "slack" ? "Authorize Slack" : "Approve Shopify access"}
              </h1>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {provider === "slack"
                  ? "Choose a workspace, then authorize Chatting in the popup just like a standard Slack OAuth flow."
                  : "Review the store URL below, then approve access and return to Chatting."}
              </p>
            </div>
          </div>
        </div>

        {provider === "slack" ? (
          <div className="mt-8 space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Slack workspace</span>
              <Input value={workspaceName} onChange={(event) => setWorkspaceName(event.currentTarget.value)} />
            </label>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
              Chatting will ask for permission to post conversation notifications and let your team reply in threads.
            </div>
            <div className="flex items-center justify-end gap-3">
              <Button type="button" variant="secondary" size="md" onClick={() => window.close()}>
                Cancel
              </Button>
              <Button type="button" size="md" onClick={() => sendMessage({ provider: "slack", outcome: "success", workspaceName: workspaceName.trim() || "Acme Corp" })}>
                Authorize Chatting
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-8 space-y-5">
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="text-sm font-medium text-slate-900">Store</p>
              <p className="mt-1 text-sm text-slate-500">{shopDomain}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
              Chatting will read customer order history so your team can see recent purchases alongside live conversations.
            </div>
            <div className="flex items-center justify-end gap-3">
              <Button type="button" variant="secondary" size="md" onClick={() => window.close()}>
                Cancel
              </Button>
              <Button type="button" size="md" onClick={() => sendMessage({ provider: "shopify", outcome: "success", domain: shopDomain })}>
                Approve access
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
