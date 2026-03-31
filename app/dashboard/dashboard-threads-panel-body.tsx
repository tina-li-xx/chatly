"use client";

import type { ReactNode } from "react";
import type { ConversationSummary } from "@/lib/types";
import { displayNameFromEmail, initialsFromLabel } from "@/lib/user-display";
import { classNames, formatRelativeTime, truncate } from "@/lib/utils";
import { DashboardLink } from "./dashboard-shell";
import type { DashboardThreadsPanelProps } from "./dashboard-threads-panel-header";
import { CheckIcon, SearchIcon, pageLabelFromUrl } from "./dashboard-ui";
import { DashboardWidgetInstallLink } from "./dashboard-widget-install-link";

function locationLabel(conversation: ConversationSummary) {
  return [conversation.city, conversation.region, conversation.country].filter(Boolean).join(", ") || null;
}

function conversationLabel(conversation: ConversationSummary) {
  return conversation.email ? displayNameFromEmail(conversation.email) : "Visitor";
}

function conversationSecondaryLabel(conversation: ConversationSummary) {
  return conversation.email || conversation.siteName;
}

function conversationTimestamp(conversation: ConversationSummary) {
  return formatRelativeTime(conversation.lastMessageAt || conversation.updatedAt);
}

function EmptyThreadsState({
  iconClassName,
  iconSizeClassName,
  title,
  description,
  titleClassName = "mt-5 text-base font-medium text-slate-700",
  descriptionClassName = "mt-2 text-sm leading-6 text-slate-500",
  children
}: {
  iconClassName: string;
  iconSizeClassName: string;
  title: string;
  description: string;
  titleClassName?: string;
  descriptionClassName?: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex h-full min-h-[320px] flex-col items-center justify-center rounded-lg px-6 text-center">
      <div className={classNames("flex items-center justify-center rounded-full bg-slate-100 text-slate-300", iconClassName)}>
        <SearchIcon className={iconSizeClassName} />
      </div>
      <h3 className={titleClassName}>{title}</h3>
      <p className={descriptionClassName}>{description}</p>
      {children}
    </div>
  );
}

function renderConversationRow({
  conversation,
  activeConversationId,
  highlightedConversationId,
  onSelectConversation
}: {
  conversation: ConversationSummary;
  activeConversationId?: string;
  highlightedConversationId?: string | null;
  onSelectConversation?: (conversationId: string) => void;
}) {
  const isActive = conversation.id === activeConversationId;
  const isKeyboardHighlighted = conversation.id === highlightedConversationId && !isActive;
  const isUnread = conversation.unreadCount > 0;
  const isResolved = conversation.status === "resolved";
  const name = conversationLabel(conversation);
  const secondary = conversationSecondaryLabel(conversation);
  const initials = initialsFromLabel(name);
  const location = locationLabel(conversation);

  return (
    <DashboardLink
      key={conversation.id}
      href={`/dashboard/inbox?id=${conversation.id}`}
      onClick={(event) => {
        if (!onSelectConversation || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
          return;
        }

        event.preventDefault();
        onSelectConversation(conversation.id);
      }}
      className={classNames(
        "relative block rounded-lg border border-transparent px-2.5 py-2.5 transition",
        isResolved && !isActive && "opacity-80",
        isActive
          ? "border-blue-200 bg-white before:absolute before:bottom-2 before:left-0 before:top-2 before:w-[3px] before:rounded-full before:bg-blue-600 before:content-['']"
          : isKeyboardHighlighted
            ? "border-slate-200 bg-slate-50"
            : isUnread
              ? "bg-blue-50 hover:bg-blue-50/80"
              : "hover:bg-slate-50"
      )}
    >
      <div className="flex gap-2.5">
        <div
          className={classNames(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[13px] font-medium",
            isUnread ? "bg-blue-100 text-blue-600" : isResolved ? "bg-slate-100 text-slate-500" : "bg-slate-100 text-slate-600"
          )}
        >
          {isResolved ? <CheckIcon className="h-4 w-4" /> : initials}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className={classNames("truncate text-sm", isUnread ? "font-semibold text-slate-900" : "font-normal text-slate-700")}>{name}</p>
              <p className="truncate text-xs font-normal leading-5 text-slate-400">{secondary}</p>
            </div>
            <span className="shrink-0 pt-0.5 text-xs font-normal leading-5 text-slate-400">{conversationTimestamp(conversation)}</span>
          </div>

          <div className="mt-1 flex items-center text-[13px] leading-5">
            {isUnread ? <span className="mr-1.5 h-2 w-2 rounded-full bg-blue-600" /> : null}
            <p className={classNames("truncate", isUnread ? "font-medium text-slate-700" : "font-normal text-slate-500")}>
              {truncate(conversation.lastMessagePreview || "No messages yet", 48)}
            </p>
          </div>

          <div className="mt-1.5 flex items-center gap-1.5 text-[11px] leading-4 text-slate-400">
            <span className="rounded bg-slate-100 px-1.5 py-0.5">{pageLabelFromUrl(conversation.pageUrl)}</span>
            {location ? (
              <>
                <span>&bull;</span>
                <span className="truncate">{location}</span>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </DashboardLink>
  );
}

export function renderThreadsBody({
  conversations,
  activeConversationId,
  highlightedConversationId,
  onSelectConversation,
  widgetInstalled,
  showEmptyList,
  showEmptySearch
}: Pick<DashboardThreadsPanelProps, "conversations" | "activeConversationId" | "highlightedConversationId" | "onSelectConversation"> & {
  widgetInstalled: boolean;
  showEmptyList: boolean;
  showEmptySearch: boolean;
}) {
  if (showEmptyList) {
    return (
      <EmptyThreadsState
        iconClassName="h-16 w-16"
        iconSizeClassName="h-7 w-7"
        title="No conversations yet"
        description="When visitors start chatting on your site, they&apos;ll appear here."
      >
        {!widgetInstalled ? <DashboardWidgetInstallLink label="Install widget" className="mt-5 inline-flex items-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700" /> : null}
      </EmptyThreadsState>
    );
  }

  if (showEmptySearch) {
    return (
      <EmptyThreadsState
        iconClassName="h-12 w-12"
        iconSizeClassName="h-5 w-5"
        title="No conversations found"
        description="Try adjusting your search or filters."
        titleClassName="mt-4 text-slate-600"
        descriptionClassName="text-slate-400"
      />
    );
  }

  return <div className="space-y-1">{conversations.map((conversation) => renderConversationRow({ conversation, activeConversationId, highlightedConversationId, onSelectConversation }))}</div>;
}
