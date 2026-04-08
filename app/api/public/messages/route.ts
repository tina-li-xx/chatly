import { createUserMessage, getConversationSummaryById } from "@/lib/data";
import { extractUploadedAttachments, extractVisitorMetadata } from "@/lib/conversation-io";
import { sendWelcomeTemplateEmail } from "@/lib/conversation-template-emails";
import { publishConversationLive } from "@/lib/live-events";
import { publicJsonResponse, publicNoContentResponse } from "@/lib/public-api";
import { notifyIncomingVisitorMessage } from "@/lib/team-notifications";
import { withRouteErrorAlerting } from "@/lib/route-error-alerting";
import { deliverZapierEvent } from "@/lib/zapier-event-delivery";
import { buildZapierConversationCreatedPayload } from "@/lib/zapier-event-payloads";

function handleOPTIONS() {
  return publicNoContentResponse();
}

async function handlePOST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";
    const isMultipart = contentType.includes("multipart/form-data");
    const body = isMultipart ? null : await request.json();
    const formData = isMultipart ? await request.formData() : null;
    const siteId = String((formData?.get("siteId") ?? body?.siteId) ?? "").trim();
    const sessionId = String((formData?.get("sessionId") ?? body?.sessionId) ?? "").trim();
    const content = String((formData?.get("content") ?? body?.content) ?? "").trim();
    const conversationIdValue = formData?.get("conversationId") ?? body?.conversationId;
    const emailValue = formData?.get("email") ?? body?.email;
    const conversationId = conversationIdValue ? String(conversationIdValue) : null;
    const email = emailValue ? String(emailValue) : null;
    const attachments = formData ? await extractUploadedAttachments(formData) : [];

    if (!siteId || !sessionId || (!content && !attachments.length)) {
      return publicJsonResponse(
        { error: "siteId, sessionId, and either content or an attachment are required." },
        { status: 400 }
      );
    }

    const metadata = extractVisitorMetadata(request, {
      pageUrl: formData ? String(formData.get("pageUrl") ?? "") : body?.pageUrl ? String(body.pageUrl) : null,
      referrer: formData ? String(formData.get("referrer") ?? "") : body?.referrer ? String(body.referrer) : null,
      timezone: formData ? String(formData.get("timezone") ?? "") : body?.timezone ? String(body.timezone) : null,
      locale: formData ? String(formData.get("locale") ?? "") : body?.locale ? String(body.locale) : null,
      visitorTags: formData?.get("visitorTags") ?? body?.visitorTags,
      customFields: formData?.get("customFields") ?? body?.customFields
    });

    const result = await createUserMessage({
      siteId,
      sessionId,
      conversationId,
      email,
      attachments,
      content,
      metadata
    });

    publishConversationLive(result.conversationId, {
      type: "message.created",
      conversationId: result.conversationId,
      sender: "user",
      createdAt: result.message.createdAt
    });
    publishConversationLive(result.conversationId, {
      type: "conversation.updated",
      conversationId: result.conversationId,
      status: "open",
      updatedAt: result.message.createdAt
    });
    if (result.automationReply) {
      publishConversationLive(result.conversationId, {
        type: "message.created",
        conversationId: result.conversationId,
        sender: "team",
        createdAt: result.automationReply.createdAt
      });
      publishConversationLive(result.conversationId, {
        type: "conversation.updated",
        conversationId: result.conversationId,
        status: "open",
        updatedAt: result.automationReply.createdAt
      });
    }

    if (result.isNewConversation) {
      const summary = await getConversationSummaryById(
        result.conversationId,
        result.siteUserId
      );
      await deliverZapierEvent({
        ownerUserId: result.siteUserId,
        eventType: "conversation.created",
        payload: buildZapierConversationCreatedPayload({
          conversationId: result.conversationId,
          visitorEmail: summary?.email ?? null,
          visitorName: result.visitorLabel,
          pageUrl: result.pageUrl,
          firstMessage: result.message.content,
          tags: summary?.tags ?? [],
          assignedTo: summary?.assignedUserId ?? null,
          createdAt: result.message.createdAt
        })
      });
    }

    if (!result.deferTeamNotification) {
      await notifyIncomingVisitorMessage({
        ...result.notification,
        ownerUserId: result.siteUserId
      });
    }

    if (result.welcomeEmailEligible) {
      try {
        await sendWelcomeTemplateEmail({
          conversationId: result.conversationId,
          userId: result.siteUserId
        });
      } catch (templateError) {
        console.error("welcome template email failed", templateError);
      }
    }

    return publicJsonResponse({
      ok: true,
      conversationId: result.conversationId,
      message: result.message,
      faqSuggestions: result.faqSuggestions ?? null
    });
  } catch (error) {
    console.error("public message error", error);
    const status =
      error instanceof Error && error.message === "SITE_NOT_FOUND"
        ? 404
        : error instanceof Error &&
            (error.message === "ATTACHMENT_LIMIT" || error.message === "ATTACHMENT_TOO_LARGE")
          ? 400
          : 500;
    const message =
      status === 404
        ? "Unknown siteId. Create a site in the dashboard first."
        : error instanceof Error && error.message === "ATTACHMENT_LIMIT"
          ? "You can attach up to 3 files per message."
          : error instanceof Error && error.message === "ATTACHMENT_TOO_LARGE"
            ? "Each attachment must be smaller than 4 MB."
            : "Unable to store message.";

    return publicJsonResponse({ error: message }, { status });
  }
}

export const OPTIONS = withRouteErrorAlerting(handleOPTIONS, "app/api/public/messages/route.ts:OPTIONS");
export const POST = withRouteErrorAlerting(handlePOST, "app/api/public/messages/route.ts:POST");
