import { cookies, headers } from "next/headers";
import { readAuthSessionCookieValue } from "@/lib/auth-redirect";
import { hashSessionToken } from "@/lib/auth-session-token";

type HeaderReader = {
  get(name: string): string | null | undefined;
};

export function readAuthBearerToken(headerStore: HeaderReader | null | undefined) {
  const authorization = headerStore?.get("authorization")?.trim() ?? "";
  if (!authorization.toLowerCase().startsWith("bearer ")) {
    return null;
  }

  const token = authorization.slice("bearer ".length).trim();
  return token || null;
}

export async function getCurrentAuthSessionToken() {
  try {
    const headerToken = readAuthBearerToken(await headers());
    if (headerToken) {
      return headerToken;
    }
  } catch {
    // Ignore header access failures in non-request contexts.
  }

  try {
    return readAuthSessionCookieValue(await cookies());
  } catch {
    return null;
  }
}

export async function getCurrentAuthSessionTokenHash() {
  const token = await getCurrentAuthSessionToken();
  return token ? hashSessionToken(token) : null;
}
