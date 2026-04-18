import { publicJsonResponse, publicNoContentResponse } from "@/lib/public-api";
import { withRouteErrorAlerting } from "@/lib/route-error-alerting";
import { getPublicSitePresenceStatus } from "@/lib/services/public-sites";

function handleOPTIONS() {
  return publicNoContentResponse();
}

async function handleGET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const siteId = String(searchParams.get("siteId") ?? "").trim();

    if (!siteId) {
      return publicJsonResponse({ error: "siteId is required." }, { status: 400 });
    }

    const status = await getPublicSitePresenceStatus(siteId);
    if (!status) {
      return publicJsonResponse({ error: "Site not found." }, { status: 404 });
    }

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
