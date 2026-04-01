import { upsertUserTimeZone } from "@/lib/repositories/user-timezone-repository";
import { jsonError, jsonOk, requireJsonRouteUser } from "@/lib/route-helpers";
import { isValidTimeZone } from "@/lib/timezones";

export async function POST(request: Request) {
  const auth = await requireJsonRouteUser();
  if ("response" in auth) {
    return auth.response;
  }

  try {
    const payload = (await request.json()) as { timezone?: unknown };
    const timeZone = String(payload.timezone ?? "").trim();

    if (!isValidTimeZone(timeZone)) {
      return jsonError("invalid-timezone", 400);
    }

    await upsertUserTimeZone(auth.user.id, timeZone);
    return jsonOk({ timezone: timeZone });
  } catch {
    return jsonError("timezone-save-failed", 500);
  }
}
