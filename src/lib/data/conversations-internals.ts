import { randomUUID } from "node:crypto";
import {
  findConversationById,
  findConversationIdentityForActivity,
  findPreviousConversationByIdentity,
  hasPublicConversationAccessRecord,
  incrementConversationUnreadSnapshots,
  insertAttachmentRecord,
  insertConversationRecord,
  insertMessageRecord,
  listConversationMessageRows,
  touchConversationAfterMessage,
  upsertConversationMetadataRecord
} from "@/lib/repositories/conversations-repository";
import type { VisitorActivity } from "@/lib/types";
import { optionalText } from "@/lib/utils";
import { getWorkspaceAccess } from "@/lib/workspace-access";
import {
  mapAttachment,
  mapMessage,
  queryMessageAttachmentRows,
  updateConversationEmailValue,
  type CreateUserMessageInput,
  type UploadedAttachmentInput
} from "./shared";
import { getConversationVisitorActivityAggregate } from "@/lib/repositories/conversations-repository";

export async function ensureConversation(input: CreateUserMessageInput) {
  const requestedId = input.conversationId?.trim();
  const normalizedEmail = optionalText(input.email);

  if (requestedId) {
    const existing = await findConversationById(requestedId);

    if (existing && existing.site_id === input.siteId) {
      await updateConversationEmailValue(requestedId, input.email, "merge");
      return {
        conversationId: requestedId,
        createdConversation: false,
        emailCaptured: Boolean(normalizedEmail && !optionalText(existing.email))
      };
    }
  }

  const conversationId = randomUUID();
  await insertConversationRecord({
    conversationId,
    siteId: input.siteId,
    email: optionalText(input.email),
    sessionId: input.sessionId
  });

  return {
    conversationId,
    createdConversation: true,
    emailCaptured: Boolean(normalizedEmail)
  };
}

export async function hasPreviousVisitorConversation(input: {
  siteId: string;
  conversationId: string;
  email: string | null | undefined;
  sessionId: string;
}) {
  const normalizedEmail = optionalText(input.email);
  return findPreviousConversationByIdentity({
    siteId: input.siteId,
    conversationId: input.conversationId,
    useEmail: Boolean(normalizedEmail),
    matchValue: normalizedEmail ?? input.sessionId
  });
}

export async function getPublicConversationAccess(input: {
  siteId: string;
  sessionId: string;
  conversationId: string;
}) {
  return hasPublicConversationAccessRecord(input);
}

export async function getConversationVisitorActivity(
  conversationId: string,
  userId: string
): Promise<VisitorActivity | null> {
  const workspace = await getWorkspaceAccess(userId);
  const identity = await findConversationIdentityForActivity(conversationId, workspace.ownerUserId);

  if (!identity) {
    return null;
  }

  const matchType = identity.email ? "email" : "session";
  const row = await getConversationVisitorActivityAggregate({
    siteId: identity.site_id,
    conversationId,
    useEmail: Boolean(identity.email),
    matchValue: identity.email ?? identity.session_id
  });

  return {
    matchType,
    otherQuestionsLastMonth: Number(row?.other_questions_last_month ?? 0),
    otherConversationsLastMonth: Number(row?.other_conversations_last_month ?? 0),
    otherConversationsTotal: Number(row?.other_conversations_total ?? 0),
    lastSeenAt: row?.last_seen_at ?? null
  };
}

export async function upsertMetadata(
  conversationId: string,
  metadata: CreateUserMessageInput["metadata"]
) {
  await upsertConversationMetadataRecord({
    conversationId,
    pageUrl: optionalText(metadata.pageUrl),
    referrer: optionalText(metadata.referrer),
    userAgent: optionalText(metadata.userAgent),
    country: optionalText(metadata.country),
    region: optionalText(metadata.region),
    city: optionalText(metadata.city),
    timezone: optionalText(metadata.timezone),
    locale: optionalText(metadata.locale)
  });
}

export async function insertAttachments(messageId: string, attachments: UploadedAttachmentInput[] = []) {
  for (const attachment of attachments) {
    await insertAttachmentRecord({
      attachmentId: randomUUID(),
      messageId,
      fileName: attachment.fileName,
      contentType: attachment.contentType,
      sizeBytes: attachment.sizeBytes,
      content: attachment.content
    });
  }
}

export async function loadConversationMessages(
  conversationId: string,
  buildAttachmentUrl: (attachmentId: string) => string
) {
  const messageRows = await listConversationMessageRows(conversationId);
  const attachments = await queryMessageAttachmentRows(messageRows.map((row) => row.id));
  const attachmentsByMessageId = new Map<string, ReturnType<typeof mapAttachment>[]>();

  for (const attachment of attachments) {
    const mapped = mapAttachment(attachment, buildAttachmentUrl(attachment.id));
    const current = attachmentsByMessageId.get(attachment.message_id) ?? [];
    current.push(mapped);
    attachmentsByMessageId.set(attachment.message_id, current);
  }

  return messageRows.map((message) => mapMessage(message, attachmentsByMessageId.get(message.id) ?? []));
}

export async function insertMessage(
  conversationId: string,
  sender: "user" | "team",
  content: string,
  attachments: UploadedAttachmentInput[] = [],
  options?: {
    authorUserId?: string | null;
    reopenConversation?: boolean;
  }
) {
  const messageId = randomUUID();
  const inserted = await insertMessageRecord({
    messageId,
    conversationId,
    sender,
    authorUserId: options?.authorUserId ?? null,
    content: content.trim()
  });

  await insertAttachments(messageId, attachments);
  await touchConversationAfterMessage(conversationId, Boolean(options?.reopenConversation), {
    createdAt: inserted.created_at,
    preview: inserted.content
  });
  if (sender === "user") {
    await incrementConversationUnreadSnapshots(conversationId);
  }

  const attachmentRows = await queryMessageAttachmentRows([messageId]);
  return mapMessage(
    inserted,
    attachmentRows.map((attachment) =>
      mapAttachment(attachment, `/api/files/${attachment.id}?conversationId=${encodeURIComponent(conversationId)}`)
    )
  );
}
