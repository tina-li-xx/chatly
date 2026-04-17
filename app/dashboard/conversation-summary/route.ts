import { getConversationSummaryById } from "@/lib/services";
import { jsonError, jsonOk, requireJsonRouteUser } from "@/lib/route-helpers";
import { withRouteErrorAlerting } from "@/lib/route-error-alerting";

async function handleGET(request: Request) {
  const auth = await requireJsonRouteUser();
  if ("response" in auth) {
    return auth.response;
  }

  const { searchParams } = new URL(request.url);
  const conversationId = String(searchParams.get("conversationId") ?? "").trim();

  if (!conversationId) {
    return jsonError("missing-fields", 400);
  }

  const summary = await getConversationSummaryById(conversationId, auth.user.id);
  if (!summary) {
    return jsonError("not-found", 404);
  }

  return jsonOk({ summary });
}

export const GET = withRouteErrorAlerting(handleGET, "app/dashboard/conversation-summary/route.ts:GET");
