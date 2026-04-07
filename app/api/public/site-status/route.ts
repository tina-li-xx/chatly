import { extractVisitorMetadata } from "@/lib/conversation-io";
import { getSitePresenceStatus, recordSiteWidgetSeen } from "@/lib/data";
import { publicJsonResponse, publicNoContentResponse } from "@/lib/public-api";
import { withRouteErrorAlerting } from "@/lib/route-error-alerting";

function handleOPTIONS() {
  return publicNoContentResponse();
}

async function handleGET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const siteId = String(searchParams.get("siteId") ?? "").trim();
    const pageUrl = String(searchParams.get("pageUrl") ?? "").trim();
    const sessionId = String(searchParams.get("sessionId") ?? "").trim();
    const conversationId = String(searchParams.get("conversationId") ?? "").trim();
    const email = String(searchParams.get("email") ?? "").trim();

    if (!siteId) {
      return publicJsonResponse({ error: "siteId is required." }, { status: 400 });
    }

    const status = await getSitePresenceStatus(siteId);
    if (!status) {
      return publicJsonResponse({ error: "Site not found." }, { status: 404 });
    }

    const metadata = extractVisitorMetadata(request, {
      pageUrl: pageUrl || null,
      referrer: String(searchParams.get("referrer") ?? "").trim() || null,
      timezone: String(searchParams.get("timezone") ?? "").trim() || null,
      locale: String(searchParams.get("locale") ?? "").trim() || null
    });

    await recordSiteWidgetSeen({
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

    return publicJsonResponse({
      ok: true,
      online: status.online,
      lastSeenAt: status.lastSeenAt
    });
  } catch (error) {
    console.error("public site status error", error);
    return publicJsonResponse({ error: "Unable to load site status." }, { status: 500 });
  }
}

export const OPTIONS = withRouteErrorAlerting(handleOPTIONS, "app/api/public/site-status/route.ts:OPTIONS");
export const GET = withRouteErrorAlerting(handleGET, "app/api/public/site-status/route.ts:GET");
