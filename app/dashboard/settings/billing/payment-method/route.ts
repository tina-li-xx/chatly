import { createDashboardBillingPortalSession } from "@/lib/data";
import { jsonError, jsonOk, requireJsonRouteUser } from "@/lib/route-helpers";
import { withRouteErrorAlerting } from "@/lib/route-error-alerting";

async function handlePOST() {
  const auth = await requireJsonRouteUser();
  if ("response" in auth) {
    return auth.response;
  }

  if (auth.user.workspaceRole === "member") {
    return jsonError("forbidden", 403);
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

export const POST = withRouteErrorAlerting(handlePOST, "app/dashboard/settings/billing/payment-method/route.ts:POST");
