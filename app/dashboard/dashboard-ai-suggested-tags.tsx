"use client";

import { useEffect, useRef, useState } from "react";
import type { DashboardAiAssistSettings } from "@/lib/data/settings-ai-assist";
import type { ConversationThread } from "@/lib/types";
import { Button } from "../components/ui/Button";
import {
  AiAssistCard,
  AiAssistErrorCard,
  AiAssistLimitCard,
  AiAssistLoadingCard
} from "./dashboard-ai-assist-shared";
import { trackDashboardAiAssistEvent } from "./dashboard-ai-assist-events";
import {
  requestDashboardAiAssist,
  useDashboardAiAssistConversationReset
} from "./dashboard-ai-assist-request";

type TagState = "idle" | "loading" | "shown" | "error" | "limit";
const EMPTY_SUGGESTED_TAGS: string[] = [];

export function DashboardAiSuggestedTags({
  activeConversation,
  aiAssistSettings,
  onApplyTag
}: {
  activeConversation: ConversationThread;
  aiAssistSettings: DashboardAiAssistSettings;
  onApplyTag: (tag: string) => Promise<void>;
}) {
  const [tagState, setTagState] = useState<TagState>("idle");
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [applyingTag, setApplyingTag] = useState<string | null>(null);
  const [limitResetAt, setLimitResetAt] = useState<string | null>(null);
  const previousStatusRef = useRef(activeConversation.status);

  useDashboardAiAssistConversationReset(activeConversation.id, () => {
    previousStatusRef.current = activeConversation.status;
    setTagState("idle");
    setSuggestedTags(EMPTY_SUGGESTED_TAGS);
    setApplyingTag(null);
    setLimitResetAt(null);
  });

  useEffect(() => {
    const previousStatus = previousStatusRef.current;
    previousStatusRef.current = activeConversation.status;

    if (
      previousStatus === "open" &&
      activeConversation.status === "resolved" &&
      aiAssistSettings.suggestedTagsEnabled
    ) {
      void handleSuggestTags();
    }
  }, [activeConversation.status, aiAssistSettings.suggestedTagsEnabled]);

  async function handleSuggestTags() {
    setTagState("loading");

    const outcome = await requestDashboardAiAssist<{ tags?: string[] }>({
      action: "tags",
      conversationId: activeConversation.id
    });

    if (outcome.status === "limit") {
      setLimitResetAt(outcome.resetsAt);
      setTagState("limit");
      setSuggestedTags(EMPTY_SUGGESTED_TAGS);
      return;
    }

    const tags = outcome.result?.tags?.filter(
      (tag) => !activeConversation.tags.includes(tag)
    ) ?? EMPTY_SUGGESTED_TAGS;

    if (outcome.status === "error") {
      setTagState("error");
      return;
    }

    if (!tags.length) {
      setTagState("idle");
      setSuggestedTags(EMPTY_SUGGESTED_TAGS);
      return;
    }

    setSuggestedTags(tags);
    setTagState("shown");
    trackDashboardAiAssistEvent("ai.tags.shown", {
      conversationId: activeConversation.id
    });
  }

  async function handleApplySuggestedTag(tag: string) {
    if (applyingTag) {
      return;
    }

    setApplyingTag(tag);
    try {
      await onApplyTag(tag);
      trackDashboardAiAssistEvent("ai.tags.applied", {
        conversationId: activeConversation.id,
        tag
      });
      setSuggestedTags((current) => current.filter((currentTag) => currentTag !== tag));
    } finally {
      setApplyingTag(null);
    }
  }

  function dismissSuggestions() {
    setTagState("idle");
    setSuggestedTags(EMPTY_SUGGESTED_TAGS);
    trackDashboardAiAssistEvent("ai.tags.dismissed", {
      conversationId: activeConversation.id
    });
  }

  return (
    <>
      {tagState === "loading" ? <AiAssistLoadingCard label="✦ Suggesting tags..." /> : null}
      {tagState === "error" ? (
        <AiAssistErrorCard
          title="✦ Something went wrong"
          description="Couldn't suggest tags right now."
          onRetry={() => void handleSuggestTags()}
        />
      ) : null}
      {tagState === "limit" ? <AiAssistLimitCard resetsAt={limitResetAt} /> : null}
      {tagState === "shown" && suggestedTags.length ? (
        <AiAssistCard
          label="✦ Suggested tags"
          onDismiss={dismissSuggestions}
        >
          <div className="flex flex-wrap gap-2.5">
            {suggestedTags.map((tag) => (
              <Button
                key={tag}
                type="button"
                size="md"
                variant="secondary"
                disabled={applyingTag === tag}
                onClick={() => void handleApplySuggestedTag(tag)}
                className="h-8 rounded-full border-purple-200 bg-white px-3 text-[13px] text-purple-700 hover:bg-purple-100"
              >
                {applyingTag === tag ? tag : `+ ${tag}`}
              </Button>
            ))}
          </div>
        </AiAssistCard>
      ) : null}
    </>
  );
}
