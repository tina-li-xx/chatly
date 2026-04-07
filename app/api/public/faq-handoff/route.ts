import { handoffPublicConversationToTeam } from "@/lib/data";
import { publicJsonResponse, publicNoContentResponse } from "@/lib/public-api";
import { notifyIncomingVisitorMessage } from "@/lib/team-notifications";
import { withRouteErrorAlerting } from "@/lib/route-error-alerting";

function handleOPTIONS() {
  return publicNoContentResponse();
}

async function handlePOST(request: Request) {
  try {
    const body = await request.json();
    const siteId = String(body.siteId ?? "").trim();
    const sessionId = String(body.sessionId ?? "").trim();
    const conversationId = String(body.conversationId ?? "").trim();

    if (!siteId || !sessionId || !conversationId) {
      return publicJsonResponse(
        { error: "siteId, sessionId, and conversationId are required." },
        { status: 400 }
      );
    }

    const result = await handoffPublicConversationToTeam({
      siteId,
      sessionId,
      conversationId
    });

    if (!result) {
      return publicJsonResponse({ error: "Conversation not found for this visitor session." }, { status: 404 });
    }

    if (result.notified) {
      await notifyIncomingVisitorMessage(result.notification);
    }

    return publicJsonResponse({ ok: true, notified: result.notified });
  } catch (error) {
    console.error("public faq handoff error", error);
    return publicJsonResponse({ error: "Unable to hand off this conversation." }, { status: 500 });
  }
}

export const OPTIONS = withRouteErrorAlerting(handleOPTIONS, "app/api/public/faq-handoff/route.ts:OPTIONS");
export const POST = withRouteErrorAlerting(handlePOST, "app/api/public/faq-handoff/route.ts:POST");
