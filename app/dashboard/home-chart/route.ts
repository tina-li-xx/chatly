import { getDashboardHomeChartData } from "@/lib/data/dashboard-home";
import { resolveDashboardHomeRange } from "@/lib/data/dashboard-home-chart";
import { jsonOk, requireJsonRouteUser } from "@/lib/route-helpers";

export async function GET(request: Request) {
  const auth = await requireJsonRouteUser();
  if ("response" in auth) {
    return auth.response;
  }

  return jsonOk(
    await getDashboardHomeChartData(
      auth.user.id,
      resolveDashboardHomeRange(new URL(request.url).searchParams.get("range"))
    )
  );
}
