import { upsertUserTimeZone } from "@/lib/repositories/user-timezone-repository";
import { jsonError, jsonOk, requireJsonRouteUser } from "@/lib/route-helpers";
import {
  attachPreferredTimeZoneCookieToResponse,
  normalizePreferredTimeZoneInput
} from "@/lib/user-timezone-preference";
import { withRouteErrorAlerting } from "@/lib/route-error-alerting";

async function handlePOST(request: Request) {
  const auth = await requireJsonRouteUser();
  if ("response" in auth) {
    return auth.response;
  }

  try {
    const payload = (await request.json()) as { timezone?: unknown };
    const timeZone = normalizePreferredTimeZoneInput(payload.timezone);

    if (!timeZone) {
      return jsonError("invalid-timezone", 400);
    }

    await upsertUserTimeZone(auth.user.id, timeZone);
    return attachPreferredTimeZoneCookieToResponse(jsonOk({ timezone: timeZone }), timeZone);
  } catch {
    return jsonError("timezone-save-failed", 500);
  }
}

export const POST = withRouteErrorAlerting(handlePOST, "app/dashboard/settings/timezone/route.ts:POST");
