import { NextResponse } from "next/server";
import { addInboundReply, getConversationNotificationContext } from "@/lib/data";
import { publishConversationLive } from "@/lib/live-events";
import { previewIncomingMessage } from "@/lib/notification-utils";
import { parseSesInboundReply } from "@/lib/ses-inbound";
import { verifySnsWebhookPayload } from "@/lib/sns-webhook-auth";
import { notifyIncomingVisitorMessage } from "@/lib/team-notifications";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function isTrustedSubscribeUrl(rawUrl: string) {
  try {
    const url = new URL(rawUrl);
    return url.protocol === "https:" && url.hostname.endsWith(".amazonaws.com");
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json().catch(() => null);
    const verified = await verifySnsWebhookPayload(payload);

    if (!verified.ok) {
      return jsonError(verified.error, verified.status);
    }

    const envelope = verified.envelope;

    if (envelope.Type === "SubscriptionConfirmation") {
      const subscribeUrl = envelope.SubscribeURL;

      if (!subscribeUrl || !isTrustedSubscribeUrl(subscribeUrl)) {
        return jsonError("Unauthorized webhook.", 401);
      }

      await fetch(subscribeUrl);
      return NextResponse.json({ ok: true });
    }

    if (envelope.Type !== "Notification") {
      return NextResponse.json({ ok: true, ignored: true });
    }

    const inbound = await parseSesInboundReply(envelope.Message);

    if (inbound.ignored) {
      return NextResponse.json({ ok: true, ignored: true });
    }

    const { conversationId, senderEmail, body } = inbound;

    const message = await addInboundReply(conversationId, senderEmail, body);
    const context = await getConversationNotificationContext(conversationId);

    publishConversationLive(conversationId, {
      type: "message.created",
      conversationId,
      sender: "user",
      createdAt: message.createdAt
    });
    publishConversationLive(conversationId, {
      type: "conversation.updated",
      conversationId,
      status: "open",
      updatedAt: message.createdAt
    });

    if (context) {
      const summary = context.summary;

      await notifyIncomingVisitorMessage({
        userId: context.userId,
        conversationId,
        createdAt: message.createdAt,
        preview: previewIncomingMessage(body, 0),
        siteName: context.siteName,
        visitorLabel: summary?.email ?? senderEmail,
        pageUrl: summary?.pageUrl ?? null,
        location: [summary?.city, summary?.region, summary?.country].filter(Boolean).join(", ") || null,
        attachmentsCount: 0,
        isNewConversation: false,
        isNewVisitor: false,
        highIntent: false
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("ses inbound error", error);
    const message =
      error instanceof Error ? error.message : "Unable to process inbound email.";

    return jsonError(message);
  }
}
