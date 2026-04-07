import { recordUserPresence } from "@/lib/data";
import { jsonOk, requireJsonRouteUser } from "@/lib/route-helpers";
import { withRouteErrorAlerting } from "@/lib/route-error-alerting";

async function handlePOST() {
  const auth = await requireJsonRouteUser();
  if ("response" in auth) {
    return auth.response;
  }

  await recordUserPresence(auth.user.id);
  return jsonOk({ recorded: true });
}

export const POST = withRouteErrorAlerting(handlePOST, "app/dashboard/presence/route.ts:POST");
