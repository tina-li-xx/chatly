"use client";

import { useMemo, useState } from "react";
import type { DashboardAiAssistSettings } from "@/lib/data/settings-ai-assist";
import type { ConversationThread } from "@/lib/types";
import {
  AiAssistButton,
  AiAssistCard,
  AiAssistErrorCard,
  AiAssistLimitCard,
  AiAssistLoadingCard
} from "./dashboard-ai-assist-shared";
import {
  trackDashboardAiAssistEvent
} from "./dashboard-ai-assist-events";
import {
  requestDashboardAiAssist,
  useDashboardAiAssistConversationReset,
  useDashboardAiAssistRequestSubscription
} from "./dashboard-ai-assist-request";
import { SidebarSection } from "./dashboard-side-panel-ui";

function formatDurationLabel(conversation: ConversationThread) {
  const startedAt = new Date(conversation.messages[0]?.createdAt ?? conversation.createdAt).getTime();
  const endedAt = new Date(
    conversation.messages[conversation.messages.length - 1]?.createdAt ?? conversation.updatedAt
  ).getTime();
  const minutes = Math.max(1, Math.round((endedAt - startedAt) / 60000));

  return minutes === 1 ? "1 minute" : `${minutes} minutes`;
}

export function DashboardAiConversationSummary({
  activeConversation,
  aiAssist
}: {
  activeConversation: ConversationThread;
  aiAssist: DashboardAiAssistSettings;
}) {
  const [state, setState] = useState<"idle" | "loading" | "shown" | "error" | "limit">("idle");
  const [summary, setSummary] = useState("");
  const [limitResetAt, setLimitResetAt] = useState<string | null>(null);
  const canRenderControl =
    activeConversation.messages.length >= 4 &&
    aiAssist.conversationSummariesEnabled;
  const durationLabel = useMemo(
    () => formatDurationLabel(activeConversation),
    [activeConversation]
  );

  useDashboardAiAssistConversationReset(activeConversation.id, () => {
    setState("idle");
    setSummary("");
    setLimitResetAt(null);
  });

  async function handleSummarize() {
    setState("loading");

    const outcome = await requestDashboardAiAssist<{ summary?: string }>({
      action: "summarize",
      conversationId: activeConversation.id
    });

    if (outcome.status === "limit") {
      setLimitResetAt(outcome.resetsAt);
      setState("limit");
      return;
    }

    if (outcome.status === "error" || !outcome.result?.summary) {
      setState("error");
      return;
    }

    setSummary(outcome.result.summary);
    setState("shown");
    trackDashboardAiAssistEvent("ai.summary.shown", {
      conversationId: activeConversation.id
    });
  }

  useDashboardAiAssistRequestSubscription({
    action: "summarize",
    conversationId: activeConversation.id,
    enabled: canRenderControl,
    onRequest: handleSummarize
  });

  if (!canRenderControl) {
    return null;
  }

  return (
    <SidebarSection title="Conversation">
      {state === "loading" ? <AiAssistLoadingCard label="✦ Summarizing..." /> : null}
      {state === "error" ? (
        <AiAssistErrorCard
          title="✦ Something went wrong"
          description="Couldn't connect to AI Assist."
          onRetry={() => void handleSummarize()}
        />
      ) : null}
      {state === "limit" ? <AiAssistLimitCard resetsAt={limitResetAt} /> : null}
      {state === "shown" ? (
        <AiAssistCard
          label="✦ Summary"
          onDismiss={() => {
            setState("idle");
            setSummary("");
          }}
        >
          <p>{summary}</p>
          <div className="mt-4 space-y-1 text-[13px] text-slate-500">
            <p>{`Status: ${activeConversation.status === "resolved" ? "Resolved" : "Open"}`}</p>
            <p>{`Messages: ${activeConversation.messages.length}`}</p>
            <p>{`Duration: ${durationLabel}`}</p>
          </div>
        </AiAssistCard>
      ) : null}
      {state === "idle" ? (
        <AiAssistButton label="Summarize" onClick={() => void handleSummarize()} />
      ) : null}
    </SidebarSection>
  );
}
