import {
  getDashboardContactSettings,
  updateDashboardContactSettings
} from "@/lib/data";
import { jsonError, jsonOk, requireJsonRouteUser } from "@/lib/route-helpers";
import { withRouteErrorAlerting } from "@/lib/route-error-alerting";

async function handlePATCH(request: Request) {
  const auth = await requireJsonRouteUser();
  if ("response" in auth) {
    return auth.response;
  }

  try {
    const current = await getDashboardContactSettings(auth.user.id);
    const payload = (await request.json()) as Record<string, unknown>;
    const settings = await updateDashboardContactSettings(auth.user.id, {
      ...current.settings,
      ...(Array.isArray(payload.statuses)
        ? { statuses: payload.statuses as typeof current.settings.statuses }
        : {}),
      ...(Array.isArray(payload.customFields)
        ? { customFields: payload.customFields as typeof current.settings.customFields }
        : {}),
      ...(payload.dataRetention === "forever" ||
      payload.dataRetention === "1y" ||
      payload.dataRetention === "2y" ||
      payload.dataRetention === "3y"
        ? { dataRetention: payload.dataRetention }
        : {})
    });

    return jsonOk({
      settings,
      planKey: current.planKey,
      limits: current.limits
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "CONTACT_SETTINGS_FORBIDDEN"
    ) {
      return jsonError("contact-settings-forbidden", 403);
    }

    return jsonError("contact-settings-save-failed", 500);
  }
}

export const PATCH = withRouteErrorAlerting(handlePATCH, "app/api/contacts/settings/route.ts:PATCH");
