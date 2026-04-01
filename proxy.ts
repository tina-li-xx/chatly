import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { isBlockedProbePath } from "@/lib/probe-paths";

export function proxy(request: NextRequest) {
  if (isBlockedProbePath(request.nextUrl.pathname)) {
    return new NextResponse(null, { status: 404 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"]
};
