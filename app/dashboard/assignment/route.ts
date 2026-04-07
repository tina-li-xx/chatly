import {
  getConversationSummaryById,
  updateConversationAssignment
} from "@/lib/data";
import { publishDashboardLive } from "@/lib/live-events";
import { jsonError, jsonOk, requireJsonRouteUser } from "@/lib/route-helpers";
import { withRouteErrorAlerting } from "@/lib/route-error-alerting";

async function handlePOST(request: Request) {
  const auth = await requireJsonRouteUser();
  if ("response" in auth) {
    return auth.response;
  }

  const formData = await request.formData().catch(() => null);
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

    return jsonOk({ conversationId, assignedUserId: updated.assignedUserId });
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_ASSIGNEE") {
      return jsonError("invalid-assignee", 400);
    }

    return jsonError("assignment-failed", 500);
  }
}

export const POST = withRouteErrorAlerting(handlePOST, "app/dashboard/assignment/route.ts:POST");
