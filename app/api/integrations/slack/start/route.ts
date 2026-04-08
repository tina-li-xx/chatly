import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth";
import { integrationPopupErrorResponse } from "@/lib/integration-popup-response";
import { redirect303 } from "@/lib/route-helpers";
import {
  buildSlackAuthorizeUrl,
  getSlackOAuthCookieOptions,
  SLACK_OAUTH_STATE_COOKIE
} from "@/lib/slack-integration";
import { withRouteErrorAlerting } from "@/lib/route-error-alerting";

async function handleGET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return redirect303(request, "/login");
  }
  if (user.workspaceRole === "member") {
    return integrationPopupErrorResponse(
      "Only workspace admins can connect Slack."
    );
  }

  try {
    const state = randomBytes(16).toString("hex");
    (await cookies()).set(
      SLACK_OAUTH_STATE_COOKIE,
      JSON.stringify({ state, ownerUserId: user.workspaceOwnerId }),
      getSlackOAuthCookieOptions()
    );
    return Response.redirect(buildSlackAuthorizeUrl(state), 302);
  } catch {
    return integrationPopupErrorResponse(
      "Slack isn't configured in this environment yet."
    );
  }
}

export const GET = withRouteErrorAlerting(handleGET, "app/api/integrations/slack/start/route.ts:GET");
