"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { DashboardSavedReply } from "@/lib/data/settings-types";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { useToast } from "../ui/toast-provider";

function SavedRepliesPickerSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3].map((item) => (
        <div key={item} className="animate-pulse rounded-xl border border-slate-200 bg-white p-3">
          <div className="h-4 w-32 rounded bg-slate-100" />
          <div className="mt-2 h-3 w-full rounded bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

async function fetchSavedReplies() {
  const response = await fetch("/dashboard/saved-replies", { method: "GET", cache: "no-store" });
  const payload = (await response.json()) as { ok?: boolean; savedReplies?: DashboardSavedReply[]; error?: string };
  if (!response.ok || !payload.ok) {
    throw new Error(payload.error || "saved-replies-failed");
  }

  return payload.savedReplies ?? [];
}

export function DashboardSavedRepliesPicker({
  onSelectReply
}: {
  onSelectReply: (body: string) => void;
}) {
  const { showToast } = useToast();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [savedReplies, setSavedReplies] = useState<DashboardSavedReply[] | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  useEffect(() => {
    if (!open || savedReplies !== null) {
      return;
    }

    void fetchSavedReplies()
      .then(setSavedReplies)
      .catch((error) =>
        showToast("error", "We couldn't load saved replies.", error instanceof Error ? error.message : "Please try again in a moment.")
      );
  }, [open, savedReplies, showToast]);

  const filteredReplies = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return savedReplies ?? [];
    }

    return (savedReplies ?? []).filter((reply) =>
      `${reply.title}\n${reply.body}`.toLowerCase().includes(normalizedQuery)
    );
  }, [query, savedReplies]);

  return (
    <div ref={rootRef} className="relative">
      <Button type="button" size="md" variant="secondary" onClick={() => setOpen((current) => !current)}>
        Saved replies
      </Button>

      {open ? (
        <div className="absolute bottom-12 left-0 z-20 w-[min(420px,calc(100vw-3rem))] rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_20px_40px_rgba(15,23,42,0.14)]">
          <Input value={query} onChange={(event) => setQuery(event.currentTarget.value)} placeholder="Search replies" />

          <div className="mt-3 max-h-72 overflow-y-auto">
            {savedReplies === null ? (
              <SavedRepliesPickerSkeleton />
            ) : filteredReplies.length ? (
              <div className="space-y-2">
                {filteredReplies.map((reply) => (
                  <button
                    key={reply.id}
                    type="button"
                    onClick={() => {
                      onSelectReply(reply.body);
                      setOpen(false);
                    }}
                    className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-left transition hover:border-blue-200 hover:bg-blue-50"
                  >
                    <p className="text-sm font-semibold text-slate-900">{reply.title}</p>
                    <p className="mt-1 line-clamp-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">{reply.body}</p>
                    {reply.tags.length ? (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {reply.tags.map((tag) => (
                          <span key={tag} className="rounded-full bg-white px-2 py-1 text-[11px] font-medium text-slate-500 ring-1 ring-slate-200">
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </button>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                No saved replies match that search yet.
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
