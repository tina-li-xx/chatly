import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getPublicAppUrl } from "@/lib/env";
import type { CurrentUser } from "@/lib/types";

type JsonRouteUserResult =
  | {
      user: CurrentUser;
    }
  | {
      response: NextResponse;
    };

export function redirect303(_request: Request, path: string) {
  return NextResponse.redirect(new URL(path, getPublicAppUrl()), {
    status: 303
  });
}

export function jsonError(error: string, status: number) {
  return NextResponse.json({ ok: false, error }, { status });
}

export function jsonOk<T extends Record<string, unknown>>(body: T, status = 200) {
  return NextResponse.json({ ok: true, ...body }, { status });
}

export async function requireJsonRouteUser(): Promise<JsonRouteUserResult> {
  const user = await getCurrentUser();

  if (!user) {
    return {
      response: jsonError("auth", 401)
    };
  }

  return { user };
}
