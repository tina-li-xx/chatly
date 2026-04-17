import { randomUUID } from "node:crypto";
import { jsonError, jsonOk } from "@/lib/route-helpers";
import { withRouteErrorAlerting } from "@/lib/route-error-alerting";
import { requireZapierApiAuth } from "@/lib/zapier-api-auth";
import {
  upsertWorkspaceZapierWebhookRow,
  type ZapierEventType
} from "@/lib/services/integrations";

const ZAPIER_EVENTS = new Set<ZapierEventType>([
  "conversation.created",
  "conversation.resolved",
  "contact.created",
  "tag.added"
]);

function isValidTargetUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

async function handlePOST(request: Request) {
  const auth = await requireZapierApiAuth(request);
  if ("response" in auth) {
    return auth.response;
  }

  const body = (await request.json().catch(() => null)) as
    | Record<string, unknown>
    | null;
  const event = String(body?.event ?? "").trim() as ZapierEventType;
  const targetUrl = String(body?.target_url ?? "").trim();

  if (!ZAPIER_EVENTS.has(event) || !isValidTargetUrl(targetUrl)) {
    return jsonError("invalid-subscription", 400);
  }

  const subscription = await upsertWorkspaceZapierWebhookRow({
    id: randomUUID(),
    ownerUserId: auth.auth.ownerUserId,
    eventType: event,
    targetUrl
  });

  if (!subscription) {
    return jsonError("subscription-save-failed", 500);
  }

  return jsonOk(
    {
      id: subscription.id,
      event: subscription.event_type,
      active: subscription.active
    },
    201
  );
}

export const POST = withRouteErrorAlerting(
  handlePOST,
  "app/api/zapier/webhooks/subscribe/route.ts:POST"
);
