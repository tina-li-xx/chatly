import { getVisitorPresenceSession } from "@/lib/services";
import { jsonError, jsonOk, requireJsonRouteUser } from "@/lib/route-helpers";
import { withRouteErrorAlerting } from "@/lib/route-error-alerting";

async function handleGET(request: Request) {
  const auth = await requireJsonRouteUser();
  if ("response" in auth) {
    return auth.response;
  }

  const { searchParams } = new URL(request.url);
  const siteId = String(searchParams.get("siteId") ?? "").trim();
  const sessionId = String(searchParams.get("sessionId") ?? "").trim();

  if (!siteId || !sessionId) {
    return jsonError("missing-fields", 400);
  }

  const session = await getVisitorPresenceSession({
    userId: auth.user.id,
    siteId,
    sessionId
  });

  if (!session) {
    return jsonError("not-found", 404);
  }

  return jsonOk({ session });
}

export const GET = withRouteErrorAlerting(handleGET, "app/dashboard/visitor-session/route.ts:GET");
