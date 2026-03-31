import { sendMentionNotificationEmail } from "@/lib/chatly-notification-email-senders";
import { getConversationSummaryById } from "@/lib/data/conversations";
import { getPublicAppUrl } from "@/lib/env";
import {
  listWorkspaceMentionNotificationRows,
  type WorkspaceMentionNotificationRow
} from "@/lib/repositories/mention-notification-repository";
import { displayNameFromEmail, firstNameFromDisplayName } from "@/lib/user-display";
import { formatRelativeTime, optionalText } from "@/lib/utils";

type MentionRecipient = WorkspaceMentionNotificationRow & {
  aliases: Set<string>;
  notificationAddress: string;
};

function collapseMentionValue(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
}

function buildMentionVariants(value: string | null | undefined) {
  const trimmed = value?.trim().toLowerCase();
  const collapsed = collapseMentionValue(value ?? "");
  return new Set([trimmed, collapsed].filter(Boolean) as string[]);
}

function buildDisplayName(row: Pick<WorkspaceMentionNotificationRow, "email" | "first_name" | "last_name">) {
  const explicit = [optionalText(row.first_name), optionalText(row.last_name)].filter(Boolean).join(" ").trim();
  return explicit || displayNameFromEmail(row.email);
}

function buildMentionRecipients(
  rows: WorkspaceMentionNotificationRow[],
  mentionerUserId: string
) {
  return rows
    .filter((row) => row.user_id !== mentionerUserId)
    .filter((row) => (row.email_notifications ?? true) && (row.mention_notifications ?? true))
    .map((row) => {
      const notificationAddress = optionalText(row.notification_email) || row.email;
      const displayName = buildDisplayName(row);
      const firstName = optionalText(row.first_name) || firstNameFromDisplayName(displayName);
      const lastName = optionalText(row.last_name);
      const emailLocalPart = row.email.split("@")[0] || "";
      const aliases = new Set<string>();

      for (const value of [firstName, lastName, displayName, emailLocalPart]) {
        for (const alias of buildMentionVariants(value)) {
          aliases.add(alias);
        }
      }

      return { ...row, aliases, notificationAddress } satisfies MentionRecipient;
    });
}

function buildConversationLabel(pageUrl: string | null | undefined) {
  if (!pageUrl) {
    return "Conversation";
  }

  try {
    const pathname = new URL(pageUrl, "https://chatting.local").pathname;
    const firstSegment = pathname.split("/").filter(Boolean)[0];
    if (!firstSegment) {
      return "Homepage conversation";
    }

    const label = firstSegment
      .split(/[-_]+/g)
      .filter(Boolean)
      .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1).toLowerCase()}`)
      .join(" ");

    return label ? `${label} conversation` : "Conversation";
  } catch {
    return "Conversation";
  }
}

export function extractMentionHandles(value: string) {
  const handles = new Set<string>();
  const pattern = /(^|[^a-z0-9._-])@([a-z0-9][a-z0-9._-]{0,63})/gi;

  for (const match of value.matchAll(pattern)) {
    const handle = match[2]?.trim().toLowerCase();
    if (handle) {
      handles.add(handle);
    }
  }

  return Array.from(handles);
}

export function resolveMentionRecipients(
  value: string,
  rows: WorkspaceMentionNotificationRow[],
  mentionerUserId: string
) {
  const recipients = buildMentionRecipients(rows, mentionerUserId);
  const matched = new Map<string, MentionRecipient>();

  for (const handle of extractMentionHandles(value)) {
    const handleVariants = buildMentionVariants(handle);
    const matches = recipients.filter((recipient) =>
      Array.from(handleVariants).some((variant) => recipient.aliases.has(variant))
    );

    if (matches.length === 1) {
      matched.set(matches[0].user_id, matches[0]);
    }
  }

  return Array.from(matched.values());
}

function buildMentionConversationUrl(conversationId: string, note: string) {
  const url = new URL("/dashboard/inbox", getPublicAppUrl());
  const handles = extractMentionHandles(note);

  url.searchParams.set("id", conversationId);
  url.searchParams.set("focus", "note");
  url.searchParams.set("note", note);
  if (handles[0]) {
    url.searchParams.set("mention", handles[0]);
  }

  return url.toString();
}

export async function sendConversationMentionNotifications(input: {
  conversationId: string;
  note: string;
  updatedAt?: string | null;
  mentionerUserId: string;
  mentionerEmail: string;
  workspaceOwnerId: string;
}) {
  const note = input.note.trim();
  if (!note) {
    return 0;
  }

  const rows = await listWorkspaceMentionNotificationRows(input.workspaceOwnerId);
  const recipients = resolveMentionRecipients(note, rows, input.mentionerUserId);
  if (!recipients.length) {
    return 0;
  }

  const summary = await getConversationSummaryById(input.conversationId, input.mentionerUserId);
  const senderRow = rows.find((row) => row.user_id === input.mentionerUserId);
  const mentionerName = senderRow
    ? buildDisplayName(senderRow)
    : displayNameFromEmail(input.mentionerEmail);
  const rawSummaryEmail = summary?.email;
  const summaryEmail = optionalText(rawSummaryEmail) ? rawSummaryEmail : null;
  const visitorName = summaryEmail ? displayNameFromEmail(summaryEmail) : "Visitor";
  const noteMeta = `${buildConversationLabel(summary?.pageUrl)} • ${formatRelativeTime(
    input.updatedAt || new Date().toISOString()
  )}`;
  const conversationUrl = buildMentionConversationUrl(input.conversationId, note);

  const deliveries = await Promise.allSettled(
    recipients.map((recipient) =>
      sendMentionNotificationEmail({
        to: recipient.notificationAddress,
        mentionerName,
        visitorName,
        note,
        noteMeta,
        conversationUrl
      })
    )
  );

  return deliveries.filter((delivery) => delivery.status === "fulfilled").length;
}
