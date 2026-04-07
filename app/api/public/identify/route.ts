import { identifyDashboardContact, recordVisitorPresence } from "@/lib/data";
import { extractVisitorMetadata } from "@/lib/conversation-io";
import { publicJsonResponse, publicNoContentResponse } from "@/lib/public-api";
import { withRouteErrorAlerting } from "@/lib/route-error-alerting";

function handleOPTIONS() {
  return publicNoContentResponse();
}

async function handlePOST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const siteId = String(body.siteId ?? "").trim();
    const sessionId = String(body.sessionId ?? "").trim();
    const email = String(body.email ?? "").trim();

    if (!siteId || !sessionId || !email) {
      return publicJsonResponse({ error: "siteId, sessionId, and email are required." }, { status: 400 });
    }

    const metadata = extractVisitorMetadata(request, {
      pageUrl: typeof body.pageUrl === "string" ? body.pageUrl : null,
      referrer: typeof body.referrer === "string" ? body.referrer : null,
      timezone: typeof body.timezone === "string" ? body.timezone : null,
      locale: typeof body.locale === "string" ? body.locale : null,
      visitorTags: body.tags,
      customFields: body.customFields
    });

    await recordVisitorPresence({
      siteId,
      sessionId,
      conversationId: typeof body.conversationId === "string" ? body.conversationId : null,
      email,
      pageUrl: metadata.pageUrl,
      referrer: metadata.referrer,
      userAgent: metadata.userAgent,
      country: metadata.country,
      region: metadata.region,
      city: metadata.city,
      timezone: metadata.timezone,
      locale: metadata.locale,
      visitorTags: metadata.visitorTags,
      customFields: metadata.customFields
    });

    await identifyDashboardContact({
      siteId,
      email,
      sessionId,
      conversationId: typeof body.conversationId === "string" ? body.conversationId : null,
      name: typeof body.name === "string" ? body.name : null,
      phone: typeof body.phone === "string" ? body.phone : null,
      company: typeof body.company === "string" ? body.company : null,
      role: typeof body.role === "string" ? body.role : null,
      avatarUrl: typeof body.avatarUrl === "string" ? body.avatarUrl : null,
      status: typeof body.status === "string" ? body.status : null,
      visitorTags: Array.isArray(body.tags) ? body.tags.map((tag) => String(tag)) : [],
      customFields:
        body.customFields && typeof body.customFields === "object"
          ? Object.fromEntries(Object.entries(body.customFields).map(([key, value]) => [key, String(value)]))
          : {},
      pageUrl: metadata.pageUrl,
      referrer: metadata.referrer
    });

    return publicJsonResponse({ ok: true });
  } catch (error) {
    console.error("public identify error", error);
    return publicJsonResponse({ error: "Unable to identify contact." }, { status: 500 });
  }
}

export const OPTIONS = withRouteErrorAlerting(handleOPTIONS, "app/api/public/identify/route.ts:OPTIONS");
export const POST = withRouteErrorAlerting(handlePOST, "app/api/public/identify/route.ts:POST");
