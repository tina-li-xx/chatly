import { getDashboardHomeTeamStatusData } from "@/lib/data/dashboard-home";
import { jsonOk, requireJsonRouteUser } from "@/lib/route-helpers";
import { withRouteErrorAlerting } from "@/lib/route-error-alerting";

async function handleGET() {
  const auth = await requireJsonRouteUser();
  if ("response" in auth) {
    return auth.response;
  }

  const teamStatus = await getDashboardHomeTeamStatusData(
    auth.user.id,
    auth.user.workspaceOwnerId
  );

  return jsonOk(teamStatus);
}

export const GET = withRouteErrorAlerting(
  handleGET,
  "app/dashboard/team-status/route.ts:GET"
);
