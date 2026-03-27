"use client";

import { formatDateTime, formatRelativeTime } from "@/lib/utils";
import { ChevronRightIcon, XIcon } from "./dashboard-ui";
import { formatDuration, type VisitorRecord } from "./visitors-data";

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-3 text-[11px] font-medium uppercase tracking-[0.05em] text-slate-400">{title}</h3>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Rule() {
  return <div className="h-px bg-slate-200" />;
}

export function VisitorDetailsDrawer({
  visitor,
  onClose,
  onOpenConversation,
  onNavigateVisit
}: {
  visitor: VisitorRecord | null;
  onClose: () => void;
  onOpenConversation: () => void;
  onNavigateVisit: (conversationId: string) => void;
}) {
  if (!visitor) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 bg-slate-900/25" onClick={onClose}>
      <aside
        className="absolute bottom-0 right-0 top-0 flex w-full max-w-[400px] flex-col overflow-y-auto border-l border-slate-200 bg-white shadow-[-8px_0_30px_rgba(0,0,0,0.1)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-5">
          <p className="text-base font-medium text-slate-900">Visitor details</p>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close visitor details"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 p-5">
          <section className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-[22px] font-medium text-blue-700">
              {visitor.initials}
            </div>
            <p className="mt-3 text-[15px] font-medium text-slate-900">{visitor.name}</p>
            <p className="mt-1 text-[13px] text-slate-500">{visitor.email || "Anonymous visitor"}</p>
          </section>

          <Rule />

          <DetailSection title="Current session">
            {[
              ["Page", visitor.currentPage],
              ["Referrer", visitor.source],
              ["Location", visitor.location || "Unknown"],
              ["Browser", visitor.browser],
              ["Time on site", formatDuration(visitor.timeOnSiteSeconds)]
            ].map(([label, value]) => (
              <div key={label} className="flex items-start justify-between gap-3 text-[13px]">
                <span className="text-slate-500">{label}</span>
                <span className="text-right text-slate-900">{value}</span>
              </div>
            ))}
          </DetailSection>

          <Rule />

          <DetailSection title="Page history">
            {visitor.pageHistory.length ? (
              visitor.pageHistory.map((page, index) => (
                <div key={`${page.page}-${page.seenAt}-${index}`} className="border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-mono text-[13px] text-blue-600">{page.page}</span>
                    <span className="text-[13px] text-slate-500">{formatDuration(page.durationSeconds)}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">{formatRelativeTime(page.seenAt)}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400">No page history captured yet.</p>
            )}
          </DetailSection>

          <Rule />

          <DetailSection title="Visit history">
            {visitor.visitHistory.map((visit) => (
              <button
                key={visit.conversationId}
                type="button"
                onClick={() => onNavigateVisit(visit.conversationId)}
                className="block w-full rounded-lg bg-slate-50 px-3 py-3 text-left transition hover:bg-slate-100"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-[13px] text-blue-600">{visit.page}</span>
                  <span className="text-[13px] text-slate-500">{formatRelativeTime(visit.lastSeenAt)}</span>
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  Started {formatDateTime(visit.startedAt)} · Source {visit.source}
                </p>
              </button>
            ))}
          </DetailSection>

          <Rule />

          <DetailSection title="Conversations">
            <button
              type="button"
              onClick={onOpenConversation}
              className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Open latest conversation
              <ChevronRightIcon className="h-4 w-4" />
            </button>
            <p className="mt-2 text-sm text-slate-500">
              {visitor.conversationCount} conversation{visitor.conversationCount === 1 ? "" : "s"} recorded
            </p>
          </DetailSection>

          <Rule />

          <DetailSection title="Tags">
            <div className="flex flex-wrap gap-2">
              {visitor.tags.length ? (
                visitor.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-blue-100 px-2.5 py-1 text-xs text-blue-700">
                    {tag}
                  </span>
                ))
              ) : (
                <span className="text-sm text-slate-400">No tags yet.</span>
              )}
            </div>
          </DetailSection>

          <Rule />

          <DetailSection title="Notes">
            <div className="rounded-lg bg-slate-50 px-3 py-3 text-[13px] leading-6 text-slate-600">
              Notes will land here once visitor-level notes are added. For now, open the conversation to keep context close to the thread.
            </div>
          </DetailSection>
        </div>
      </aside>
    </div>
  );
}
