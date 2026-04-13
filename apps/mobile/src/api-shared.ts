import {
  createMobileRequestId,
  logMobileRequest,
  logMobileRequestError,
  logMobileResponse,
  withMobileDebugHeaders
} from "./api-logging";
import { sanitizeBaseUrl } from "./formatting";

type Json = Record<string, unknown>;
type MobileRequestContext = Record<string, unknown>;

export async function readJson(response: Response) {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = typeof body?.error === "string" ? body.error : "request-failed";
    throw new Error(error);
  }

  return body as Json;
}

async function performLoggedFetch(
  baseUrl: string,
  path: string,
  init: RequestInit | undefined,
  context: MobileRequestContext | undefined,
  headers: HeadersInit | undefined
) {
  const requestId = createMobileRequestId();
  const method = init?.method ?? "GET";
  const url = `${sanitizeBaseUrl(baseUrl)}${path}`;

  logMobileRequest(requestId, method, url, context);
  try {
    const response = await fetch(url, {
      ...init,
      headers: withMobileDebugHeaders(headers, requestId)
    });
    await logMobileResponse(requestId, method, url, response);
    return response;
  } catch (error) {
    logMobileRequestError(requestId, method, url, error);
    throw error;
  }
}

export function authorizedFetch(
  baseUrl: string,
  token: string,
  path: string,
  init?: RequestInit
) {
  return performLoggedFetch(
    baseUrl,
    path,
    init,
    { authorized: true },
    {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      ...(init?.headers ?? {})
    }
  );
}

export async function publicJsonFetch(
  baseUrl: string,
  path: string,
  init: RequestInit,
  context?: Record<string, unknown>
) {
  return performLoggedFetch(baseUrl, path, init, context, init.headers);
}
