"use client";

import type { DashboardAiAssistSettings } from "@/lib/data/settings-ai-assist";
import type { ConversationThread } from "@/lib/types";
import { DashboardAiReplySuggestion } from "./dashboard-ai-reply-suggestion";
import { DashboardAiSuggestedTags } from "./dashboard-ai-suggested-tags";

export function DashboardAiAssistPanel({
  activeConversation,
  aiAssistSettings,
  onApplyDraft,
  onApplyTag
}: {
  activeConversation: ConversationThread;
  aiAssistSettings: DashboardAiAssistSettings;
  onApplyDraft: (value: string) => void;
  onApplyTag: (tag: string) => Promise<void>;
}) {
  return (
    <div className="mb-3 space-y-3">
      <DashboardAiReplySuggestion
        activeConversation={activeConversation}
        aiAssistSettings={aiAssistSettings}
        onApplyDraft={onApplyDraft}
      />
      <DashboardAiSuggestedTags
        activeConversation={activeConversation}
        aiAssistSettings={aiAssistSettings}
        onApplyTag={onApplyTag}
      />
    </div>
  );
}
