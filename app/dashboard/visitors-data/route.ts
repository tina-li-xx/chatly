import { listVisitorPresenceSessions, listVisitorsPageConversationSummaries } from "@/lib/services";
import { jsonOk, requireJsonRouteUser } from "@/lib/route-helpers";
import { withRouteErrorAlerting } from "@/lib/route-error-alerting";

async function handleGET() {
  const auth = await requireJsonRouteUser();
  if ("response" in auth) {
    return auth.response;
  }

  const [conversations, liveSessions] = await Promise.all([
    listVisitorsPageConversationSummaries(auth.user.id),
    listVisitorPresenceSessions(auth.user.id)
  ]);

  return jsonOk({ conversations, liveSessions });
}

export const GET = withRouteErrorAlerting(handleGET, "app/dashboard/visitors-data/route.ts:GET");
