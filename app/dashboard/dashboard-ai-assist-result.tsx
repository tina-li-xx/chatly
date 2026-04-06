"use client";

import type { ReactNode } from "react";
import { Button } from "../components/ui/Button";
import type { DashboardAiAssistResult } from "@/lib/dashboard-ai-assist";

function ResultShell({
  eyebrow,
  children,
  footer
}: {
  eyebrow: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-blue-100 bg-blue-50/80 px-4 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-700">{eyebrow}</p>
      <div className="mt-3 space-y-3 text-sm leading-6 text-slate-700">{children}</div>
      {footer ? <div className="mt-4 flex flex-wrap gap-2">{footer}</div> : null}
    </div>
  );
}

export function DashboardAiAssistResultCard({
  result,
  currentTags,
  applyingTag,
  onApplyDraft,
  onApplyTag
}: {
  result: DashboardAiAssistResult;
  currentTags: string[];
  applyingTag: string | null;
  onApplyDraft: (value: string) => void;
  onApplyTag: (tag: string) => void;
}) {
  if (result.action === "summarize") {
    return (
      <ResultShell eyebrow="Conversation summary">
        <p>{result.summary}</p>
      </ResultShell>
    );
  }

  if (result.action === "rewrite" || result.action === "reply") {
    const label = result.action === "rewrite" ? "Rewrite suggestion" : "Suggested reply";
    const buttonLabel = result.action === "rewrite" ? "Replace draft" : "Use reply";

    return (
      <ResultShell
        eyebrow={label}
        footer={
          <Button type="button" size="md" onClick={() => onApplyDraft(result.draft)}>
            {buttonLabel}
          </Button>
        }
      >
        <p className="whitespace-pre-wrap">{result.draft}</p>
      </ResultShell>
    );
  }

  if (result.action === "tags") {
    return (
      <ResultShell eyebrow="Suggested tags">
        {result.tags.length ? (
          <div className="flex flex-wrap gap-2">
            {result.tags.map((tag) => {
              const alreadyAdded = currentTags.includes(tag);
              return (
                <Button
                  key={tag}
                  type="button"
                  size="md"
                  variant={alreadyAdded ? "secondary" : "primary"}
                  className="h-8 rounded-full px-3 text-xs"
                  disabled={alreadyAdded || applyingTag === tag}
                  onClick={() => onApplyTag(tag)}
                >
                  {alreadyAdded ? `${tag} added` : applyingTag === tag ? tag : `Add ${tag}`}
                </Button>
              );
            })}
          </div>
        ) : (
          <p className="text-slate-600">No extra tags stood out beyond what's already on the thread.</p>
        )}
      </ResultShell>
    );
  }

  return null;
}
