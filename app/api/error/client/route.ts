import { NextResponse } from "next/server";
import { notifyClientErrorAlert } from "@/lib/error-alerts/reporters";
import { withRouteErrorAlerting } from "@/lib/route-error-alerting";

export const runtime = "nodejs";

function badRequest(message: string) {
  return NextResponse.json({ ok: false, error: message }, { status: 400 });
}

async function handlePOST(request: Request) {
  try {
    const payload = await request.json();
    const kind = String(payload?.kind ?? "").trim();
    const message = String(payload?.message ?? "").trim();

    if (!kind || !message) {
      return badRequest("kind and message are required");
    }

    await notifyClientErrorAlert({
      kind,
      message,
      pageUrl: typeof payload?.pageUrl === "string" ? payload.pageUrl : null,
      stack: typeof payload?.stack === "string" ? payload.stack : null,
      userAgent: typeof payload?.userAgent === "string" ? payload.userAgent : null,
      timestamp: typeof payload?.timestamp === "string" ? payload.timestamp : null
    });

    return NextResponse.json({ ok: true });
  } catch {
    return badRequest("invalid client error payload");
  }
}

export const POST = withRouteErrorAlerting(handlePOST, "app/api/error/client/route.ts:POST");
