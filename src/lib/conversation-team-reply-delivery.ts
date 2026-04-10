import { sendOfflineReplyTemplateEmail } from "@/lib/conversation-template-emails";
import { sendConversationMobilePushNotifications } from "@/lib/mobile-push-delivery";
import {
  getConversationReplyDeliveryState,
  markConversationRead
} from "@/lib/data";
import { insertMessage } from "@/lib/data/conversations-internals";
import type { UploadedAttachmentInput } from "@/lib/data/shared";
import { publishConversationLive, publishDashboardLive } from "@/lib/live-events";
import { hasConversationAccess } from "@/lib/repositories/shared-conversation-repository";
import { getWorkspaceAccess } from "@/lib/workspace-access";

type TeamReplyEmailDelivery =
  | "sent"
  | "skipped"
  | "queued_retry"
  | "failed";

async function addScopedTeamReply(input: {
  conversationId: string;
  actorUserId: string;
  authorUserId?: string | null;
  content: string;
  attachments?: UploadedAttachmentInput[];
}) {
  const workspace = await getWorkspaceAccess(input.actorUserId);
  const allowed = await hasConversationAccess(
    input.conversationId,
    workspace.ownerUserId,
    input.actorUserId
  );

  if (!allowed) {
    return null;
  }

  return insertMessage(
    input.conversationId,
    "team",
    input.content,
    input.attachments ?? [],
    { authorUserId: input.authorUserId ?? null }
  );
}

export async function deliverConversationTeamReply(input: {
  conversationId: string;
  actorUserId: string;
  workspaceOwnerId: string;
  content: string;
  attachments?: UploadedAttachmentInput[];
  authorUserId?: string | null;
  markReadUserId?: string | null;
}) {
  const conversation = await getConversationReplyDeliveryState(
    input.conversationId,
    input.actorUserId
  );

  if (!conversation) {
    return null;
  }

  const message = await addScopedTeamReply({
    conversationId: input.conversationId,
    actorUserId: input.actorUserId,
    authorUserId: input.authorUserId,
    content: input.content,
    attachments: input.attachments
  });

  if (!message) {
    return null;
  }

  if (input.markReadUserId) {
    await markConversationRead(input.conversationId, input.markReadUserId);
  }

  let emailDelivery: TeamReplyEmailDelivery = "skipped";

  if (conversation.email && !conversation.visitor_is_live) {
    try {
      const delivery = await sendOfflineReplyTemplateEmail({
        conversationId: input.conversationId,
        userId: input.actorUserId,
        messageId: message.id,
        attachments: (input.attachments ?? []).map((attachment) => ({
          fileName: attachment.fileName,
          contentType: attachment.contentType,
          content: attachment.content
        }))
      });
      emailDelivery =
        delivery === "sent"
          ? "sent"
          : delivery === "queued_retry"
            ? "queued_retry"
            : "skipped";
    } catch (error) {
      console.error("reply email send failed", error);
      emailDelivery = "failed";
    }
  }

  try {
    await sendConversationMobilePushNotifications({
      ownerUserId: input.workspaceOwnerId,
      conversationId: input.conversationId,
      content: input.content,
      attachmentsCount: input.attachments?.length ?? 0
    });
  } catch (error) {
    console.error("mobile push send failed", error);
  }

  publishConversationLive(input.conversationId, {
    type: "message.created",
    conversationId: input.conversationId,
    sender: "team",
    createdAt: message.createdAt
  });
  publishDashboardLive(input.workspaceOwnerId, {
    type: "message.created",
    conversationId: input.conversationId,
    sender: "team",
    createdAt: message.createdAt
  });
  publishDashboardLive(input.workspaceOwnerId, {
    type: "conversation.read",
    conversationId: input.conversationId,
    updatedAt: message.createdAt
  });

  return {
    conversationId: input.conversationId,
    message,
    emailDelivery
  };
}
