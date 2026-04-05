"use client";

import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Textarea } from "../components/ui/Textarea";
import { DashboardModal } from "./dashboard-modal";

function appendTagSeparator(value: string) {
  const normalized = value.replace(/[\s,]+$/, "").trim();
  return normalized ? `${normalized}, ` : "";
}

export function DashboardSavedReplyModal({
  title,
  description,
  values,
  saving,
  onChange,
  onClose,
  onSave
}: {
  title: string;
  description: string;
  values: { title: string; body: string; tags: string };
  saving: boolean;
  onChange: (next: { title: string; body: string; tags: string }) => void;
  onClose: () => void;
  onSave: () => Promise<void>;
}) {
  return (
    <DashboardModal title={title} description={description} onClose={saving ? () => {} : onClose}>
      <div className="space-y-4 px-6 py-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Title</label>
          <Input
            value={values.title}
            onChange={(event) => onChange({ ...values, title: event.currentTarget.value })}
            placeholder="Pricing reply"
            maxLength={80}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Reply body</label>
          <Textarea
            value={values.body}
            onChange={(event) => onChange({ ...values, body: event.currentTarget.value })}
            placeholder="Thanks for reaching out..."
            rows={8}
            maxLength={4000}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Tags</label>
          <Input
            value={values.tags}
            onChange={(event) => onChange({ ...values, tags: event.currentTarget.value })}
            onKeyDown={(event) => {
              if (event.key !== "Enter") return;
              event.preventDefault();
              onChange({ ...values, tags: appendTagSeparator(values.tags) });
            }}
            placeholder="pricing, follow-up, onboarding"
            maxLength={200}
          />
          <p className="mt-2 text-xs text-slate-500">Optional. Use commas or press Enter to group related replies for the team.</p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4">
        <Button type="button" variant="secondary" size="md" onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button type="button" size="md" onClick={() => void onSave()} disabled={saving}>
          {saving ? "Saving..." : "Save reply"}
        </Button>
      </div>
    </DashboardModal>
  );
}
