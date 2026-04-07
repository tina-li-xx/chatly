import { sendWelcomeTemplateEmail } from "@/lib/conversation-template-emails";
import { publicJsonResponse, publicNoContentResponse } from "@/lib/public-api";
import { saveVisitorConversationEmail } from "@/lib/data";
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
    const email = String(body.email ?? "").trim();

    if (!siteId || !sessionId || !conversationId || !email) {
      return publicJsonResponse(
        { error: "siteId, sessionId, conversationId, and email are required." },
        { status: 400 }
      );
    }

    const updated = await saveVisitorConversationEmail({
      siteId,
      sessionId,
      conversationId,
      email
    });

    if (!updated.updated) {
      return publicJsonResponse(
        { error: "Conversation not found for this visitor session." },
        { status: 404 }
      );
    }

    if (updated.welcomeEmailEligible && updated.ownerUserId) {
      try {
        await sendWelcomeTemplateEmail({
          conversationId,
          userId: updated.ownerUserId
        });
      } catch (templateError) {
        console.error("welcome template email failed", templateError);
      }
    }

    return publicJsonResponse({ ok: true });
  } catch (error) {
    console.error("public conversation email error", error);

    return publicJsonResponse(
      { error: "Unable to save email for this conversation." },
      { status: 500 }
    );
  }
}

export const OPTIONS = withRouteErrorAlerting(handleOPTIONS, "app/api/public/conversation-email/route.ts:OPTIONS");
export const POST = withRouteErrorAlerting(handlePOST, "app/api/public/conversation-email/route.ts:POST");
