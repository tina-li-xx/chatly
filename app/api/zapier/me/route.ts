import { jsonOk } from "@/lib/route-helpers";
import { withRouteErrorAlerting } from "@/lib/route-error-alerting";
import { requireZapierApiAuth } from "@/lib/zapier-api-auth";

async function handleGET(request: Request) {
  const auth = await requireZapierApiAuth(request);
  if ("response" in auth) {
    return auth.response;
  }

  return jsonOk({
    workspace_id: auth.auth.ownerUserId,
    team_name: auth.auth.teamName,
    owner_email: auth.auth.ownerEmail
  });
}

export const GET = withRouteErrorAlerting(
  handleGET,
  "app/api/zapier/me/route.ts:GET"
);
