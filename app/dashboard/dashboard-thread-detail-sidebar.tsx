"use client";

import type { FormEvent } from "react";
import type { ConversationThread } from "@/lib/types";
import { formatDateTime, formatRelativeTime } from "@/lib/utils";
import { DASHBOARD_TAGS } from "./dashboard-client.utils";
import { pageLabelFromUrl } from "./dashboard-ui";
import {
  browserLabel,
  locationLabel,
  referrerLabel,
  tagToneClass
} from "./dashboard-thread-detail.utils";

export function DashboardThreadDetailSidebar({
  activeConversation,
  savingEmail,
  onSaveConversationEmail,
  onToggleTag
}: {
  activeConversation: ConversationThread;
  savingEmail: boolean;
  onSaveConversationEmail: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  onToggleTag: (tag: string) => Promise<void>;
}) {
  const visitorName = activeConversation.email ? activeConversation.email.split("@")[0] : "Visitor";
  const visitorDisplayName =
    visitorName
      .split(/[._-]+/)
      .filter(Boolean)
      .map((segment) => `${segment.charAt(0).toUpperCase()}${segment.slice(1)}`)
      .join(" ") || "Visitor";
  const visitorInitials = visitorDisplayName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
  const visitorLocation = locationLabel(activeConversation);
  const visitorActivity = activeConversation.visitorActivity;
  const availableTags = DASHBOARD_TAGS.filter((tag) => !activeConversation.tags.includes(tag));

  return (
    <div className="min-h-0 flex-1 overflow-y-auto p-5">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-[22px] font-medium text-blue-700">
          {visitorInitials || "V"}
        </div>
        <p className="mt-3 text-[15px] font-medium text-slate-900">{visitorDisplayName}</p>
        <p className="mt-1 text-[13px] font-normal text-slate-500">
          {activeConversation.email || "No email saved yet"}
        </p>
      </div>

      {!activeConversation.email ? (
        <form onSubmit={onSaveConversationEmail} className="mt-4">
          <input type="hidden" name="conversationId" value={activeConversation.id} />
          <input
            type="email"
            name="email"
            required
            placeholder="visitor@company.com"
            className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600"
          />
          <button
            type="submit"
            disabled={savingEmail}
            className="mt-3 w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {savingEmail ? "Saving..." : "Save visitor email"}
          </button>
        </form>
      ) : null}

      <div className="my-4 h-px bg-slate-200" />

      <section>
        <h3 className="mb-3 text-[11px] font-medium uppercase tracking-[0.05em] text-slate-400">Current session</h3>
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-3 text-[13px]">
            <span className="text-slate-500">Page</span>
            <span className="text-right text-blue-600">{pageLabelFromUrl(activeConversation.pageUrl)}</span>
          </div>
          <div className="flex items-start justify-between gap-3 text-[13px]">
            <span className="text-slate-500">Referrer</span>
            <span className="text-right text-slate-900">{referrerLabel(activeConversation.referrer)}</span>
          </div>
          <div className="flex items-start justify-between gap-3 text-[13px]">
            <span className="text-slate-500">Location</span>
            <span className="text-right text-slate-900">{visitorLocation || "Unknown"}</span>
          </div>
          <div className="flex items-start justify-between gap-3 text-[13px]">
            <span className="text-slate-500">Browser</span>
            <span className="text-right text-slate-900">{browserLabel(activeConversation.userAgent)}</span>
          </div>
          <div className="flex items-start justify-between gap-3 text-[13px]">
            <span className="text-slate-500">Timezone</span>
            <span className="text-right text-slate-900">{activeConversation.timezone || "Unknown"}</span>
          </div>
        </div>
      </section>

      <div className="my-4 h-px bg-slate-200" />

      <section>
        <h3 className="mb-3 text-[11px] font-medium uppercase tracking-[0.05em] text-slate-400">History</h3>
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-3 text-[13px]">
            <span className="text-slate-500">First seen</span>
            <span className="text-right text-slate-900">{formatDateTime(activeConversation.createdAt)}</span>
          </div>
          <div className="flex items-start justify-between gap-3 text-[13px]">
            <span className="text-slate-500">Conversations</span>
            <span className="text-right text-slate-900">
              {visitorActivity ? visitorActivity.otherConversationsTotal + 1 : 1}
            </span>
          </div>
          <div className="flex items-start justify-between gap-3 text-[13px]">
            <span className="text-slate-500">Last visit</span>
            <span className="text-right text-slate-900">
              {visitorActivity?.lastSeenAt ? formatRelativeTime(visitorActivity.lastSeenAt) : "This visit"}
            </span>
          </div>
        </div>
      </section>

      <div className="my-4 h-px bg-slate-200" />

      <section>
        <h3 className="mb-3 text-[11px] font-medium uppercase tracking-[0.05em] text-slate-400">Tags</h3>
        <div className="flex flex-wrap gap-2">
          {activeConversation.tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => onToggleTag(tag)}
              className={tagToneClass(tag) + " rounded-full px-2.5 py-1 text-xs font-normal transition"}
            >
              {tag}
            </button>
          ))}
          {availableTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => onToggleTag(tag)}
              className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-normal text-slate-500 transition hover:bg-slate-200"
            >
              {`+ ${tag}`}
            </button>
          ))}
        </div>
      </section>

      {visitorActivity?.otherQuestionsLastMonth ? (
        <>
          <div className="my-4 h-px bg-slate-200" />
          <section>
            <h3 className="mb-3 text-[11px] font-medium uppercase tracking-[0.05em] text-slate-400">Visitor activity</h3>
            <div className="rounded-lg bg-slate-50 px-3 py-3 text-[13px] leading-6 text-slate-600">
              This visitor asked {visitorActivity.otherQuestionsLastMonth} other question
              {visitorActivity.otherQuestionsLastMonth === 1 ? "" : "s"} last month.
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
