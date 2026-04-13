import {
  getConversationSummaryById,
  updateConversationAssignment
} from "@/lib/data";
import { publishDashboardLive } from "@/lib/live-events";
import { readOptionalRouteFormData } from "@/lib/route-form-data";
import { jsonError, jsonOk, requireJsonRouteUser } from "@/lib/route-helpers";
import { withRouteErrorAlerting } from "@/lib/route-error-alerting";
import { sendTeamMobilePushNotifications } from "@/lib/team-mobile-push";

async function handlePOST(request: Request) {
  const auth = await requireJsonRouteUser();
  if ("response" in auth) {
    return auth.response;
  }

  const formData = await readOptionalRouteFormData(request);
  const conversationId = String(formData?.get("conversationId") ?? "").trim();
  const assignedUserId = String(formData?.get("assignedUserId") ?? "").trim();

  if (!conversationId) {
    return jsonError("missing-fields", 400);
  }

  try {
    const updated = await updateConversationAssignment(
      conversationId,
      assignedUserId || null,
      auth.user.id
    );

    if (!updated) {
      return jsonError("not-found", 404);
    }

    const summary = await getConversationSummaryById(conversationId, auth.user.id);
    publishDashboardLive(auth.user.workspaceOwnerId, {
      type: "conversation.updated",
      conversationId,
      status: summary?.status ?? "open",
      updatedAt: summary?.updatedAt ?? new Date().toISOString()
    });
    if (updated.assignedUserId && updated.assignedUserId !== auth.user.id) {
      await sendTeamMobilePushNotifications({
        body: `${auth.user.email} assigned you a chat with ${summary?.email || summary?.siteName || "a visitor"}.`,
        userId: updated.assignedUserId,
        conversationId,
        notificationType: "assigned",
        senderName: auth.user.email,
        title: "Conversation assigned"
      });
    }

    return jsonOk({ conversationId, assignedUserId: updated.assignedUserId });
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_ASSIGNEE") {
      return jsonError("invalid-assignee", 400);
    }

    return jsonError("assignment-failed", 500);
  }
}

export const POST = withRouteErrorAlerting(handlePOST, "app/dashboard/assignment/route.ts:POST");
