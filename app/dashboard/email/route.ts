import { sendWelcomeTemplateEmail } from "@/lib/conversation-template-emails";
import { updateConversationEmail } from "@/lib/data";
import { jsonError, jsonOk, requireJsonRouteUser } from "@/lib/route-helpers";
import { withRouteErrorAlerting } from "@/lib/route-error-alerting";

async function handlePOST(request: Request) {
  const auth = await requireJsonRouteUser();
  if ("response" in auth) {
    return auth.response;
  }
  const { user } = auth;

  const formData = await request.formData();
  const conversationId = String(formData.get("conversationId") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();

  if (!conversationId || !email) {
    return jsonError("missing-fields", 400);
  }

  const updated = await updateConversationEmail(conversationId, email, user.id);
  if (!updated.updated) {
    return jsonError("not-found", 404);
  }

  if (updated.welcomeEmailEligible) {
    try {
      await sendWelcomeTemplateEmail({
        conversationId,
        userId: user.id
      });
    } catch (templateError) {
      console.error("welcome template email failed", templateError);
    }
  }

  return jsonOk({ conversationId, email });
}

export const POST = withRouteErrorAlerting(handlePOST, "app/dashboard/email/route.ts:POST");
