"use client";

import { createRef, type FormEvent, type KeyboardEvent } from "react";
import type { ConversationThread } from "@/lib/types";
import { Button } from "../components/ui/Button";
import { Textarea } from "../components/ui/Textarea";
import { DashboardAiAssistPanel } from "./dashboard-ai-assist-panel";
import { DashboardSavedRepliesPicker } from "./dashboard-saved-replies-picker";
import { PaperclipIcon } from "./dashboard-ui";
import { replyPlaceholder } from "./dashboard-thread-detail.utils";

function handleReplyKeyDown(
  event: KeyboardEvent<HTMLTextAreaElement>
) {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    event.currentTarget.form?.requestSubmit();
  }
}

export function renderDashboardThreadDetailComposer(input: {
  activeConversation: ConversationThread;
  sendingReply: boolean;
  onSendReply: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  onReplyComposerBlur: () => void;
  onReplyComposerFocus: (value: string) => void;
  onReplyComposerInput: (value: string) => void;
  onToggleTag: (tag: string) => Promise<void>;
}) {
  const textareaRef = createRef<HTMLTextAreaElement>();

  function replaceDraft(nextValue: string) {
    const field = textareaRef.current;
    if (!field) {
      return;
    }

    field.value = nextValue;
    input.onReplyComposerInput(nextValue);
    field.focus();
    const caret = nextValue.length;
    field.setSelectionRange(caret, caret);
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
      <form onSubmit={input.onSendReply}>
        <input type="hidden" name="conversationId" value={input.activeConversation.id} />

        <Textarea
          ref={textareaRef}
          name="content"
          rows={3}
          onBlur={input.onReplyComposerBlur}
          onFocus={(event) => input.onReplyComposerFocus(event.currentTarget.value)}
          onInput={(event) => input.onReplyComposerInput(event.currentTarget.value)}
          onKeyDown={handleReplyKeyDown}
          placeholder={replyPlaceholder(input.activeConversation)}
          className="min-h-[44px] border-0 bg-slate-50 px-4"
        />

        <DashboardAiAssistPanel
          activeConversation={input.activeConversation}
          readDraft={() => textareaRef.current?.value ?? ""}
          onApplyDraft={replaceDraft}
          onApplyTag={input.onToggleTag}
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
            disabled={input.sendingReply}
            size="md"
            className="h-9 w-9 rounded-lg px-0"
            aria-label="Send reply"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path d="M22 2 11 13" />
              <path d="m22 2-7 20-4-9-9-4Z" />
            </svg>
          </Button>
        </div>

        <p className="mt-2 text-[11px] font-normal text-slate-400">Press Enter to send - Shift+Enter for new line</p>
      </form>
    </div>
  );
}
