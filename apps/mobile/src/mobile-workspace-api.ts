import { sanitizeBaseUrl } from "./formatting";
import type {
  MobileAvailability,
  MobileBootstrap,
  MobileNotificationPreferences,
  MobileProfile
} from "./types";

type Json = Record<string, unknown>;

async function readJson(response: Response) {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = typeof body?.error === "string" ? body.error : "request-failed";
    throw new Error(error);
  }

  return body as Json;
}

async function authorizedFetch(baseUrl: string, token: string, path: string, init?: RequestInit) {
  return fetch(`${sanitizeBaseUrl(baseUrl)}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      ...(init?.headers ?? {})
    }
  });
}

export async function getMobileBootstrap(baseUrl: string, token: string) {
  const response = await authorizedFetch(baseUrl, token, "/api/mobile/bootstrap");
  const body = await readJson(response);
  return body as unknown as MobileBootstrap;
}

export function recordPresence(baseUrl: string, token: string) {
  return authorizedFetch(baseUrl, token, "/dashboard/presence", {
    method: "POST"
  }).then(readJson);
}

export async function updateMobileAvailability(
  baseUrl: string,
  token: string,
  availability: MobileAvailability
) {
  const response = await authorizedFetch(baseUrl, token, "/api/mobile/availability", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ availability })
  });
  const body = await readJson(response);
  return body.availability as MobileAvailability;
}

export async function updateMobileNotificationPreferences(
  baseUrl: string,
  token: string,
  preferences: MobileNotificationPreferences
) {
  const response = await authorizedFetch(
    baseUrl,
    token,
    "/api/mobile/notification-preferences",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(preferences)
    }
  );
  const body = await readJson(response);
  return body.notificationPreferences as MobileNotificationPreferences;
}

export async function updateMobileProfile(
  baseUrl: string,
  token: string,
  profile: Pick<MobileProfile, "firstName" | "lastName" | "jobTitle" | "avatarDataUrl">
) {
  const response = await authorizedFetch(baseUrl, token, "/api/mobile/profile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profile)
  });
  const body = await readJson(response);
  return body.profile as MobileProfile;
}

export async function updateMobilePassword(
  baseUrl: string,
  token: string,
  input: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }
) {
  const response = await authorizedFetch(baseUrl, token, "/api/mobile/password/change", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input)
  });
  return readJson(response);
}
