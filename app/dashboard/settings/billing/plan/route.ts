import {
  createDashboardBillingCheckoutSession,
  createDashboardBillingPortalSession,
  getDashboardBillingSummary
} from "@/lib/services";
import { isGrowthContactSalesTeamSize } from "@/lib/pricing";
import { jsonError, jsonOk, requireJsonRouteUser } from "@/lib/route-helpers";
import { withRouteErrorAlerting } from "@/lib/route-error-alerting";

function readSeatQuantity(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  return Math.max(1, Math.floor(value));
}

async function handlePOST(request: Request) {
  const auth = await requireJsonRouteUser();
  if ("response" in auth) {
    return auth.response;
  }

  if (auth.user.workspaceRole === "member") {
    return jsonError("forbidden", 403);
  }

  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const plan = payload.plan === "growth" ? "growth" : "starter";
    const interval = payload.interval === "annual" ? "annual" : "monthly";
    const requestedSeatQuantity = readSeatQuantity(payload.seatQuantity);
    const billing = await getDashboardBillingSummary(auth.user.id);
    const seatQuantity =
      plan === "growth" && billing.planKey === "starter"
        ? requestedSeatQuantity ?? Math.max(1, billing.usedSeats)
        : Math.max(1, billing.usedSeats);

    if (plan === "growth" && isGrowthContactSalesTeamSize(seatQuantity)) {
      return jsonError("contact_sales_required", 409);
    }

    const redirectUrl =
      plan !== "starter" && billing.planKey === "starter"
        ? await createDashboardBillingCheckoutSession(auth.user.id, auth.user.email, {
            planKey: plan,
            billingInterval: interval,
            seatQuantity
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

      if (error.message === "STRIPE_PRICE_CONFIG_INVALID") {
        return jsonError("stripe_price_config_invalid", 500);
      }
    }

    return jsonError("billing-plan-update-failed", 500);
  }
}

export const POST = withRouteErrorAlerting(handlePOST, "app/dashboard/settings/billing/plan/route.ts:POST");
