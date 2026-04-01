import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  AUTH_REQUEST_PATH_HEADER,
  AUTH_SESSION_COOKIE_NAME,
  buildLoginPath,
  buildRequestPath,
  isDashboardPath
} from "@/lib/auth-redirect";
import { isBlockedProbePath } from "@/lib/probe-paths";

export function proxy(request: NextRequest) {
  if (isBlockedProbePath(request.nextUrl.pathname)) {
    return new NextResponse(null, { status: 404 });
  }

  const requestPath = buildRequestPath(request.nextUrl.pathname, request.nextUrl.search);

  if (isDashboardPath(request.nextUrl.pathname) && !request.cookies.get(AUTH_SESSION_COOKIE_NAME)?.value) {
    return NextResponse.redirect(new URL(buildLoginPath(requestPath), request.url));
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(AUTH_REQUEST_PATH_HEADER, requestPath);

  return NextResponse.next({
    request: {
      headers: requestHeaders
    }
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"]
};
