"use client";

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import type { DashboardAiAssistSettings } from "@/lib/data/settings-ai-assist";
import type { ConversationThread } from "@/lib/types";
import { Button } from "../components/ui/Button";
import { Textarea } from "../components/ui/Textarea";
import { AI_ASSIST_REPLY_DRAFT_FIELD } from "./dashboard-ai-reply-usage";
import { DashboardAiAssistPanel } from "./dashboard-ai-assist-panel";
import { DashboardAiRewriteAssist } from "./dashboard-ai-rewrite-assist";
import { DashboardSavedRepliesPicker } from "./dashboard-saved-replies-picker";
import { PaperclipIcon } from "./dashboard-ui";
import { replyPlaceholder } from "./dashboard-thread-detail.utils";

type SelectionSnapshot = { start: number; end: number; text: string } | null;

function handleReplyKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    event.currentTarget.form?.requestSubmit();
  }
}

export function DashboardThreadDetailComposer({
  activeConversation,
  sendingReply,
  aiAssistSettings,
  onSendReply,
  onReplyComposerBlur,
  onReplyComposerFocus,
  onReplyComposerInput,
  onToggleTag
}: {
  activeConversation: ConversationThread;
  sendingReply: boolean;
  aiAssistSettings: DashboardAiAssistSettings;
  onSendReply: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  onReplyComposerBlur: () => void;
  onReplyComposerFocus: (value: string) => void;
  onReplyComposerInput: (value: string) => void;
  onToggleTag: (tag: string) => Promise<void>;
}) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [selection, setSelection] = useState<SelectionSnapshot>(null);
  const [aiAssistReplyDraft, setAiAssistReplyDraft] = useState<string | null>(null);

  useEffect(() => {
    setSelection(null);
    setAiAssistReplyDraft(null);
  }, [activeConversation.id]);

  function syncSelection() {
    const field = textareaRef.current;
    if (!field) {
      setSelection(null);
      return;
    }

    const start = field.selectionStart ?? 0;
    const end = field.selectionEnd ?? start;
    const text = field.value.slice(start, end);
    setSelection(start === end ? null : { start, end, text });
  }

  function replaceDraft(nextValue: string) {
    const field = textareaRef.current;
    if (!field) {
      return;
    }

    field.value = nextValue;
    onReplyComposerInput(nextValue);
    field.focus();
    const caret = nextValue.length;
    field.setSelectionRange(caret, caret);
    setSelection(null);
  }

  function applyAiDraft(nextValue: string) {
    setAiAssistReplyDraft(nextValue);
    replaceDraft(nextValue);
  }

  function replaceSelection(target: NonNullable<SelectionSnapshot>, nextText: string) {
    const field = textareaRef.current;
    if (!field) {
      return;
    }

    const nextValue =
      `${field.value.slice(0, target.start)}${nextText}${field.value.slice(target.end)}`;

    field.value = nextValue;
    onReplyComposerInput(nextValue);
    field.focus();
    const caret = target.start + nextText.length;
    field.setSelectionRange(caret, caret);
    setSelection(null);
  }

  function insertSavedReply(body: string) {
    const field = textareaRef.current;
    if (!field) {
      return;
    }

    const start = field.selectionStart ?? field.value.length;
    const end = field.selectionEnd ?? start;
    const spacer = field.value.trim().length ? "\n\n" : "";
    const nextValue = `${field.value.slice(0, start)}${spacer}${body}${field.value.slice(end)}`;

    replaceDraft(nextValue);
    const caret = start + spacer.length + body.length;
    field.setSelectionRange(caret, caret);
  }

  return (
    <div className="border-t border-slate-200 bg-white px-5 py-4">
      <form
        onSubmit={async (event) => {
          await onSendReply(event);
          setAiAssistReplyDraft(null);
        }}
      >
        <input type="hidden" name="conversationId" value={activeConversation.id} />
        {aiAssistReplyDraft ? (
          <input
            type="hidden"
            name={AI_ASSIST_REPLY_DRAFT_FIELD}
            value={aiAssistReplyDraft}
          />
        ) : null}

        <DashboardAiAssistPanel
          activeConversation={activeConversation}
          aiAssistSettings={aiAssistSettings}
          onApplyDraft={applyAiDraft}
          onApplyTag={onToggleTag}
        />

        <Textarea
          key={activeConversation.id}
          ref={textareaRef}
          name="content"
          rows={3}
          onBlur={onReplyComposerBlur}
          onFocus={(event) => onReplyComposerFocus(event.currentTarget.value)}
          onInput={(event) => {
            onReplyComposerInput(event.currentTarget.value);
            syncSelection();
          }}
          onSelect={syncSelection}
          onKeyUp={syncSelection}
          onMouseUp={syncSelection}
          onKeyDown={handleReplyKeyDown}
          placeholder={replyPlaceholder(activeConversation)}
          className="min-h-[44px] bg-slate-50 px-4"
        />

        <DashboardAiRewriteAssist
          activeConversationId={activeConversation.id}
          aiAssist={aiAssistSettings}
          selection={selection}
          onReplaceSelection={replaceSelection}
        />

        <div className="mt-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <DashboardSavedRepliesPicker onSelectReply={insertSavedReply} />
            <label className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-slate-300 text-slate-500 transition hover:bg-slate-50 hover:text-slate-700">
              <PaperclipIcon className="h-4 w-4" />
              <input type="file" name="attachments" multiple className="hidden" />
            </label>
          </div>

          <Button
            type="submit"
            disabled={sendingReply}
            size="md"
            className="h-10 w-10 shrink-0 self-end rounded-xl p-0"
            aria-label="Send reply"
          >
            <span className="text-lg font-semibold leading-none text-white" aria-hidden="true">
              →
            </span>
          </Button>
        </div>

        <p className="mt-2 text-[11px] font-normal text-slate-400">Press Enter to send - Shift+Enter for new line</p>
      </form>
    </div>
  );
}
