"use client";

import type { ConversationThread, ThreadMessage } from "@/lib/types";
import { classNames, formatFileSize } from "@/lib/utils";

export function locationLabel(conversation: ConversationThread) {
  return [conversation.city, conversation.region, conversation.country].filter(Boolean).join(", ") || null;
}

export function browserLabel(userAgent: string | null) {
  if (!userAgent) {
    return "Unknown";
  }

  const source = userAgent.toLowerCase();
  const browser = source.includes("edg/")
    ? "Edge"
    : source.includes("chrome") && !source.includes("edg/")
      ? "Chrome"
      : source.includes("safari") && !source.includes("chrome")
        ? "Safari"
        : source.includes("firefox")
          ? "Firefox"
          : "Browser";
  const os = source.includes("mac os")
    ? "macOS"
    : source.includes("windows")
      ? "Windows"
      : source.includes("iphone") || source.includes("ipad")
        ? "iOS"
        : source.includes("android")
          ? "Android"
          : "OS";

  return `${browser} on ${os}`;
}

export function referrerLabel(referrer: string | null) {
  if (!referrer) {
    return "Direct";
  }

  try {
    return new URL(referrer).host.replace(/^www\./, "");
  } catch (error) {
    return referrer;
  }
}

function dayKey(value: string) {
  const date = new Date(value);
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

export function formatDayLabel(value: string) {
  const date = new Date(value);
  const today = new Date();

  if (date.toDateString() === today.toDateString()) {
    return "Today";
  }

  return new Intl.DateTimeFormat("en-GB", {
    month: "long",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

export function messageTime(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

export function groupedMessages(messages: ThreadMessage[]) {
  const groups: Array<{ type: "day"; value: string } | { type: "message"; value: ThreadMessage }> = [];
  let previousKey: string | null = null;

  for (const message of messages) {
    const currentKey = dayKey(message.createdAt);
    if (currentKey !== previousKey) {
      groups.push({ type: "day", value: formatDayLabel(message.createdAt) });
      previousKey = currentKey;
    }
    groups.push({ type: "message", value: message });
  }

  return groups;
}

export function tagToneClass(tag: string) {
  const tones = [
    "bg-blue-100 text-blue-700",
    "bg-emerald-100 text-emerald-700",
    "bg-amber-100 text-amber-700",
    "bg-slate-100 text-slate-600"
  ];
  const score = Array.from(tag).reduce((total, character) => total + character.charCodeAt(0), 0);
  return tones[score % tones.length];
}

export function replyPlaceholder(conversation: ConversationThread) {
  if (conversation.email) {
    return "Type a reply...";
  }

  return "Type a reply... The visitor can still see this in the widget.";
}

export function renderAttachments(message: ThreadMessage) {
  if (!message.attachments.length) {
    return null;
  }

  const teamMessage = message.sender === "founder";

  return (
    <div className="mt-3 space-y-2">
      {message.attachments.map((attachment) =>
        attachment.isImage ? (
          <a
            key={attachment.id}
            href={attachment.url}
            target="_blank"
            rel="noreferrer"
            className={classNames(
              "block overflow-hidden rounded-lg border text-left",
              teamMessage ? "border-white/20 bg-white/10" : "border-slate-200 bg-white"
            )}
          >
            <img src={attachment.url} alt={attachment.fileName} className="max-h-64 w-full object-cover" />
            <div className={classNames("px-3 py-2 text-xs", teamMessage ? "text-white/80" : "text-slate-600")}>
              {attachment.fileName} · {formatFileSize(attachment.sizeBytes)}
            </div>
          </a>
        ) : (
          <a
            key={attachment.id}
            href={attachment.url}
            target="_blank"
            rel="noreferrer"
            className={classNames(
              "block rounded-lg border px-3 py-3 text-sm",
              teamMessage ? "border-white/20 bg-white/10 text-white" : "border-slate-200 bg-white text-slate-900"
            )}
          >
            {attachment.fileName} · {formatFileSize(attachment.sizeBytes)}
          </a>
        )
      )}
    </div>
  );
}
