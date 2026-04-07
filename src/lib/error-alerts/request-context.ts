import "server-only";

import {
  readAuthRequestMethodHeader,
  readAuthRequestPathHeader
} from "@/lib/auth-redirect";

export type ErrorAlertRequestContext = {
  method: string | null;
  path: string | null;
  host: string | null;
  userAgent: string | null;
  forwardedFor: string | null;
  referer: string | null;
};

function readHeader(headersValue: Headers, name: string) {
  const value = headersValue.get(name);
  return value?.trim() || null;
}

function contextFromHeaders(
  headersValue: Headers,
  request?: Pick<Request, "method" | "url"> | null
): ErrorAlertRequestContext {
  const fallbackUrl = request?.url ? new URL(request.url) : null;

  return {
    method:
      request?.method ||
      readAuthRequestMethodHeader(headersValue) ||
      readHeader(headersValue, "x-http-method-override"),
    path:
      fallbackUrl?.pathname
        ? `${fallbackUrl.pathname}${fallbackUrl.search}`
        : readAuthRequestPathHeader(headersValue),
    host: fallbackUrl?.host || readHeader(headersValue, "host"),
    userAgent: readHeader(headersValue, "user-agent"),
    forwardedFor: readHeader(headersValue, "x-forwarded-for"),
    referer: readHeader(headersValue, "referer")
  };
}

async function readCurrentHeaders() {
  try {
    const { headers } = await import("next/headers");
    return await headers();
  } catch {
    return null;
  }
}

export async function resolveErrorAlertRequestContext(
  request?: Pick<Request, "headers" | "method" | "url"> | null
) {
  if (request) {
    return contextFromHeaders(new Headers(request.headers), request);
  }

  const headersValue = await readCurrentHeaders();
  if (!headersValue) {
    return null;
  }

  return contextFromHeaders(new Headers(headersValue));
}
