import { updateDashboardSettings } from "@/lib/data";
import { jsonError, jsonOk, requireJsonRouteUser } from "@/lib/route-helpers";

export async function POST(request: Request) {
  const auth = await requireJsonRouteUser();
  if ("response" in auth) {
    return auth.response;
  }

  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const updated = await updateDashboardSettings(auth.user.id, {
      profile: payload.profile as never,
      notifications: payload.notifications as never,
      email: payload.email as never,
      password: (payload.password ?? null) as never
    });

    return jsonOk({ settings: updated });
  } catch (error) {
    if (error instanceof Error) {
      const code = error.message;
      if (
        code === "EMAIL_TAKEN" ||
        code === "MISSING_EMAIL" ||
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
