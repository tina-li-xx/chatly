import { authorizedFetch, publicJsonFetch, readJson } from "./api-shared";
import type { SessionUser } from "./types";

async function authorizedJson(baseUrl: string, token: string, path: string, init?: RequestInit) {
  return readJson(await authorizedFetch(baseUrl, token, path, init));
}

export async function createMobileSession(
  baseUrl: string,
  email: string,
  password: string,
  timeZone: string
) {
  const body = await readJson(
    await publicJsonFetch(
      baseUrl,
      "/api/mobile/session",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password, timeZone })
      },
      { email, passwordLength: password.length, timeZone }
    )
  );

  return { token: String(body.token), user: body.user as SessionUser };
}

export async function loadMobileSession(baseUrl: string, token: string) {
  const body = await authorizedJson(baseUrl, token, "/api/mobile/session");
  return body.user as SessionUser;
}

export function revokeMobileSession(baseUrl: string, token: string) {
  return authorizedJson(baseUrl, token, "/api/mobile/session", { method: "DELETE" });
}

export function requestMobilePasswordReset(baseUrl: string, email: string) {
  return publicJsonFetch(
      baseUrl,
      "/api/mobile/password/forgot",
      {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      },
      { email }
    ).then(readJson);
}

export function resetMobilePassword(
  baseUrl: string,
  token: string,
  password: string,
  confirmPassword: string
) {
  return publicJsonFetch(
      baseUrl,
      "/api/mobile/password/reset",
      {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, confirmPassword })
      },
      { tokenLength: token.length, passwordLength: password.length }
    ).then(readJson);
}
