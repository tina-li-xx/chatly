import { cookies } from "next/headers";
import { isProductionRuntime } from "@/lib/env";
import {
  findSavedUserTimeZone,
  findUserSiteTimeZone,
  upsertUserTimeZone
} from "@/lib/repositories/user-timezone-repository";
import { isValidTimeZone, normalizeTimeZone } from "@/lib/timezones";
import {
  PREFERRED_TIME_ZONE_COOKIE_MAX_AGE,
  PREFERRED_TIME_ZONE_COOKIE_NAME
} from "./user-timezone-cookie-shared";

export type PreferredTimeZoneSource = "saved" | "cookie" | "site" | "utc";

function buildCookieOptions() {
  return {
    httpOnly: false,
    sameSite: "lax" as const,
    secure: isProductionRuntime(),
    path: "/",
    maxAge: PREFERRED_TIME_ZONE_COOKIE_MAX_AGE
  };
}

export function normalizePreferredTimeZoneInput(value: unknown) {
  const candidate = typeof value === "string" ? value.trim() : "";
  if (isValidTimeZone(candidate)) {
    return candidate;
  }

  try {
    const decodedCandidate = decodeURIComponent(candidate);
    return isValidTimeZone(decodedCandidate) ? decodedCandidate : null;
  } catch {
    return null;
  }
}

export async function writePreferredTimeZoneCookie(value: unknown) {
  const timeZone = normalizePreferredTimeZoneInput(value);
  if (!timeZone) {
    return null;
  }

  const cookieStore = await cookies();
  cookieStore.set(PREFERRED_TIME_ZONE_COOKIE_NAME, timeZone, buildCookieOptions());
  return timeZone;
}

export async function readPreferredTimeZoneCookie() {
  const cookieStore = await cookies();
  return normalizePreferredTimeZoneInput(
    cookieStore.get(PREFERRED_TIME_ZONE_COOKIE_NAME)?.value
  );
}

export async function persistPreferredTimeZoneForUser(
  userId: string,
  value: unknown
) {
  const timeZone = normalizePreferredTimeZoneInput(value);
  if (!timeZone) {
    return null;
  }

  try {
    await upsertUserTimeZone(userId, timeZone);
  } catch (error) {
    console.error("timezone preference save failed", error);
  }

  try {
    await writePreferredTimeZoneCookie(timeZone);
  } catch (error) {
    console.error("timezone preference cookie write failed", error);
  }

  return timeZone;
}

export async function resolvePreferredTimeZoneForUser(userId: string) {
  return (await resolvePreferredTimeZoneForUserWithSource(userId)).timeZone;
}

export async function resolvePreferredTimeZoneForUserWithSource(userId: string) {
  const savedTimeZone = await findSavedUserTimeZone(userId);
  if (savedTimeZone) {
    return { timeZone: savedTimeZone, source: "saved" as const };
  }

  const cookieTimeZone = await readPreferredTimeZoneCookie().catch(() => null);
  if (cookieTimeZone) {
    return { timeZone: cookieTimeZone, source: "cookie" as const };
  }

  const siteTimeZone = await findUserSiteTimeZone(userId);
  if (siteTimeZone) {
    return { timeZone: siteTimeZone, source: "site" as const };
  }

  return { timeZone: normalizeTimeZone(null), source: "utc" as const };
}

export function attachPreferredTimeZoneCookieToResponse<T extends Response>(
  response: T,
  value: unknown
) {
  const timeZone = normalizePreferredTimeZoneInput(value);
  const cookieResponse = response as T & {
    cookies?: {
      set: (
        name: string,
        nextValue: string,
        options: ReturnType<typeof buildCookieOptions>
      ) => void;
    };
  };

  if (timeZone) {
    cookieResponse.cookies?.set(
      PREFERRED_TIME_ZONE_COOKIE_NAME,
      timeZone,
      buildCookieOptions()
    );
  }

  return response;
}
