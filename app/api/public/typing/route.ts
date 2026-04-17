import { getSiteByPublicId, updateVisitorTyping } from "@/lib/services";
import { publishDashboardLive } from "@/lib/live-events";
import { publicJsonResponse, publicNoContentResponse } from "@/lib/public-api";
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
    const typing = Boolean(body.typing);

    if (!siteId || !sessionId || !conversationId) {
      return publicJsonResponse(
        { error: "siteId, sessionId, and conversationId are required." },
        { status: 400 }
      );
    }

    const updated = await updateVisitorTyping({
      siteId,
      sessionId,
      conversationId,
      typing
    });

    if (!updated) {
      return publicJsonResponse({ error: "Conversation not found." }, { status: 404 });
    }

    const site = await getSiteByPublicId(siteId);
    if (site) {
      publishDashboardLive(site.userId, {
        type: "typing.updated",
        conversationId,
        actor: "visitor",
        typing
      });
    }

    return publicJsonResponse({ ok: true, conversationId, typing });
  } catch (error) {
    console.error("public typing error", error);
    return publicJsonResponse({ error: "Unable to update typing state." }, { status: 500 });
  }
}

export const OPTIONS = withRouteErrorAlerting(handleOPTIONS, "app/api/public/typing/route.ts:OPTIONS");
export const POST = withRouteErrorAlerting(handlePOST, "app/api/public/typing/route.ts:POST");
