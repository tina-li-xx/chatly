import {
  createDashboardBillingCheckoutSession,
  createDashboardBillingPortalSession,
  getDashboardBillingSummary
} from "@/lib/data";
import { jsonError, jsonOk, requireJsonRouteUser } from "@/lib/route-helpers";

export async function POST(request: Request) {
  const auth = await requireJsonRouteUser();
  if ("response" in auth) {
    return auth.response;
  }

  if (auth.user.workspaceRole === "member") {
    return jsonError("forbidden", 403);
  }

  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const plan = payload.plan === "growth" || payload.plan === "pro" ? payload.plan : "starter";
    const interval = payload.interval === "annual" ? "annual" : "monthly";
    const billing = await getDashboardBillingSummary(auth.user.id);
    const redirectUrl =
      plan !== "starter" && billing.planKey === "starter"
        ? await createDashboardBillingCheckoutSession(auth.user.id, auth.user.email, {
            planKey: plan,
            billingInterval: interval,
            seatQuantity: Math.max(1, billing.usedSeats)
          })
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
