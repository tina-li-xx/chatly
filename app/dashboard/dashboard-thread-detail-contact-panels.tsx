"use client";

import Link from "next/link";
import type { ContactDetail, ContactStatusDefinition } from "@/lib/contact-types";
import { formatDateTime } from "@/lib/utils";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { DashboardContactAvatar } from "./dashboard-contact-avatar";
import { DashboardContactStatusBadge } from "./dashboard-contact-status-badge";

export function ThreadCustomerContext({
  contact,
  statuses
}: {
  contact: ContactDetail | null;
  statuses: ContactStatusDefinition[];
}) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-[11px] font-medium uppercase tracking-[0.05em] text-slate-400">Customer context</h3>
        {contact && statuses.length ? (
          <DashboardContactStatusBadge statusKey={contact.status} statuses={statuses} />
        ) : null}
      </div>
      {contact ? (
        <div className="space-y-3 text-[13px]">
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-3">
            <DashboardContactAvatar name={contact.name} avatarUrl={contact.avatarUrl} size="sm" />
            <div className="min-w-0">
              <p className="truncate font-medium text-slate-900">{contact.name}</p>
              <p className="truncate text-slate-500">{contact.email}</p>
            </div>
          </div>
          <ContextRow label="Company" value={contact.company || "—"} />
          <ContextRow label="Phone" value={contact.phone || "—"} />
          <ContextRow label="First seen" value={formatDateTime(contact.firstSeenAt)} />
          <ContextRow label="Conversations" value={String(contact.conversationCount)} />
          {Object.entries(contact.customFields).slice(0, 2).map(([key, value]) => (
            <ContextRow key={key} label={key.replace(/-/g, " ")} value={value} />
          ))}
        </div>
      ) : (
        <div className="space-y-2 animate-pulse">
          <div className="h-4 rounded bg-slate-100" />
          <div className="h-4 rounded bg-slate-100" />
          <div className="h-4 rounded bg-slate-100" />
        </div>
      )}
    </section>
  );
}

export function ThreadContactTags({
  contact,
  draftTag,
  onDraftTagChange,
  onSavePatch
}: {
  contact: ContactDetail;
  draftTag: string;
  onDraftTagChange: (value: string) => void;
  onSavePatch: (payload: Record<string, unknown>) => Promise<void>;
}) {
  return (
    <section>
      <h3 className="mb-3 text-[11px] font-medium uppercase tracking-[0.05em] text-slate-400">Contact tags</h3>
      <div className="flex flex-wrap gap-2">
        {contact.tags.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => void onSavePatch({ tags: contact.tags.filter((entry) => entry !== tag) })}
            className="rounded-full bg-blue-100 px-2.5 py-1 text-xs text-blue-700"
          >
            {tag} ×
          </button>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <Input value={draftTag} onChange={(event) => onDraftTagChange(event.currentTarget.value)} placeholder="Add tag" />
        <Button
          type="button"
          size="md"
          onClick={() => {
            const tag = draftTag.trim().toLowerCase();
            if (!tag) {
              return;
            }
            onDraftTagChange("");
            void onSavePatch({ tags: Array.from(new Set([...contact.tags, tag])) });
          }}
        >
          Add
        </Button>
      </div>
    </section>
  );
}

export function ThreadContactNotes({
  contact,
  onAddNote,
  onEditNote
}: {
  contact: ContactDetail;
  onAddNote: () => void;
  onEditNote: (noteId: string) => void;
}) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-[11px] font-medium uppercase tracking-[0.05em] text-slate-400">Notes</h3>
        <Button type="button" variant="secondary" size="md" onClick={onAddNote}>
          Add note
        </Button>
      </div>
      <div className="space-y-3">
        {contact.notes.length ? contact.notes.slice(0, 2).map((note) => (
          <div key={note.id} className="rounded-lg bg-slate-50 px-3 py-3 text-[13px]">
            <p className="leading-6 text-slate-700">{note.body}</p>
            <div className="mt-2 flex items-center justify-between gap-3 text-xs text-slate-400">
              <span>{note.authorName} · {formatDateTime(note.updatedAt)}</span>
              <button type="button" onClick={() => onEditNote(note.id)} className="text-slate-500 hover:text-slate-700">Edit</button>
            </div>
          </div>
        )) : <p className="text-sm text-slate-400">No team notes yet.</p>}
      </div>
      <Link href={`/dashboard/visitors?tab=contacts&contact=${encodeURIComponent(contact.id)}`} className="mt-4 inline-flex text-sm font-medium text-blue-600 hover:text-blue-700">
        View full profile →
      </Link>
    </section>
  );
}

function ContextRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-slate-500">{label}</span>
      <span className="max-w-[180px] text-right text-slate-900">{value}</span>
    </div>
  );
}
