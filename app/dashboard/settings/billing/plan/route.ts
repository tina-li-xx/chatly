import { createDashboardBillingCheckoutSession, createDashboardBillingPortalSession } from "@/lib/data";
import { jsonError, jsonOk, requireJsonRouteUser } from "@/lib/route-helpers";

export async function POST(request: Request) {
  const auth = await requireJsonRouteUser();
  if ("response" in auth) {
    return auth.response;
  }

  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const plan = payload.plan === "pro" ? "pro" : "starter";
    const redirectUrl =
      plan === "pro"
        ? await createDashboardBillingCheckoutSession(auth.user.id, auth.user.email)
        : await createDashboardBillingPortalSession(auth.user.id, auth.user.email);

    return jsonOk({ redirectUrl });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "STRIPE_NOT_CONFIGURED") {
        return jsonError("stripe_not_configured", 500);
      }

      if (error.message === "STRIPE_CHECKOUT_UNAVAILABLE") {
        return jsonError("stripe_checkout_unavailable", 500);
      }
    }

    return jsonError("billing-plan-update-failed", 500);
  }
}
