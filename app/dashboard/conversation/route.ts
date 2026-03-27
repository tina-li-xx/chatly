import { getConversationById } from "@/lib/data";
import { jsonError, jsonOk, requireJsonRouteUser } from "@/lib/route-helpers";

export async function GET(request: Request) {
  const auth = await requireJsonRouteUser();
  if ("response" in auth) {
    return auth.response;
  }

  const { searchParams } = new URL(request.url);
  const conversationId = String(searchParams.get("conversationId") ?? "").trim();

  if (!conversationId) {
    return jsonError("missing-fields", 400);
  }

  const conversation = await getConversationById(conversationId, auth.user.id);
  if (!conversation) {
    return jsonError("not-found", 404);
  }

  return jsonOk({ conversation });
}
