import { addFounderReply, getConversationEmail, markConversationRead } from "@/lib/data";
import { sendOfflineReplyTemplateEmail } from "@/lib/conversation-template-emails";
import { extractUploadedAttachments } from "@/lib/conversation-io";
import { publishConversationLive, publishDashboardLive } from "@/lib/live-events";
import { jsonError, jsonOk, requireJsonRouteUser } from "@/lib/route-helpers";

export async function POST(request: Request) {
  const auth = await requireJsonRouteUser();
  if ("response" in auth) {
    return auth.response;
  }
  const { user } = auth;

  const formData = await request.formData();
  const conversationId = String(formData.get("conversationId") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const attachments = await extractUploadedAttachments(formData);

  if (!content && !attachments.length) {
    return jsonError("empty-reply", 400);
  }

  const conversation = await getConversationEmail(conversationId, user.id);
  if (!conversation) {
    return jsonError("not-found", 404);
  }

  try {
    const message = await addFounderReply(conversationId, content, user.id, attachments);

    if (!message) {
      return jsonError("not-found", 404);
    }

    await markConversationRead(conversationId, user.id);

    let emailDelivery: "sent" | "skipped" | "queued_retry" | "failed" = "skipped";

    if (conversation.email) {
      try {
        const delivery = await sendOfflineReplyTemplateEmail({
          conversationId,
          userId: user.id,
          messageId: message.id,
          attachments: attachments.map((attachment) => ({
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

    publishConversationLive(conversationId, {
      type: "message.created",
      conversationId,
      sender: "founder",
      createdAt: message.createdAt
    });
    publishDashboardLive(user.workspaceOwnerId, {
      type: "message.created",
      conversationId,
      sender: "founder",
      createdAt: message.createdAt
    });
    publishDashboardLive(user.workspaceOwnerId, {
      type: "conversation.read",
      conversationId,
      updatedAt: message.createdAt
    });

    return jsonOk({ conversationId, message, emailDelivery });
  } catch (error) {
    console.error("reply post failed", error);
    if (error instanceof Error && error.message === "ATTACHMENT_LIMIT") {
      return jsonError("attachment-limit", 400);
    }
    if (error instanceof Error && error.message === "ATTACHMENT_TOO_LARGE") {
      return jsonError("attachment-too-large", 400);
    }
    return jsonError("reply-failed", 500);
  }
}
