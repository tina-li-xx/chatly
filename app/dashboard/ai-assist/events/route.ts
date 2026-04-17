import { randomUUID } from "node:crypto";
import {
  parseDashboardAiAssistEventName,
  hasConversationAccess,
  insertWorkspaceAiAssistEvent
} from "@/lib/services/ai-assist";
import { jsonError, jsonOk, requireJsonRouteUser } from "@/lib/route-helpers";
import { getWorkspaceAccess } from "@/lib/workspace-access";
import { withRouteErrorAlerting } from "@/lib/route-error-alerting";

function sanitizeMetadata(input: unknown) {
  if (!input || typeof input !== "object") {
    return {};
  }

  const value = input as Record<string, unknown>;
  const editLevel =
    value.editLevel === "light" || value.editLevel === "heavy"
      ? value.editLevel
      : null;

  return {
    ...(typeof value.tone === "string" ? { tone: value.tone } : {}),
    ...(typeof value.tag === "string" ? { tag: value.tag } : {}),
    ...(typeof value.edited === "boolean"
      ? { edited: value.edited }
      : editLevel
        ? { edited: true }
        : {}),
    ...(editLevel ? { editLevel } : {})
  };
}

async function handlePOST(request: Request) {
  const auth = await requireJsonRouteUser();
  if ("response" in auth) {
    return auth.response;
  }

  const payload = (await request.json()) as Record<string, unknown>;
  const name = String(payload.name ?? "").trim();
  const conversationId = String(payload.conversationId ?? "").trim();
  const event = parseDashboardAiAssistEventName(name);

  if (!event || !conversationId) {
    return jsonError("invalid-event", 400);
  }

  const workspace = await getWorkspaceAccess(auth.user.id);
  const hasAccess = await hasConversationAccess(
    conversationId,
    workspace.ownerUserId,
    auth.user.id
  );

  if (!hasAccess) {
    return jsonError("not-found", 404);
  }

  await insertWorkspaceAiAssistEvent({
    id: randomUUID(),
    ownerUserId: workspace.ownerUserId,
    actorUserId: auth.user.id,
    conversationId,
    feature: event.feature,
    action: event.action,
    metadataJson: {
      eventName: name,
      ...sanitizeMetadata(payload.metadata)
    }
  });

  return jsonOk({ logged: true }, 202);
}

export const POST = withRouteErrorAlerting(handlePOST, "app/dashboard/ai-assist/events/route.ts:POST");
