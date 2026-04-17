import { jsonError, jsonOk } from "@/lib/route-helpers";
import { withRouteErrorAlerting } from "@/lib/route-error-alerting";
import { requireZapierApiAuth } from "@/lib/zapier-api-auth";
import { deactivateWorkspaceZapierWebhookRow } from "@/lib/services/integrations";

async function handleDELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireZapierApiAuth(request);
  if ("response" in auth) {
    return auth.response;
  }

  const { id } = await context.params;
  const subscription = await deactivateWorkspaceZapierWebhookRow(
    id,
    auth.auth.ownerUserId
  );

  if (!subscription) {
    return jsonError("not-found", 404);
  }

  return jsonOk({
    id: subscription.id,
    active: subscription.active
  });
}

export const DELETE = withRouteErrorAlerting(
  handleDELETE,
  "app/api/zapier/webhooks/[id]/route.ts:DELETE"
);
