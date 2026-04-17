import { listInboxConversationSummaries } from "@/lib/services";
import { jsonOk, requireJsonRouteUser } from "@/lib/route-helpers";
import { withRouteErrorAlerting } from "@/lib/route-error-alerting";

async function handleGET() {
  const auth = await requireJsonRouteUser();
  if ("response" in auth) {
    return auth.response;
  }

  const conversations = await listInboxConversationSummaries(auth.user.id);
  return jsonOk({ conversations });
}

export const GET = withRouteErrorAlerting(handleGET, "app/dashboard/conversations/route.ts:GET");
