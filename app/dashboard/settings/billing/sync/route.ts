import { syncDashboardBillingSummary } from "@/lib/data";
import { jsonError, jsonOk, requireJsonRouteUser } from "@/lib/route-helpers";

export async function POST() {
  const auth = await requireJsonRouteUser();
  if ("response" in auth) {
    return auth.response;
  }

  if (auth.user.workspaceRole === "member") {
    return jsonError("forbidden", 403);
  }

  try {
    const billing = await syncDashboardBillingSummary(auth.user.id, auth.user.email);
    return jsonOk({ billing });
  } catch (error) {
    if (error instanceof Error && error.message === "STRIPE_NOT_CONFIGURED") {
      return jsonError("stripe_not_configured", 500);
    }

    return jsonError("billing-sync-failed", 500);
  }
}
