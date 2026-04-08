import { sendMentionNotificationEmail } from "@/lib/chatting-notification-email-senders";
import { getConversationSummaryById } from "@/lib/data/conversations";
import { getPublicAppUrl } from "@/lib/env";
import {
  buildMentionDisplayName,
  buildMentionableTeammates,
  extractMentionHandles
} from "@/lib/mention-identities";
import { listWorkspaceMentionNotificationRows } from "@/lib/repositories/mention-notification-repository";
import {
  buildVisitorNoteMentionResolution,
  emptyVisitorNoteMentionResolution,
  type VisitorNoteMentionResolution
} from "@/lib/visitor-note-mention-structure";
import { displayNameFromEmail } from "@/lib/user-display";
import { formatRelativeTime, optionalText } from "@/lib/utils";

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

export { extractMentionHandles, resolveMentionRecipients } from "@/lib/mention-identities";

export async function listMentionableTeammates(input: {
  workspaceOwnerId: string;
  mentionerUserId: string;
}) {
  const rows = await listWorkspaceMentionNotificationRows(input.workspaceOwnerId);
  return buildMentionableTeammates(rows, input.mentionerUserId);
}

export async function resolveVisitorNoteMentionResolution(input: {
  note: string;
  workspaceOwnerId: string;
  mentionerUserId: string;
}) {
  const note = input.note.trim();
  if (!note) {
    return emptyVisitorNoteMentionResolution();
  }

  const rows = await listWorkspaceMentionNotificationRows(input.workspaceOwnerId);
  return buildVisitorNoteMentionResolution(note, rows, input.mentionerUserId);
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
  mentionResolution?: VisitorNoteMentionResolution;
}) {
  const note = input.note.trim();
  if (!note) {
    return emptyVisitorNoteMentionResolution();
  }

  const rows = await listWorkspaceMentionNotificationRows(input.workspaceOwnerId);
  const mentionResolution =
    input.mentionResolution ??
    buildVisitorNoteMentionResolution(note, rows, input.mentionerUserId);
  if (!mentionResolution.recipients.length) {
    return mentionResolution;
  }

  const summary = await getConversationSummaryById(input.conversationId, input.mentionerUserId);
  const senderRow = rows.find((row) => row.user_id === input.mentionerUserId);
  const mentionerName = senderRow
    ? buildMentionDisplayName(senderRow)
    : displayNameFromEmail(input.mentionerEmail);
  const rawSummaryEmail = summary?.email;
  const summaryEmail = optionalText(rawSummaryEmail) ? rawSummaryEmail : null;
  const visitorName = summaryEmail ? displayNameFromEmail(summaryEmail) : "Visitor";
  const noteMeta = `${buildConversationLabel(summary?.pageUrl)} • ${formatRelativeTime(
    input.updatedAt || new Date().toISOString()
  )}`;
  const conversationUrl = buildMentionConversationUrl(input.conversationId, note);

  await Promise.allSettled(
    mentionResolution.recipients.map((recipient) =>
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

  return mentionResolution;
}
