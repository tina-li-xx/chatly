import { listHelpCenterPreviewArticles } from "@/lib/data/help-center";
import { jsonError, jsonOk, requireJsonRouteUser } from "@/lib/route-helpers";

export async function GET() {
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
