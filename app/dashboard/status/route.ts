import { sendResolvedConversationTemplateEmails } from "@/lib/conversation-template-emails";
import {
  getConversationById,
  getConversationSummaryById,
  markConversationRead,
  updateConversationStatus
} from "@/lib/services";
import { publishConversationLive, publishDashboardLive } from "@/lib/live-events";
import { readOptionalRouteFormData } from "@/lib/route-form-data";
import { jsonError, jsonOk, requireJsonRouteUser } from "@/lib/route-helpers";
import { withRouteErrorAlerting } from "@/lib/route-error-alerting";
import { deliverZapierEvent } from "@/lib/zapier-event-delivery";
import { buildZapierConversationResolvedPayload } from "@/lib/zapier-event-payloads";

async function handlePOST(request: Request) {
  const auth = await requireJsonRouteUser();
  if ("response" in auth) {
    return auth.response;
  }

  const formData = await readOptionalRouteFormData(request);
  const conversationId = String(formData?.get("conversationId") ?? "").trim();
  const status = String(formData?.get("status") ?? "").trim();

  if (!conversationId || (status !== "open" && status !== "resolved")) {
    return jsonError("missing-fields", 400);
  }

  const updatedStatus = await updateConversationStatus(conversationId, status, auth.user.id);
  if (!updatedStatus) {
    return jsonError("not-found", 404);
  }

  if (updatedStatus === "resolved") {
    await markConversationRead(conversationId, auth.user.id);
  }

  const summary = await getConversationSummaryById(conversationId, auth.user.id);
  const updatedAt = summary?.updatedAt ?? new Date().toISOString();

  publishConversationLive(conversationId, {
    type: "conversation.updated",
    conversationId,
    status: updatedStatus,
    updatedAt
  });
  publishDashboardLive(auth.user.workspaceOwnerId, {
    type: "conversation.updated",
    conversationId,
    status: updatedStatus,
    updatedAt,
    assignedUserId: summary?.assignedUserId ?? null
  });

  if (updatedStatus === "resolved") {
    publishDashboardLive(auth.user.workspaceOwnerId, {
      type: "conversation.read",
      conversationId,
      updatedAt
    });

    const conversation = await getConversationById(conversationId, auth.user.id);
    await deliverZapierEvent({
      ownerUserId: auth.user.workspaceOwnerId,
      eventType: "conversation.resolved",
      payload: buildZapierConversationResolvedPayload({
        conversationId,
        visitorEmail: conversation?.email ?? null,
        resolvedBy: auth.user.email,
        messageCount: conversation?.messages.length ?? 0,
        durationSeconds: conversation
          ? Math.max(
              0,
              Math.round(
                (new Date(conversation.updatedAt).getTime() -
                  new Date(conversation.createdAt).getTime()) /
                  1000
              )
            )
          : 0,
        timestamp: updatedAt
      })
    });
  }

  if (updatedStatus === "resolved") {
    try {
      await sendResolvedConversationTemplateEmails({
        conversationId,
        userId: auth.user.id
      });
    } catch (templateError) {
      console.error("resolved conversation template email failed", templateError);
    }
  }

  return jsonOk({ conversationId, status: updatedStatus });
}

export const POST = withRouteErrorAlerting(handlePOST, "app/dashboard/status/route.ts:POST");
