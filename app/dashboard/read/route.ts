import { markConversationRead } from "@/lib/data";
import { publishDashboardLive } from "@/lib/live-events";
import { jsonError, jsonOk, requireJsonRouteUser } from "@/lib/route-helpers";
import { withRouteErrorAlerting } from "@/lib/route-error-alerting";

async function handlePOST(request: Request) {
  const auth = await requireJsonRouteUser();
  if ("response" in auth) {
    return auth.response;
  }

  const body = await request.json().catch(() => null);
  const conversationId = String(body?.conversationId ?? "").trim();

  if (!conversationId) {
    return jsonError("missing-fields", 400);
  }

  const updated = await markConversationRead(conversationId, auth.user.id);
  if (!updated) {
    return jsonError("not-found", 404);
  }

  publishDashboardLive(auth.user.workspaceOwnerId, {
    type: "conversation.read",
    conversationId,
    updatedAt: new Date().toISOString()
  });

  return jsonOk({ conversationId });
}

export const POST = withRouteErrorAlerting(handlePOST, "app/dashboard/read/route.ts:POST");
