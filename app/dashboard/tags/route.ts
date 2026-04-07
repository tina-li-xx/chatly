import { toggleTag } from "@/lib/data";
import { jsonError, jsonOk, requireJsonRouteUser } from "@/lib/route-helpers";
import { withRouteErrorAlerting } from "@/lib/route-error-alerting";

async function handlePOST(request: Request) {
  const auth = await requireJsonRouteUser();
  if ("response" in auth) {
    return auth.response;
  }
  const { user } = auth;

  const formData = await request.formData();
  const conversationId = String(formData.get("conversationId") ?? "").trim();
  const tag = String(formData.get("tag") ?? "").trim();

  if (!conversationId || !tag) {
    return jsonError("missing-fields", 400);
  }

  const updated = await toggleTag(conversationId, tag, user.id);
  if (!updated) {
    return jsonError("not-found", 404);
  }

  return jsonOk({ conversationId, tag });
}

export const POST = withRouteErrorAlerting(handlePOST, "app/dashboard/tags/route.ts:POST");
