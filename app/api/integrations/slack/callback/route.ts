import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth";
import { INTEGRATION_OAUTH_MESSAGE_TYPE } from "@/lib/browser-event-contracts";
import {
  integrationPopupErrorResponse,
  integrationPopupSuccessResponse
} from "@/lib/integration-popup-response";
import {
  findWorkspaceIntegrationRow,
  upsertWorkspaceIntegrationRow
} from "@/lib/services/integrations";
import {
  buildSlackIntegrationState,
  serializeSlackIntegrationCredentials,
  serializeSlackIntegrationSettings
} from "@/lib/slack-integration-state";
import {
  exchangeSlackOAuthCode,
  getSlackOAuthCookieOptions,
  SLACK_OAUTH_STATE_COOKIE
} from "@/lib/slack-integration";
import { getWorkspaceAccess } from "@/lib/workspace-access";
import { withRouteErrorAlerting } from "@/lib/route-error-alerting";

type SlackOAuthStateCookie = {
  state: string;
  ownerUserId: string;
};

function readStateCookie(raw: string | undefined): SlackOAuthStateCookie | null {
  if (!raw) {
    return null;
  }

  try {
    const value = JSON.parse(raw) as Partial<SlackOAuthStateCookie>;
    if (!value.state || !value.ownerUserId) {
      return null;
    }
    return { state: value.state, ownerUserId: value.ownerUserId };
  } catch {
    return null;
  }
}

async function handleGET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieStore = await cookies();
  const stored = readStateCookie(cookieStore.get(SLACK_OAUTH_STATE_COOKIE)?.value);
  cookieStore.set(SLACK_OAUTH_STATE_COOKIE, "", {
    ...getSlackOAuthCookieOptions(),
    maxAge: 0
  });

  if (!code || !state || !stored || stored.state !== state) {
    return integrationPopupErrorResponse(
      "Slack OAuth state verification failed. Please try again."
    );
  }

  const user = await getCurrentUser();
  if (!user || user.workspaceRole === "member") {
    return integrationPopupErrorResponse(
      "You no longer have access to connect Slack for this workspace."
    );
  }

  try {
    const workspace = await getWorkspaceAccess(user.id, stored.ownerUserId);
    const oauth = await exchangeSlackOAuthCode(code);
    const existing = await findWorkspaceIntegrationRow(
      workspace.ownerUserId,
      "slack"
    );
    const nextState = buildSlackIntegrationState(existing);
    const timestamp = new Date().toISOString();

    await upsertWorkspaceIntegrationRow({
      ownerUserId: workspace.ownerUserId,
      provider: "slack",
      status: "connected",
      accountLabel: oauth.teamName,
      externalAccountId: oauth.teamId,
      settingsJson: serializeSlackIntegrationSettings({
        ...nextState,
        status: "connected",
        workspaceName: oauth.teamName,
        errorMessage: null,
        lastValidatedAt: timestamp
      }),
      credentialsJson: serializeSlackIntegrationCredentials({
        accessToken: oauth.accessToken,
        tokenType: oauth.tokenType,
        scopes: oauth.scopes,
        appId: oauth.appId,
        botUserId: oauth.botUserId,
        teamId: oauth.teamId,
        teamName: oauth.teamName,
        refreshToken: oauth.refreshToken,
        expiresIn: oauth.expiresIn,
        authedUserId: oauth.authedUserId
      }),
      errorMessage: null,
      connectedAt: existing?.connected_at ?? timestamp,
      lastValidatedAt: timestamp
    });

    return integrationPopupSuccessResponse({
      type: INTEGRATION_OAUTH_MESSAGE_TYPE,
      provider: "slack",
      outcome: "success",
      workspaceName: oauth.teamName
    });
  } catch {
    return integrationPopupErrorResponse(
      "We couldn't finish connecting Slack. Please try again."
    );
  }
}

export const GET = withRouteErrorAlerting(handleGET, "app/api/integrations/slack/callback/route.ts:GET");
