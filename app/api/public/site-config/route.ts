import { publicJsonResponse, publicNoContentResponse } from "@/lib/public-api";
import { withRouteErrorAlerting } from "@/lib/route-error-alerting";
import { getPublicSiteWidgetConfig } from "@/lib/services/public-sites";

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

    const config = await getPublicSiteWidgetConfig(siteId);
    if (!config) {
      return publicJsonResponse({ error: "Site not found." }, { status: 404 });
    }

    return publicJsonResponse({
      ok: true,
      site: config
    }, {
      headers: {
        "Cache-Control": "public, max-age=60, stale-while-revalidate=300"
      }
    });
  } catch (error) {
    console.error("public site config error", error);
    return publicJsonResponse({ error: "Unable to load site config." }, { status: 500 });
  }
}

export const OPTIONS = withRouteErrorAlerting(handleOPTIONS, "app/api/public/site-config/route.ts:OPTIONS");
export const GET = withRouteErrorAlerting(handleGET, "app/api/public/site-config/route.ts:GET");
