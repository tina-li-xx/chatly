"use client";

import { useState } from "react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { useToast } from "../ui/toast-provider";
import { DashboardModal } from "./dashboard-modal";

function normalizeSlug(value: string) {
  return value.trim().replace(/\.myshopify\.com$/i, "").toLowerCase();
}

export function SettingsIntegrationsShopifyModal({
  initialDomain,
  onClose,
  onBeginAuth
}: {
  initialDomain: string;
  onClose: () => void;
  onBeginAuth: (domain: string) => void;
}) {
  const { showToast } = useToast();
  const [slug, setSlug] = useState(normalizeSlug(initialDomain));

  function handleConnect() {
    const normalized = normalizeSlug(slug);
    if (!/^[a-z0-9-]+$/.test(normalized)) {
      showToast("error", "Enter a valid Shopify store.", "Use only letters, numbers, and dashes.");
      return;
    }

    onBeginAuth(`${normalized}.myshopify.com`);
  }

  return (
    <DashboardModal title="Connect Shopify" onClose={onClose} widthClass="max-w-[560px]">
      <div className="space-y-6 px-6 py-6">
        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-900">Enter your Shopify store URL</p>
          <div className="flex overflow-hidden rounded-lg border border-slate-200">
            <Input value={slug} onChange={(event) => setSlug(event.currentTarget.value)} placeholder="your-store" className="rounded-none border-0 focus:ring-0" />
            <span className="flex items-center border-l border-slate-200 bg-slate-50 px-3 text-sm text-slate-500">.myshopify.com</span>
          </div>
          <p className="text-sm leading-6 text-slate-500">We&apos;ll send you through Shopify to approve access, then bring you back here.</p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-5">
        <Button type="button" variant="secondary" size="md" onClick={onClose}>
          Cancel
        </Button>
        <Button type="button" size="md" onClick={handleConnect}>
          Connect store
        </Button>
      </div>
    </DashboardModal>
  );
}
