import {
  getAiAssistActivitySliceForWorkspace
} from "@/lib/data/analytics-ai-assist-activity-slice";
import {
  resolveAiAssistActivityCursorFromSearchParams,
  resolveAiAssistActivityFiltersFromSearchParams
} from "@/lib/data/analytics-ai-assist-activity-query";
import { jsonOk, requireJsonRouteUser } from "@/lib/route-helpers";

export async function GET(request: Request) {
  const auth = await requireJsonRouteUser();
  if ("response" in auth) {
    return auth.response;
  }

  const { searchParams } = new URL(request.url);
  const slice = await getAiAssistActivitySliceForWorkspace({
    ownerUserId: auth.user.workspaceOwnerId,
    viewerUserId: auth.user.id,
    viewerRole: auth.user.workspaceRole,
    filters: resolveAiAssistActivityFiltersFromSearchParams(searchParams),
    cursor: resolveAiAssistActivityCursorFromSearchParams(searchParams)
  });

  return jsonOk(slice);
}
