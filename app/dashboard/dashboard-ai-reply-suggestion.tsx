"use client";

import { useState } from "react";
import type { DashboardAiAssistSettings } from "@/lib/data/settings-ai-assist";
import type { ConversationThread } from "@/lib/types";
import { Button } from "../components/ui/Button";
import {
  AI_TEXT_ACTION_CLASS,
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

type ReplyState =
  | "idle"
  | "loading"
  | "shown"
  | "error"
  | "empty"
  | "limit";

export function DashboardAiReplySuggestion({
  activeConversation,
  aiAssistSettings,
  onApplyDraft
}: {
  activeConversation: ConversationThread;
  aiAssistSettings: DashboardAiAssistSettings;
  onApplyDraft: (value: string) => void;
}) {
  const [replyState, setReplyState] = useState<ReplyState>("idle");
  const [suggestedReply, setSuggestedReply] = useState("");
  const [limitResetAt, setLimitResetAt] = useState<string | null>(null);
  const showReplyControl = aiAssistSettings.replySuggestionsEnabled;

  useDashboardAiAssistConversationReset(activeConversation.id, () => {
    setReplyState("idle");
    setSuggestedReply("");
    setLimitResetAt(null);
  });

  async function handleSuggestReply() {
    if (!activeConversation.messages.some((message) => message.content.trim())) {
      setReplyState("empty");
      return;
    }

    setReplyState("loading");

    const outcome = await requestDashboardAiAssist<{ draft?: string }>({
      action: "reply",
      conversationId: activeConversation.id
    });

    if (outcome.status === "limit") {
      setLimitResetAt(outcome.resetsAt);
      setReplyState("limit");
      return;
    }

    if (outcome.status === "error" || !outcome.result?.draft) {
      setReplyState("error");
      return;
    }

    setSuggestedReply(outcome.result.draft);
    setReplyState("shown");
  }

  useDashboardAiAssistRequestSubscription({
    action: "reply",
    conversationId: activeConversation.id,
    enabled: showReplyControl,
    onRequest: handleSuggestReply
  });

  if (!showReplyControl) {
    return null;
  }

  return (
    <>
      {replyState === "idle" ? (
        <AiAssistButton label="Suggest reply" onClick={() => void handleSuggestReply()} />
      ) : null}
      {replyState === "loading" ? <AiAssistLoadingCard label="✦ Thinking..." /> : null}
      {replyState === "limit" ? <AiAssistLimitCard resetsAt={limitResetAt} /> : null}
      {replyState === "empty" ? (
        <AiAssistErrorCard
          title="✦ Couldn't generate a suggestion"
          description="Not enough context in this conversation."
          onRetry={() => void handleSuggestReply()}
        />
      ) : null}
      {replyState === "error" ? (
        <AiAssistErrorCard
          title="✦ Something went wrong"
          description="Couldn't connect to AI Assist."
          onRetry={() => void handleSuggestReply()}
        />
      ) : null}
      {replyState === "shown" ? (
        <AiAssistCard
          label="✦ Suggested reply"
          actions={
            <>
              <Button
                type="button"
                size="md"
                variant="secondary"
                onClick={() => {
                  setReplyState("idle");
                  setSuggestedReply("");
                  trackDashboardAiAssistEvent("ai.reply.dismissed", {
                    conversationId: activeConversation.id
                  });
                }}
                className={AI_TEXT_ACTION_CLASS}
              >
                Dismiss
              </Button>
              <Button
                type="button"
                size="md"
                onClick={() => {
                  onApplyDraft(suggestedReply);
                  setReplyState("idle");
                  setSuggestedReply("");
                }}
                className="h-9 px-3"
              >
                Use this
              </Button>
            </>
          }
        >
          <p className="whitespace-pre-wrap">{suggestedReply}</p>
        </AiAssistCard>
      ) : null}
    </>
  );
}
