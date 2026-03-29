import { requestDashboardTrialExtension } from "@/lib/data";
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
    const result = await requestDashboardTrialExtension(auth.user.id, auth.user.email);
    return jsonOk(result);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "STRIPE_NOT_CONFIGURED") {
        return jsonError("stripe_not_configured", 500);
      }

      if (error.message === "TRIAL_EXTENSION_UNAVAILABLE") {
        return jsonError("trial_extension_unavailable", 400);
      }
    }

    return jsonError("billing-trial-extension-failed", 500);
  }
}
