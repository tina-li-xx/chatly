import { NextResponse } from "next/server";
import {
  addInboundReply,
  getConversationNotificationContext,
  listInboundReplyAuthorizedEmails
} from "@/lib/services/inbound-email";
import { publishConversationLive } from "@/lib/live-events";
import { previewIncomingMessage } from "@/lib/notification-utils";
import { parseSesInboundReply } from "@/lib/ses-inbound";
import { verifySnsWebhookPayload } from "@/lib/sns-webhook-auth";
import { notifyIncomingVisitorMessage } from "@/lib/team-notifications";
import { withRouteErrorAlerting } from "@/lib/route-error-alerting";

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

function normalizeEmailAddress(value: string | null | undefined) {
  const normalized = value?.trim().toLowerCase();
  return normalized ? normalized : null;
}

async function handlePOST(request: Request) {
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

    const { conversationId, senderEmail, body, attachments = [] } = inbound;
    const normalizedSenderEmail = normalizeEmailAddress(senderEmail);
    const authorizedEmails = normalizedSenderEmail
      ? await listInboundReplyAuthorizedEmails(conversationId)
      : [];

    if (!normalizedSenderEmail || !authorizedEmails.includes(normalizedSenderEmail)) {
      console.warn("ignoring unauthorized inbound reply", {
        conversationId,
        senderEmail,
        authorizedEmails
      });
      return NextResponse.json({ ok: true, ignored: true });
    }

    const message = await addInboundReply(conversationId, normalizedSenderEmail, body, attachments);
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
        preview: previewIncomingMessage(body, attachments.length),
        siteName: context.siteName,
        visitorLabel: summary?.email ?? normalizedSenderEmail,
        pageUrl: summary?.pageUrl ?? null,
        location: [summary?.city, summary?.region, summary?.country].filter(Boolean).join(", ") || null,
        attachmentsCount: attachments.length,
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

    return jsonError(message, 400);
  }
}

export const POST = withRouteErrorAlerting(handlePOST, "app/api/email/inbound/route.ts:POST");
