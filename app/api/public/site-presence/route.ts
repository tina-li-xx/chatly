import { extractVisitorMetadata } from "@/lib/conversation-io";
import { publicJsonResponse, publicNoContentResponse } from "@/lib/public-api";
import { withRouteErrorAlerting } from "@/lib/route-error-alerting";
import { recordPublicSitePresence } from "@/lib/services/public-sites";

function handleOPTIONS() {
  return publicNoContentResponse();
}

async function readPresencePayload(request: Request) {
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return (await request.json()) as Record<string, unknown>;
  }

  const body = await request.text();
  return Object.fromEntries(new URLSearchParams(body).entries());
}

async function handlePOST(request: Request) {
  try {
    const body = await readPresencePayload(request);
    const siteId = String(body.siteId ?? "").trim();
    const sessionId = String(body.sessionId ?? "").trim();
    const conversationId = String(body.conversationId ?? "").trim();
    const email = String(body.email ?? "").trim();

    if (!siteId) {
      return publicJsonResponse({ error: "siteId is required." }, { status: 400 });
    }

    const metadata = extractVisitorMetadata(request, {
      pageUrl: typeof body.pageUrl === "string" ? body.pageUrl : null,
      referrer: typeof body.referrer === "string" ? body.referrer : null,
      timezone: typeof body.timezone === "string" ? body.timezone : null,
      locale: typeof body.locale === "string" ? body.locale : null
    });

    await recordPublicSitePresence({
      siteId,
      pageUrl: metadata.pageUrl,
      sessionId: sessionId || undefined,
      conversationId: conversationId || null,
      email: email || null,
      referrer: metadata.referrer,
      userAgent: metadata.userAgent,
      country: metadata.country,
      region: metadata.region,
      city: metadata.city,
      timezone: metadata.timezone,
      locale: metadata.locale
    });

    return publicNoContentResponse();
  } catch (error) {
    console.error("public site presence error", error);
    return publicJsonResponse({ error: "Unable to record site presence." }, { status: 500 });
  }
}

export const OPTIONS = withRouteErrorAlerting(handleOPTIONS, "app/api/public/site-presence/route.ts:OPTIONS");
export const POST = withRouteErrorAlerting(handlePOST, "app/api/public/site-presence/route.ts:POST");
