"use client";

import { useState } from "react";
import { Button } from "../components/ui/Button";
import { DashboardModal } from "./dashboard-modal";

export function SettingsIntegrationsConfirmModal({
  title,
  description,
  confirmLabel,
  note,
  onClose,
  onConfirm
}: {
  title: string;
  description: string;
  confirmLabel: string;
  note?: string;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
}) {
  const [submitting, setSubmitting] = useState(false);

  async function handleConfirm() {
    setSubmitting(true);

    try {
      await onConfirm();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <DashboardModal
      title={title}
      onClose={submitting ? () => {} : onClose}
      widthClass="max-w-[480px]"
    >
      <div className="space-y-4 px-6 py-6 text-sm leading-6 text-slate-600">
        <p>{description}</p>
        {note ? <p>{note}</p> : null}
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-5">
        <Button type="button" variant="secondary" size="md" onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <button
          type="button"
          onClick={() => void handleConfirm()}
          disabled={submitting}
          className="inline-flex h-11 items-center justify-center rounded-2xl bg-red-600 px-5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Working..." : confirmLabel}
        </button>
      </div>
    </DashboardModal>
  );
}
