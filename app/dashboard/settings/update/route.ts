import { updateDashboardSettings } from "@/lib/data";
import { jsonError, jsonOk, requireJsonRouteUser } from "@/lib/route-helpers";
import { withRouteErrorAlerting } from "@/lib/route-error-alerting";

async function handlePOST(request: Request) {
  const auth = await requireJsonRouteUser();
  if ("response" in auth) {
    return auth.response;
  }

  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const updated = await updateDashboardSettings(auth.user.id, {
      profile: payload.profile as never,
      notifications: payload.notifications as never,
      ...(payload.aiAssist && typeof payload.aiAssist === "object" ? { aiAssist: payload.aiAssist as never } : {}),
      email: payload.email as never,
      ...(payload.contacts && typeof payload.contacts === "object" ? { contacts: payload.contacts as never } : {}),
      ...(payload.reports && typeof payload.reports === "object" ? { reports: payload.reports as never } : {}),
      ...(payload.automation && typeof payload.automation === "object" ? { automation: payload.automation as never } : {}),
      password: (payload.password ?? null) as never,
      ...(typeof payload.teamName === "string" ? { teamName: payload.teamName } : {})
    });

    return jsonOk({ settings: updated });
  } catch (error) {
    if (error instanceof Error) {
      const code = error.message;
      if (
        code === "EMAIL_TAKEN" ||
        code === "MISSING_EMAIL" ||
        code === "MISSING_TEAM_NAME" ||
        code === "CONTACT_SETTINGS_FORBIDDEN" ||
        code === "MISSING_CURRENT_PASSWORD" ||
        code === "MISSING_PASSWORD" ||
        code === "WEAK_PASSWORD" ||
        code === "INVALID_CURRENT_PASSWORD" ||
        code === "PASSWORD_CONFIRM"
      ) {
        return jsonError(code.toLowerCase(), 400);
      }
    }

    return jsonError("settings-save-failed", 500);
  }
}

export const POST = withRouteErrorAlerting(handlePOST, "app/dashboard/settings/update/route.ts:POST");
