import {
  getAiAssistActivitySliceForWorkspace,
  resolveAiAssistActivityCursorFromSearchParams,
  resolveAiAssistActivityFiltersFromSearchParams
} from "@/lib/services/ai-assist";
import { jsonOk, requireJsonRouteUser } from "@/lib/route-helpers";
import { withRouteErrorAlerting } from "@/lib/route-error-alerting";

async function handleGET(request: Request) {
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

export const GET = withRouteErrorAlerting(handleGET, "app/dashboard/analytics/activity-feed/route.ts:GET");
