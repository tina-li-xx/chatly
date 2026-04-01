import type { Route } from "next";

export const AUTH_REQUEST_PATH_HEADER = "x-chatly-request-path";
export const AUTH_RETURN_TO_QUERY_PARAM = "redirectTo";
export const AUTH_SESSION_COOKIE_NAME = "chatly_session";
const LOGIN_PATH = "/login";
const SIGNUP_PATH = "/signup";
const DISALLOWED_RETURN_PATH_PREFIXES = [LOGIN_PATH, SIGNUP_PATH, "/auth", "/api", "/_next"];

export function buildRequestPath(pathname: string, search = "") {
  return search ? `${pathname}${search}` : pathname;
}

export function isDashboardPath(pathname: string) {
  return pathname === "/dashboard" || pathname.startsWith("/dashboard/");
}

function isAuthLoopPath(pathname: string) {
  return DISALLOWED_RETURN_PATH_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function sanitizeReturnPath(value: string | null | undefined) {
  const trimmed = String(value ?? "").trim();

  if (!trimmed || !trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return null;
  }

  try {
    const parsed = new URL(trimmed, "https://chatting.local");

    if (isAuthLoopPath(parsed.pathname)) {
      return null;
    }

    return buildRequestPath(parsed.pathname, parsed.search);
  } catch {
    return null;
  }
}

export function buildLoginPath(returnTo?: string | null) {
  const safeReturnPath = sanitizeReturnPath(returnTo);

  if (!safeReturnPath) {
    return LOGIN_PATH as Route;
  }

  const searchParams = new URLSearchParams({
    [AUTH_RETURN_TO_QUERY_PARAM]: safeReturnPath
  });

  return `${LOGIN_PATH}?${searchParams.toString()}` as Route;
}
