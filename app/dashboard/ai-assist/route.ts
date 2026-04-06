import { randomUUID } from "node:crypto";
import { maybeSendAiAssistWarningEmails } from "@/lib/ai-assist-warning-emails";
import { getDashboardConversationThreadById } from "@/lib/data/dashboard-conversation-thread";
import { getDashboardAiAssistBillingCycle } from "@/lib/data/dashboard-ai-assist-billing-cycle";
import { getDashboardAiAssistAccess } from "@/lib/data/settings-ai-assist-access";
import { generateDashboardAiAssist } from "@/lib/dashboard-ai-assist-service";
import {
  hasDashboardAiAssistAccess,
  validateDashboardAiAssistRequest
} from "@/lib/dashboard-ai-assist";
import { insertWorkspaceAiAssistEvent } from "@/lib/repositories/ai-assist-events-repository";
import { countWorkspaceAiAssistRequestsForRange } from "@/lib/repositories/ai-assist-events-read-repository";
import { listSavedReplyRows } from "@/lib/repositories/saved-replies-repository";
import { jsonError, jsonOk, requireJsonRouteUser } from "@/lib/route-helpers";

function requestedFeature(action: string) {
  return action === "summarize" ? "summary" : action;
}

export async function POST(request: Request) {
  const auth = await requireJsonRouteUser();
  if ("response" in auth) {
    return auth.response;
  }

  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const action = String(payload.action ?? "").trim();
    const conversationId = String(payload.conversationId ?? "").trim();
    const draft = String(payload.draft ?? "");
    const tone = String(payload.tone ?? "").trim();
    const validationError = validateDashboardAiAssistRequest({
      action,
      conversationId,
      draft,
      tone
    });

    if (validationError) {
      const status = validationError === "draft-required" ? 422 : 400;
      return jsonError(validationError, status);
    }

    const access = await getDashboardAiAssistAccess(auth.user.id);
    if (!hasDashboardAiAssistAccess(access.planKey)) {
      return jsonError("ai-assist-requires-growth", 403);
    }

    const featureEnabled =
      (action === "reply" && access.settings.replySuggestionsEnabled) ||
      (action === "summarize" && access.settings.conversationSummariesEnabled) ||
      (action === "rewrite" && access.settings.rewriteAssistanceEnabled) ||
      (action === "tags" && access.settings.suggestedTagsEnabled);

    if (!featureEnabled) {
      return jsonError("feature-disabled", 403);
    }

    const conversation = await getDashboardConversationThreadById(
      conversationId,
      auth.user.id
    );
    if (!conversation) {
      return jsonError("not-found", 404);
    }

    const cycle = await getDashboardAiAssistBillingCycle(access.ownerUserId);
    const requestsUsed = await countWorkspaceAiAssistRequestsForRange(
      access.ownerUserId,
      cycle.startIso,
      cycle.nextIso
    );

    if (cycle.limit != null && requestsUsed >= cycle.limit) {
      return Response.json(
        {
          ok: false,
          error: "ai-assist-limit-reached",
          resetsAt: cycle.nextIso
        },
        { status: 429 }
      );
    }

    await insertWorkspaceAiAssistEvent({
      id: randomUUID(),
      ownerUserId: access.ownerUserId,
      actorUserId: auth.user.id,
      conversationId: conversation.id,
      feature: requestedFeature(action) as
        | "summary"
        | "reply"
        | "rewrite"
        | "tags",
      action: "requested",
      metadataJson: {
        eventName: `ai.${requestedFeature(action)}.requested`,
        ...(tone ? { tone } : {})
      }
    });
    await maybeSendAiAssistWarningEmails({
      ownerUserId: access.ownerUserId,
      used: requestsUsed + 1,
      limit: cycle.limit,
      cycleStart: cycle.startIso.slice(0, 10),
      resetsAt: cycle.nextIso
    }).catch((error) => {
      console.error("ai assist warning email trigger failed", error);
    });

    const savedReplies =
      action === "reply"
        ? await listSavedReplyRows(access.ownerUserId)
        : [];

    const result = await generateDashboardAiAssist({
      action: action as "summarize" | "rewrite" | "reply" | "tags",
      conversation,
      draft,
      tone: tone as "shorter" | "friendlier" | "formal" | "grammar",
      savedReplies
    });

    return jsonOk({ action, result });
  } catch (error) {
    if (error instanceof Error && error.message === "MINIMAX_NOT_CONFIGURED") {
      return jsonError("ai-provider-not-configured", 500);
    }

    if (
      error instanceof Error &&
      (error.message === "DASHBOARD_AI_ASSIST_FAILED" ||
        error.message === "INVALID_DASHBOARD_AI_ASSIST_RESPONSE")
    ) {
      return jsonError("ai-assist-failed", 500);
    }

    return jsonError("ai-assist-failed", 500);
  }
}
