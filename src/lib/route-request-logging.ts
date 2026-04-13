import "server-only";

const MAX_RESPONSE_BODY_PREVIEW_LENGTH = 300;
const REQUEST_ID_HEADER_NAMES = ["x-chatting-mobile-request-id", "x-request-id"];

function shouldLogRouteRequests() {
  return process.env.NODE_ENV !== "test";
}

function createRouteRequestId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `route_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function getRequestPath(request: Request | null) {
  if (!request) {
    return "unknown";
  }

  try {
    const url = new URL(request.url);
    return `${url.pathname}${url.search}`;
  } catch {
    return request.url;
  }
}

function getResponseBodyPreview(responseBody: unknown) {
  if (responseBody == null) {
    return null;
  }

  const text =
    typeof responseBody === "string" ? responseBody : JSON.stringify(responseBody);

  return text.slice(0, MAX_RESPONSE_BODY_PREVIEW_LENGTH).replace(/\s+/g, " ").trim();
}

export function getRouteRequestId(request: Request | null) {
  for (const headerName of REQUEST_ID_HEADER_NAMES) {
    const value = request?.headers.get(headerName)?.trim();
    if (value) {
      return value;
    }
  }

  return createRouteRequestId();
}

export function logRouteStart(
  requestId: string,
  routeId: string,
  request: Request | null
) {
  if (!shouldLogRouteRequests()) {
    return;
  }

  console.info(
    `[route:${requestId}] -> ${(request?.method ?? "UNKNOWN").toUpperCase()} ${getRequestPath(request)}`,
    {
      routeId,
      contentType: request?.headers.get("content-type"),
      contentLength: request?.headers.get("content-length"),
      userAgent: request?.headers.get("user-agent")
    }
  );
}

export function logRouteResponse(
  requestId: string,
  routeId: string,
  request: Request | null,
  response: Response,
  durationMs: number,
  responseBody: unknown
) {
  if (!shouldLogRouteRequests()) {
    return;
  }

  const logger =
    response.status >= 500
      ? console.error
      : response.status >= 400
        ? console.warn
        : console.info;

  logger(
    `[route:${requestId}] <- ${response.status} ${(request?.method ?? "UNKNOWN").toUpperCase()} ${getRequestPath(request)}`,
    {
      routeId,
      durationMs,
      responseContentType: response.headers.get("content-type"),
      responseBodyPreview: getResponseBodyPreview(responseBody)
    }
  );
}

export function logRouteFailure(
  requestId: string,
  routeId: string,
  request: Request | null,
  durationMs: number,
  error: unknown
) {
  if (!shouldLogRouteRequests()) {
    return;
  }

  console.error(
    `[route:${requestId}] xx ${(request?.method ?? "UNKNOWN").toUpperCase()} ${getRequestPath(request)}`,
    {
      routeId,
      durationMs,
      error:
        error instanceof Error
          ? {
              name: error.name,
              message: error.message
            }
          : error
    }
  );
}
