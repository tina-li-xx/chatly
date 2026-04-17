import { updateConversationTyping } from "@/lib/services";
import { publishConversationLive, publishDashboardLive } from "@/lib/live-events";
import { jsonError, jsonOk, requireJsonRouteUser } from "@/lib/route-helpers";
import { withRouteErrorAlerting } from "@/lib/route-error-alerting";

async function handlePOST(request: Request) {
  const auth = await requireJsonRouteUser();
  if ("response" in auth) {
    return auth.response;
  }

  const body = await request.json().catch(() => null);
  const conversationId = String(body?.conversationId ?? "").trim();
  const typing = Boolean(body?.typing);

  if (!conversationId) {
    return jsonError("not-found", 404);
  }

  const ok = await updateConversationTyping({
    conversationId,
    userId: auth.user.id,
    typing
  });

  if (!ok) {
    return jsonError("not-found", 404);
  }

  publishConversationLive(conversationId, {
    type: "typing.updated",
    conversationId,
    actor: "team",
    typing
  });
  publishDashboardLive(auth.user.workspaceOwnerId, {
    type: "typing.updated",
    conversationId,
    actor: "team",
    typing
  });

  return jsonOk({ conversationId, typing });
}

export const POST = withRouteErrorAlerting(handlePOST, "app/dashboard/typing/route.ts:POST");
