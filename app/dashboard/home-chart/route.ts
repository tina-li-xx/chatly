import { getDashboardHomeChartData } from "@/lib/data/dashboard-home";
import { resolveDashboardHomeRange } from "@/lib/data/dashboard-home-chart";
import { jsonOk, requireJsonRouteUser } from "@/lib/route-helpers";
import { withRouteErrorAlerting } from "@/lib/route-error-alerting";

async function handleGET(request: Request) {
  const auth = await requireJsonRouteUser();
  if ("response" in auth) {
    return auth.response;
  }

  return jsonOk(
    await getDashboardHomeChartData(
      auth.user.id,
      resolveDashboardHomeRange(new URL(request.url).searchParams.get("range")),
      auth.user.workspaceOwnerId
    )
  );
}

export const GET = withRouteErrorAlerting(handleGET, "app/dashboard/home-chart/route.ts:GET");
