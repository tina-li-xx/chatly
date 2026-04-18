import { listConversationSummariesForVisitor } from "@/lib/services";
import { jsonError, jsonOk, requireJsonRouteUser } from "@/lib/route-helpers";
import { withRouteErrorAlerting } from "@/lib/route-error-alerting";

async function handleGET(request: Request) {
  const auth = await requireJsonRouteUser();
  if ("response" in auth) {
    return auth.response;
  }

  const { searchParams } = new URL(request.url);
  const siteId = String(searchParams.get("siteId") ?? "").trim();
  const email = String(searchParams.get("email") ?? "").trim();
  const sessionId = String(searchParams.get("sessionId") ?? "").trim();

  if (!siteId || (!email && !sessionId)) {
    return jsonError("missing-fields", 400);
  }

  const summaries = await listConversationSummariesForVisitor({
    userId: auth.user.id,
    siteId,
    email,
    sessionId
  });

  return jsonOk({ summaries });
}

export const GET = withRouteErrorAlerting(handleGET, "app/dashboard/visitor-conversations/route.ts:GET");
