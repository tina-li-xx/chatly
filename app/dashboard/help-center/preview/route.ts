import { listHelpCenterPreviewArticles } from "@/lib/data/help-center";
import { jsonError, jsonOk, requireJsonRouteUser } from "@/lib/route-helpers";
import { withRouteErrorAlerting } from "@/lib/route-error-alerting";

async function handleGET() {
  const auth = await requireJsonRouteUser();
  if ("response" in auth) {
    return auth.response;
  }

  try {
    const articles = await listHelpCenterPreviewArticles(auth.user.id);
    return jsonOk({ articles });
  } catch {
    return jsonError("help-center-preview-failed", 500);
  }
}

export const GET = withRouteErrorAlerting(handleGET, "app/dashboard/help-center/preview/route.ts:GET");
