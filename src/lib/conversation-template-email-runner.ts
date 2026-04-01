import {
  getOfflineReplyMessageId,
  buildConversationTemplateRetryLeaseUntil,
  type ReplyAttachment
} from "@/lib/conversation-template-email-policy";
import { retryQueuedConversationTemplateEmail } from "@/lib/conversation-template-emails";
import {
  claimRetryableTemplateDeliveries,
  listStoredMessageAttachments
} from "@/lib/repositories/conversation-template-email-repository";

const DELIVERY_BATCH_LIMIT = 20;

async function loadRetryAttachments(input: {
  templateKey: string;
  deliveryKey: string;
}): Promise<ReplyAttachment[]> {
  if (input.templateKey !== "offline_reply") {
    return [];
  }

  const messageId = getOfflineReplyMessageId(input.deliveryKey);
  if (!messageId) {
    return [];
  }

  const attachments = await listStoredMessageAttachments(messageId);
  return attachments.map((attachment) => ({
    fileName: attachment.file_name,
    contentType: attachment.content_type,
    content: attachment.content
  }));
}

export async function runScheduledConversationTemplateEmailRetries(now = new Date()) {
  const deliveries = await claimRetryableTemplateDeliveries({
    now,
    leaseUntil: buildConversationTemplateRetryLeaseUntil(now),
    limit: DELIVERY_BATCH_LIMIT
  });
  let sentDeliveries = 0;
  let queuedDeliveries = 0;
  let skippedDeliveries = 0;
  let erroredDeliveries = 0;

  for (const delivery of deliveries) {
    try {
      const result = await retryQueuedConversationTemplateEmail({
        conversationId: delivery.conversationId,
        userId: delivery.userId,
        templateKey: delivery.templateKey,
        deliveryKey: delivery.deliveryKey,
        attemptCount: delivery.attemptCount,
        attachments: await loadRetryAttachments(delivery)
      });

      if (result === "sent") {
        sentDeliveries += 1;
      } else if (result === "queued_retry") {
        queuedDeliveries += 1;
      } else {
        skippedDeliveries += 1;
      }
    } catch (error) {
      erroredDeliveries += 1;
      console.error("conversation template email retry failed", error);
    }
  }

  return {
    processedDeliveries: deliveries.length,
    sentDeliveries,
    queuedDeliveries,
    skippedDeliveries,
    erroredDeliveries
  };
}
