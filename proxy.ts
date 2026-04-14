import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  AUTH_REQUEST_METHOD_HEADER,
  AUTH_REQUEST_PATH_HEADER,
  AUTH_SESSION_COOKIE_NAME,
  buildLoginPath,
  buildRequestPath,
  isDashboardPath
} from "@/lib/auth-redirect";
import { isBlockedProbePath } from "@/lib/probe-paths";

function hasBearerAuthorization(request: NextRequest) {
  return request.headers.get("authorization")?.trim().toLowerCase().startsWith("bearer ") ?? false;
}

export function proxy(request: NextRequest) {
  if (isBlockedProbePath(request.nextUrl.pathname)) {
    return new NextResponse(null, { status: 404 });
  }

  const requestPath = buildRequestPath(request.nextUrl.pathname, request.nextUrl.search);

  const hasSession = request.cookies.get(AUTH_SESSION_COOKIE_NAME)?.value;

  if (isDashboardPath(request.nextUrl.pathname) && !hasSession && !hasBearerAuthorization(request)) {
    return NextResponse.redirect(new URL(buildLoginPath(requestPath), request.url));
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(AUTH_REQUEST_PATH_HEADER, requestPath);
  requestHeaders.set(AUTH_REQUEST_METHOD_HEADER, request.method);

  return NextResponse.next({
    request: {
      headers: requestHeaders
    }
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"]
};
