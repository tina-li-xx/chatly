import { getConversationSummaryById, toggleTag } from "@/lib/data";
import { readRouteFormData } from "@/lib/route-form-data";
import { jsonError, jsonOk, requireJsonRouteUser } from "@/lib/route-helpers";
import { withRouteErrorAlerting } from "@/lib/route-error-alerting";
import { deliverZapierEvent } from "@/lib/zapier-event-delivery";
import { buildZapierTagAddedPayload } from "@/lib/zapier-event-payloads";

async function handlePOST(request: Request) {
  const auth = await requireJsonRouteUser();
  if ("response" in auth) {
    return auth.response;
  }
  const { user } = auth;

  const formData = await readRouteFormData(request);
  const conversationId = String(formData.get("conversationId") ?? "").trim();
  const tag = String(formData.get("tag") ?? "").trim();

  if (!conversationId || !tag) {
    return jsonError("missing-fields", 400);
  }

  const normalizedTag = tag.trim().toLowerCase();
  const before = await getConversationSummaryById(conversationId, user.id);
  const updated = await toggleTag(conversationId, tag, user.id);
  if (!updated) {
    return jsonError("not-found", 404);
  }

  const after = await getConversationSummaryById(conversationId, user.id);
  if (
    after?.tags.includes(normalizedTag) &&
    !(before?.tags ?? []).includes(normalizedTag)
  ) {
    await deliverZapierEvent({
      ownerUserId: user.workspaceOwnerId,
      eventType: "tag.added",
      payload: buildZapierTagAddedPayload({
        conversationId,
        tag: normalizedTag,
        addedBy: user.email
      })
    });
  }

  return jsonOk({ conversationId, tag });
}

export const POST = withRouteErrorAlerting(handlePOST, "app/dashboard/tags/route.ts:POST");
