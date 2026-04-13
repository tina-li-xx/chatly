type MobileRequestContext = Record<string, unknown>;

export function createMobileRequestId() {
  return `mobile_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function withMobileDebugHeaders(
  headers: HeadersInit | undefined,
  requestId: string
) {
  const nextHeaders = new Headers(headers);
  nextHeaders.set("x-chatting-mobile-request-id", requestId);
  return nextHeaders;
}

export function logMobileRequest(
  requestId: string,
  method: string,
  url: string,
  context?: MobileRequestContext
) {
  if (!__DEV__) {
    return;
  }

  console.info(`[mobile-api:${requestId}] -> ${method} ${url}`, context ?? {});
}

export async function logMobileResponse(
  requestId: string,
  method: string,
  url: string,
  response: Response
) {
  if (!__DEV__) {
    return;
  }

  const bodyPreview = (await response.clone().text().catch(() => ""))
    .slice(0, 300)
    .replace(/\s+/g, " ")
    .trim();

  console.info(`[mobile-api:${requestId}] <- ${response.status} ${method} ${url}`, {
    contentType: response.headers.get("content-type"),
    bodyPreview
  });
}

export function logMobileRequestError(
  requestId: string,
  method: string,
  url: string,
  error: unknown
) {
  if (!__DEV__) {
    return;
  }

  console.error(`[mobile-api:${requestId}] xx ${method} ${url}`, error);
}
