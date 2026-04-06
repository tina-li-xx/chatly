"use client";

import { useState } from "react";
import type { DashboardAiAssistSettings } from "@/lib/data/settings-ai-assist";
import { Button } from "../components/ui/Button";
import {
  AI_TEXT_ACTION_CLASS,
  AiAssistCard,
  AiAssistErrorCard,
  AiAssistLimitCard,
  AiAssistLoadingCard
} from "./dashboard-ai-assist-shared";
import { trackDashboardAiAssistEvent } from "./dashboard-ai-assist-events";
import { readDashboardAiAssistRoutePayload } from "./dashboard-ai-assist-route";

type RewriteTone = "shorter" | "friendlier" | "formal" | "grammar";
type SelectionSnapshot = { start: number; end: number; text: string } | null;

const REWRITE_OPTIONS: Array<{ tone: RewriteTone; label: string }> = [
  { tone: "shorter", label: "Shorter" },
  { tone: "friendlier", label: "Friendlier" },
  { tone: "formal", label: "More formal" },
  { tone: "grammar", label: "Fix grammar" }
];

export function DashboardAiRewriteAssist({
  activeConversationId,
  aiAssist,
  selection,
  onReplaceSelection
}: {
  activeConversationId: string;
  aiAssist: DashboardAiAssistSettings;
  selection: SelectionSnapshot;
  onReplaceSelection: (selection: NonNullable<SelectionSnapshot>, nextText: string) => void;
}) {
  const [mode, setMode] = useState<"idle" | "loading" | "shown" | "error" | "limit">("idle");
  const [tone, setTone] = useState<RewriteTone>("shorter");
  const [draft, setDraft] = useState("");
  const [target, setTarget] = useState<NonNullable<SelectionSnapshot> | null>(null);
  const [limitResetAt, setLimitResetAt] = useState<string | null>(null);
  const visibleSelection = selection?.text.trim() ? selection : null;

  if (!aiAssist.rewriteAssistanceEnabled) {
    return null;
  }

  function dismissRewrite() {
    trackDashboardAiAssistEvent("ai.rewrite.dismissed", {
      conversationId: activeConversationId,
      tone
    });
    setMode("idle");
  }

  async function handleRewrite(nextTone: RewriteTone) {
    if (!visibleSelection) {
      return;
    }

    setTone(nextTone);
    setTarget(visibleSelection);
    setMode("loading");

    try {
      const response = await fetch("/dashboard/ai-assist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "rewrite",
          conversationId: activeConversationId,
          draft: visibleSelection.text,
          tone: nextTone
        })
      });
      const { payload, error } = await readDashboardAiAssistRoutePayload<{
        draft?: string;
      }>(response);

      if (error) {
        if (error.code === "ai-assist-limit-reached") {
          setLimitResetAt(error.resetsAt);
          setMode("limit");
          return;
        }

        throw new Error("rewrite-failed");
      }

      const result = payload.result;
      if (!result?.draft) {
        throw new Error("rewrite-failed");
      }

      setDraft(result.draft);
      setMode("shown");
    } catch {
      setMode("error");
    }
  }

  return (
    <div className="mt-3 space-y-3">
      {mode === "shown" ? (
        <AiAssistCard
          label={`✦ ${REWRITE_OPTIONS.find((option) => option.tone === tone)?.label ?? "Rewrite"}`}
          onDismiss={dismissRewrite}
          actions={
            <>
              <Button
                type="button"
                size="md"
                variant="secondary"
                onClick={dismissRewrite}
                className={AI_TEXT_ACTION_CLASS}
              >
                Try another
              </Button>
              <Button
                type="button"
                size="md"
                onClick={() => {
                  if (!target) {
                    return;
                  }
                  onReplaceSelection(target, draft);
                  trackDashboardAiAssistEvent("ai.rewrite.applied", {
                    conversationId: activeConversationId,
                    tone
                  });
                  setMode("idle");
                }}
                className="h-9 px-3"
              >
                Replace
              </Button>
            </>
          }
        >
          <p className="whitespace-pre-wrap">{draft}</p>
        </AiAssistCard>
      ) : null}
      {mode === "loading" ? <AiAssistLoadingCard label="✦ Rewriting..." /> : null}
      {mode === "limit" ? <AiAssistLimitCard resetsAt={limitResetAt} /> : null}
      {mode === "error" ? (
        <AiAssistErrorCard
          title="✦ Something went wrong"
          description="Couldn't connect to AI Assist."
          onRetry={() => void handleRewrite(tone)}
        />
      ) : null}
      {visibleSelection ? (
        <div className="rounded-lg border border-slate-200 bg-white px-3 py-3 shadow-[0_4px_12px_rgba(15,23,42,0.08)]">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex rounded-full border border-purple-200 bg-purple-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-purple-700">
              AI
            </span>
            <span className="text-sm font-medium text-purple-700">✦ Rewrite:</span>
            {REWRITE_OPTIONS.map((option) => (
              <Button
                key={option.tone}
                type="button"
                size="md"
                variant="secondary"
                onClick={() => void handleRewrite(option.tone)}
                className="h-8 border-0 bg-slate-100 px-2.5 text-[13px] font-medium text-slate-700 hover:bg-slate-200"
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
