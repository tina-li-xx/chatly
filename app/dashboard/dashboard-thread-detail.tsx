"use client";

import type { FormEvent, KeyboardEvent } from "react";
import type { ConversationStatus, ConversationSummary, ConversationThread, ThreadMessage } from "@/lib/types";
import { classNames } from "@/lib/utils";
import {
  ArrowLeftIcon,
  ChatBubbleIcon,
  InfoIcon,
  PaperclipIcon,
  WarningIcon,
  XIcon,
} from "./dashboard-ui";
import { displayNameFromEmail } from "@/lib/user-display";
import { DashboardThreadDetailSidebar } from "./dashboard-thread-detail-sidebar";
import {
  groupedMessages,
  messageTime,
  renderAttachments,
  replyPlaceholder
} from "./dashboard-thread-detail.utils";

export function DashboardThreadDetail({
  activeConversation,
  loadingConversationSummary,
  savingEmail,
  sendingReply,
  updatingStatus,
  isVisitorTyping,
  isLiveDisconnected,
  teamName,
  teamInitials,
  showSidebarInline = true,
  showSidebarDrawer = false,
  showBackButton = false,
  onSaveConversationEmail,
  onSendReply,
  onConversationStatusChange,
  onReplyComposerBlur,
  onReplyComposerFocus,
  onReplyComposerInput,
  onToggleTag,
  onBack,
  onOpenSidebar,
  onCloseSidebar
}: {
  activeConversation: ConversationThread | null;
  loadingConversationSummary: ConversationSummary | null;
  savingEmail: boolean;
  sendingReply: boolean;
  updatingStatus: boolean;
  isVisitorTyping: boolean;
  isLiveDisconnected: boolean;
  teamName: string;
  teamInitials: string;
  showSidebarInline?: boolean;
  showSidebarDrawer?: boolean;
  showBackButton?: boolean;
  onSaveConversationEmail: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  onSendReply: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  onConversationStatusChange: (status: ConversationStatus) => Promise<void>;
  onReplyComposerBlur: () => void;
  onReplyComposerFocus: (value: string) => void;
  onReplyComposerInput: (value: string) => void;
  onToggleTag: (tag: string) => Promise<void>;
  onBack?: () => void;
  onOpenSidebar?: () => void;
  onCloseSidebar?: () => void;
}) {
  if (
    loadingConversationSummary &&
    (!activeConversation || activeConversation.id !== loadingConversationSummary.id)
  ) {
    const loadingVisitorName = loadingConversationSummary.email
      ? displayNameFromEmail(loadingConversationSummary.email)
      : "Visitor";

    return (
      <>
        <section className="flex h-full min-h-0 flex-col bg-white">
          <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
            <div className="flex min-w-0 items-center gap-3">
              {showBackButton && onBack ? (
                <button
                  type="button"
                  onClick={onBack}
                  aria-label="Back to conversations"
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                </button>
              ) : null}

              <div className="min-w-0">
                <p className="truncate text-[15px] font-medium text-slate-900">{loadingVisitorName}</p>
                <p className="truncate text-[13px] font-normal text-slate-500">
                  {loadingConversationSummary.email || "Anonymous visitor"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex min-h-0 flex-1 items-center justify-center bg-white">
            <div className="px-8 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
              <p className="mt-4 text-sm font-medium text-slate-600">Loading conversation...</p>
            </div>
          </div>
        </section>

        {showSidebarInline ? (
          <aside className="hidden h-full min-h-0 border-l border-slate-200 bg-white xl:flex xl:flex-col">
            <div className="flex h-full items-center justify-center px-8 text-center">
              <p className="text-sm leading-6 text-slate-500">Loading visitor details...</p>
            </div>
          </aside>
        ) : null}
      </>
    );
  }

  if (!activeConversation) {
    return (
      <>
        <section className="flex h-full min-h-0 items-center justify-center bg-white">
          <div className="px-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-300">
              <ChatBubbleIcon className="h-7 w-7" />
            </div>
            <h2 className="mt-5 text-base font-medium text-slate-600">Select a conversation</h2>
            <p className="mt-2 text-sm text-slate-400">Choose a visitor from the list on the left.</p>
          </div>
        </section>

        {showSidebarInline ? (
          <aside className="hidden h-full min-h-0 border-l border-slate-200 bg-white xl:flex xl:flex-col">
            <div className="flex h-full items-center justify-center px-8 text-center">
              <div>
                <h3 className="text-sm font-medium uppercase tracking-[0.2em] text-slate-400">Visitor Info</h3>
                <p className="mt-4 text-sm leading-6 text-slate-500">
                  Session details, history, tags, and notes will appear here when you open a conversation.
                </p>
              </div>
            </div>
          </aside>
        ) : null}
      </>
    );
  }

  const visitorName = activeConversation.email ? activeConversation.email.split("@")[0] : "Visitor";
  const visitorDisplayName =
    visitorName
      .split(/[._-]+/)
      .filter(Boolean)
      .map((segment) => `${segment.charAt(0).toUpperCase()}${segment.slice(1)}`)
      .join(" ") || "Visitor";
  const timeline = groupedMessages(activeConversation.messages);

  const handleReplyKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  };

  return (
    <>
      <section className="flex h-full min-h-0 flex-col bg-white">
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
          <div className="flex min-w-0 items-center gap-3">
            {showBackButton && onBack ? (
              <button
                type="button"
                onClick={onBack}
                aria-label="Back to conversations"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
              >
                <ArrowLeftIcon className="h-4 w-4" />
              </button>
            ) : null}

            <div className="min-w-0">
              <p className="truncate text-[15px] font-medium text-slate-900">{visitorDisplayName}</p>
              <p className="truncate text-[13px] font-normal text-slate-500">
                {activeConversation.email || "Anonymous visitor"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={updatingStatus}
              onClick={() =>
                onConversationStatusChange(activeConversation.status === "open" ? "resolved" : "open")
              }
              className={classNames(
                "rounded-lg px-4 py-2 text-[13px] font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-60",
                activeConversation.status === "open"
                  ? "bg-emerald-500 hover:bg-emerald-600"
                  : "bg-slate-700 hover:bg-slate-800"
              )}
            >
              {updatingStatus ? "Saving..." : activeConversation.status === "open" ? "Resolve" : "Reopen"}
            </button>
            {!showSidebarInline && onOpenSidebar ? (
              <button
                type="button"
                onClick={onOpenSidebar}
                aria-label="Open visitor info"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
              >
                <InfoIcon className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        </div>

        {isLiveDisconnected ? (
          <div className="border-b border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-700">
            <div className="flex items-center gap-2">
              <WarningIcon className="h-4 w-4" />
              <span>Connection lost · Trying to reconnect...</span>
            </div>
          </div>
        ) : null}

        <div className="min-h-0 flex-1 overflow-y-auto bg-white px-5 py-5">
          <div className="space-y-4">
            {timeline.map((entry, index) =>
              entry.type === "day" ? (
                <div key={`day-${entry.value}-${index}`} className="py-1 text-center text-xs text-slate-400">
                  <span>&#9472;&#9472; {entry.value} &#9472;&#9472;</span>
                </div>
              ) : entry.value.sender === "founder" ? (
                <div key={entry.value.id} className="flex justify-end">
                  <div className="flex max-w-[70%] items-end gap-2">
                    <div className="min-w-0 text-right">
                      <article className="rounded-[12px_12px_4px_12px] bg-blue-600 px-4 py-3 text-sm leading-6 text-white">
                        {entry.value.content ? <p className="whitespace-pre-wrap break-words">{entry.value.content}</p> : null}
                        {renderAttachments(entry.value)}
                      </article>
                      <div className="mt-1 text-[11px] font-normal text-slate-400">
                        {teamName} · {entry.value.pending ? "Sending..." : messageTime(entry.value.createdAt)}
                      </div>
                    </div>
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[11px] font-medium text-blue-700">
                      {teamInitials}
                    </div>
                  </div>
                </div>
              ) : (
                <div key={entry.value.id} className="flex justify-start">
                  <div className="max-w-[70%]">
                    <article className="rounded-[12px_12px_12px_4px] bg-slate-100 px-4 py-3 text-sm leading-6 text-slate-900">
                      {entry.value.content ? <p className="whitespace-pre-wrap break-words">{entry.value.content}</p> : null}
                      {renderAttachments(entry.value)}
                    </article>
                    <div className="mt-1 text-[11px] font-normal text-slate-400">{messageTime(entry.value.createdAt)}</div>
                  </div>
                </div>
              )
            )}

            {isVisitorTyping ? (
              <div className="flex justify-start">
                <div className="rounded-[12px_12px_12px_4px] bg-slate-100 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-slate-400" />
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-slate-400 [animation-delay:150ms]" />
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-slate-400 [animation-delay:300ms]" />
                    </div>
                    <span className="text-xs font-normal text-slate-500">Visitor is typing...</span>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="border-t border-slate-200 bg-white px-5 py-4">
          <form onSubmit={onSendReply}>
            <input type="hidden" name="conversationId" value={activeConversation.id} />

            <textarea
              name="content"
              rows={3}
              disabled={sendingReply}
              onBlur={onReplyComposerBlur}
              onFocus={(event) => onReplyComposerFocus(event.currentTarget.value)}
              onInput={(event) => onReplyComposerInput(event.currentTarget.value)}
              onKeyDown={handleReplyKeyDown}
              placeholder={replyPlaceholder(activeConversation)}
              className="min-h-[44px] w-full rounded-lg bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-70"
            />

            <div className="mt-3 flex items-center justify-between gap-4">
              <div className="flex items-center">
                <label className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-slate-300 text-slate-500 transition hover:bg-slate-50 hover:text-slate-700">
                  <PaperclipIcon className="h-4 w-4" />
                  <input type="file" name="attachments" multiple className="hidden" />
                </label>
              </div>

              <button
                type="submit"
                disabled={sendingReply}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
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
              </button>
            </div>

            <p className="mt-2 text-[11px] font-normal text-slate-400">Press Enter to send · Shift+Enter for new line</p>
          </form>
        </div>
      </section>

      {showSidebarInline ? (
        <aside className="hidden h-full min-h-0 flex-col border-l border-slate-200 bg-white xl:flex">
          <DashboardThreadDetailSidebar
            activeConversation={activeConversation}
            savingEmail={savingEmail}
            onSaveConversationEmail={onSaveConversationEmail}
            onToggleTag={onToggleTag}
          />
        </aside>
      ) : null}

      {showSidebarDrawer ? (
        <div className="fixed inset-0 z-40 bg-slate-900/25 xl:hidden" onClick={onCloseSidebar}>
          <aside
            className="absolute bottom-0 right-0 top-0 flex w-full max-w-[300px] flex-col border-l border-slate-200 bg-white shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex h-14 items-center justify-between border-b border-slate-200 px-5">
              <p className="text-sm font-medium text-slate-900">Visitor info</p>
              <button
                type="button"
                onClick={onCloseSidebar}
                aria-label="Close visitor info"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
              >
                <XIcon className="h-4 w-4" />
              </button>
            </div>
            <DashboardThreadDetailSidebar
              activeConversation={activeConversation}
              savingEmail={savingEmail}
              onSaveConversationEmail={onSaveConversationEmail}
              onToggleTag={onToggleTag}
            />
          </aside>
        </div>
      ) : null}
    </>
  );
}
