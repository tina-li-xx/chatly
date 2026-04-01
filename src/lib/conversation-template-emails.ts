import { sendConversationTemplateEmail } from "@/lib/conversation-template-email-core";
import type {
  ConversationTemplateDeliveryStatus,
  ReplyAttachment,
  RetryQueuedConversationTemplateEmailInput
} from "@/lib/conversation-template-email-policy";

export type { ConversationTemplateDeliveryStatus, ReplyAttachment };

export async function sendOfflineReplyTemplateEmail(input: {
  conversationId: string;
  userId: string;
  messageId: string;
  attachments?: ReplyAttachment[];
}) {
  return sendConversationTemplateEmail({
    conversationId: input.conversationId,
    userId: input.userId,
    templateKey: "offline_reply",
    deliveryKey: `offline_reply:${input.messageId}`,
    attachments: input.attachments
  });
}

export async function sendWelcomeTemplateEmail(input: { conversationId: string; userId: string }) {
  return sendConversationTemplateEmail({
    conversationId: input.conversationId,
    userId: input.userId,
    templateKey: "welcome_email",
    deliveryKey: `welcome_email:${input.conversationId}`
  });
}

export async function retryQueuedConversationTemplateEmail(
  input: RetryQueuedConversationTemplateEmailInput
): Promise<ConversationTemplateDeliveryStatus> {
  return sendConversationTemplateEmail({ ...input, skipClaim: true });
}

export async function sendResolvedConversationTemplateEmails(input: {
  conversationId: string;
  userId: string;
}) {
  for (const templateKey of [
    "conversation_transcript",
    "follow_up_email",
    "satisfaction_survey"
  ] as const) {
    await sendConversationTemplateEmail({
      conversationId: input.conversationId,
      userId: input.userId,
      templateKey,
      deliveryKey: `${templateKey}:${input.conversationId}`
    });
  }
}
