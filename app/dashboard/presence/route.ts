import { recordUserPresence } from "@/lib/services";
import { publishDashboardLive } from "@/lib/live-events";
import { jsonOk, requireJsonRouteUser } from "@/lib/route-helpers";
import { withRouteErrorAlerting } from "@/lib/route-error-alerting";

async function handlePOST() {
  const auth = await requireJsonRouteUser();
  if ("response" in auth) {
    return auth.response;
  }

  const updatedAt = new Date().toISOString();
  await recordUserPresence(auth.user.id);
  publishDashboardLive(auth.user.workspaceOwnerId, {
    type: "team.presence.updated",
    userId: auth.user.id,
    updatedAt
  });
  return jsonOk({ recorded: true });
}

export const POST = withRouteErrorAlerting(handlePOST, "app/dashboard/presence/route.ts:POST");
