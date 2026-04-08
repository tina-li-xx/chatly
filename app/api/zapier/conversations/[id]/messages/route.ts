import { deliverConversationTeamReply } from "@/lib/conversation-team-reply-delivery";
import { jsonError, jsonOk } from "@/lib/route-helpers";
import { withRouteErrorAlerting } from "@/lib/route-error-alerting";
import { requireZapierApiAuth } from "@/lib/zapier-api-auth";
import { withZapierIdempotentJsonResponse } from "@/lib/zapier-idempotency";

async function handlePOST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireZapierApiAuth(request);
  if ("response" in auth) {
    return auth.response;
  }

  const body = (await request.json().catch(() => null)) as
    | Record<string, unknown>
    | null;
  const message = String(body?.message ?? "").trim();
  if (!message) {
    return jsonError("missing-message", 400);
  }

  const { id } = await context.params;
  return withZapierIdempotentJsonResponse({
    request,
    auth: auth.auth,
    requestBody: {
      route: "conversations.messages.create",
      conversationId: id,
      message,
      sender: String(body?.sender ?? "")
    },
    execute: async () => {
      const result = await deliverConversationTeamReply({
        conversationId: id,
        actorUserId: auth.auth.ownerUserId,
        workspaceOwnerId: auth.auth.ownerUserId,
        content: message,
        authorUserId: null,
        markReadUserId: auth.auth.ownerUserId
      });

      if (!result) {
        return jsonError("not-found", 404);
      }

      return jsonOk(
        {
          id: result.message.id,
          conversation_id: id,
          sender:
            body?.sender === "system" ? "system" : result.message.sender,
          created_at: result.message.createdAt
        },
        201
      );
    }
  });
}

export const POST = withRouteErrorAlerting(
  handlePOST,
  "app/api/zapier/conversations/[id]/messages/route.ts:POST"
);
