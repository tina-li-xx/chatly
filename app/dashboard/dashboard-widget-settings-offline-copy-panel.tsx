"use client";

import { Input } from "../components/ui/Input";
import { Textarea } from "../components/ui/Textarea";
import type { Site } from "@/lib/types";

const TITLE_LIMIT = 80;
const MESSAGE_LIMIT = 180;
const COPY_FIELDS = [
  {
    key: "offlineTitle",
    label: "Offline title",
    limit: TITLE_LIMIT,
    placeholder: "We're not online right now"
  },
  {
    key: "offlineMessage",
    label: "Offline message",
    limit: MESSAGE_LIMIT,
    placeholder: "Leave a message and we'll get back to you via email.",
    multiline: true
  },
  {
    key: "awayTitle",
    label: "Away title",
    limit: TITLE_LIMIT,
    placeholder: "We're away right now"
  },
  {
    key: "awayMessage",
    label: "Away message",
    limit: MESSAGE_LIMIT,
    placeholder: "Leave a message and we'll get back to you via email.",
    multiline: true
  }
] as const;

type OfflineCopyField = (typeof COPY_FIELDS)[number]["key"];

function FieldHint({ count, limit }: { count: number; limit: number }) {
  return <p className="mt-1.5 text-right text-xs text-slate-400">{count}/{limit}</p>;
}

export function WidgetOfflineCopyPanel({
  activeSite,
  onUpdateActiveSite
}: {
  activeSite: Site;
  onUpdateActiveSite: (updater: (site: Site) => Site) => void;
}) {
  function updateField(field: OfflineCopyField, value: string, limit: number) {
    onUpdateActiveSite((site) => ({ ...site, [field]: value.slice(0, limit) }));
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-4">
        <h3 className="text-sm font-medium text-slate-700">Offline and away copy</h3>
        <p className="mt-1 text-[13px] leading-5 text-slate-500">
          Customize what visitors see when nobody is available to reply live.
        </p>
      </div>

      <div className="space-y-4">
        {COPY_FIELDS.map((field) => (
          <div key={field.key}>
            <label className="mb-2 block text-sm font-medium text-slate-700">{field.label}</label>
            {field.multiline ? (
              <Textarea
                value={activeSite[field.key]}
                onChange={(event) => updateField(field.key, event.target.value, field.limit)}
                className="min-h-[96px] resize-none"
                placeholder={field.placeholder}
              />
            ) : (
              <Input
                value={activeSite[field.key]}
                onChange={(event) => updateField(field.key, event.target.value, field.limit)}
                placeholder={field.placeholder}
              />
            )}
            <FieldHint count={activeSite[field.key].length} limit={field.limit} />
          </div>
        ))}
      </div>
    </div>
  );
}
