import { getPublicConversationState } from "@/lib/services";
import { publicJsonResponse, publicNoContentResponse } from "@/lib/public-api";
import { withRouteErrorAlerting } from "@/lib/route-error-alerting";

function handleOPTIONS() {
  return publicNoContentResponse();
}

async function handleGET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const siteId = String(searchParams.get("siteId") ?? "").trim();
    const sessionId = String(searchParams.get("sessionId") ?? "").trim();
    const conversationId = String(searchParams.get("conversationId") ?? "").trim();

    if (!siteId || !sessionId || !conversationId) {
      return publicJsonResponse(
        { error: "siteId, sessionId, and conversationId are required." },
        { status: 400 }
      );
    }

    const state = await getPublicConversationState({
      siteId,
      sessionId,
      conversationId
    });

    if (!state) {
      return publicJsonResponse({ error: "Conversation not found." }, { status: 404 });
    }

    return publicJsonResponse({
      ok: true,
      conversationId,
      messages: state.messages.map((message) => ({
        id: message.id,
        content: message.content,
        createdAt: message.createdAt,
        sender: message.sender === "user" ? "user" : "team",
        attachments: message.attachments
      })),
      faqSuggestions: state.faqSuggestions ?? null
    });
  } catch (error) {
    console.error("public conversation thread error", error);
    return publicJsonResponse({ error: "Unable to load conversation." }, { status: 500 });
  }
}

export const OPTIONS = withRouteErrorAlerting(handleOPTIONS, "app/api/public/conversation/route.ts:OPTIONS");
export const GET = withRouteErrorAlerting(handleGET, "app/api/public/conversation/route.ts:GET");
