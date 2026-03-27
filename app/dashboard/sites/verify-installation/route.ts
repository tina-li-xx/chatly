import { getSiteByPublicId, markSiteWidgetInstallVerified } from "@/lib/data";
import { jsonError, jsonOk, requireJsonRouteUser } from "@/lib/route-helpers";
import { verifySiteWidgetSnippet } from "@/lib/site-installation-verifier";

export async function POST(request: Request) {
  const auth = await requireJsonRouteUser();
  if ("response" in auth) {
    return auth.response;
  }

  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const siteId = String(payload.siteId ?? "").trim();

    if (!siteId) {
      return jsonError("site-id-missing", 400);
    }

    const site = await getSiteByPublicId(siteId);
    if (!site || site.userId !== auth.user.id) {
      return jsonError("site-not-found", 404);
    }

    const verification = await verifySiteWidgetSnippet({
      domain: site.domain,
      siteId: site.id
    });

    if (!verification.ok) {
      return jsonOk({
        detected: false,
        error: verification.error,
        site
      });
    }

    const updatedSite = await markSiteWidgetInstallVerified(site.id, auth.user.id, verification.url);
    if (!updatedSite) {
      return jsonError("site-not-found", 404);
    }

    return jsonOk({
      detected: true,
      checkedUrl: verification.url,
      site: updatedSite
    });
  } catch (error) {
    return jsonError("installation-check-failed", 500);
  }
}
