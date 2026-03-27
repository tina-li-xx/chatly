import { createDashboardBillingPortalSession } from "@/lib/data";
import { jsonError, jsonOk, requireJsonRouteUser } from "@/lib/route-helpers";

export async function POST() {
  const auth = await requireJsonRouteUser();
  if ("response" in auth) {
    return auth.response;
  }

  try {
    const redirectUrl = await createDashboardBillingPortalSession(auth.user.id, auth.user.email);
    return jsonOk({ redirectUrl });
  } catch (error) {
    if (error instanceof Error && error.message === "STRIPE_NOT_CONFIGURED") {
      return jsonError("stripe_not_configured", 500);
    }

    return jsonError("billing-portal-session-failed", 500);
  }
}
