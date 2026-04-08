import "server-only";

import { getPublicAppUrl, isProductionRuntime } from "@/lib/env";
import { getRequiredServerEnv } from "@/lib/env.server";

export const SLACK_BOT_SCOPES = [
  "chat:write",
  "chat:write.public",
  "channels:read",
  "groups:read",
  "channels:history",
  "groups:history"
] as const;

export const SLACK_OAUTH_STATE_COOKIE = "chatting_slack_oauth_state";

type SlackOAuthResponse = {
  ok?: boolean;
  error?: string;
  access_token?: string;
  token_type?: string;
  scope?: string;
  app_id?: string;
  bot_user_id?: string;
  refresh_token?: string;
  expires_in?: number;
  authed_user?: {
    id?: string;
  };
  team?: {
    id?: string;
    name?: string;
  };
};

export type SlackOAuthSuccess = {
  accessToken: string;
  tokenType: string | null;
  scopes: string[];
  appId: string | null;
  botUserId: string | null;
  teamId: string | null;
  teamName: string;
  refreshToken: string | null;
  expiresIn: number | null;
  authedUserId: string | null;
};

export function getSlackOAuthCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: isProductionRuntime(),
    path: "/",
    maxAge: 60 * 10
  };
}

export function getSlackOAuthRedirectUri() {
  return new URL("/api/integrations/slack/callback", getPublicAppUrl()).toString();
}

export function buildSlackAuthorizeUrl(state: string) {
  const url = new URL("https://slack.com/oauth/v2/authorize");
  url.searchParams.set("client_id", getRequiredServerEnv("SLACK_CLIENT_ID"));
  url.searchParams.set("scope", SLACK_BOT_SCOPES.join(","));
  url.searchParams.set("redirect_uri", getSlackOAuthRedirectUri());
  url.searchParams.set("state", state);
  return url.toString();
}

export async function exchangeSlackOAuthCode(code: string): Promise<SlackOAuthSuccess> {
  const body = new URLSearchParams({
    code,
    client_id: getRequiredServerEnv("SLACK_CLIENT_ID"),
    client_secret: getRequiredServerEnv("SLACK_CLIENT_SECRET"),
    redirect_uri: getSlackOAuthRedirectUri()
  });
  const response = await fetch("https://slack.com/api/oauth.v2.access", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body
  });

  if (!response.ok) {
    throw new Error("SLACK_OAUTH_EXCHANGE_FAILED");
  }

  const payload = (await response.json()) as SlackOAuthResponse;
  if (!payload.ok || !payload.access_token || !payload.team?.name) {
    throw new Error(payload.error || "SLACK_OAUTH_EXCHANGE_FAILED");
  }

  return {
    accessToken: payload.access_token,
    tokenType: payload.token_type ?? null,
    scopes: (payload.scope ?? "")
      .split(",")
      .map((scope) => scope.trim())
      .filter(Boolean),
    appId: payload.app_id ?? null,
    botUserId: payload.bot_user_id ?? null,
    teamId: payload.team.id ?? null,
    teamName: payload.team.name,
    refreshToken: payload.refresh_token ?? null,
    expiresIn: typeof payload.expires_in === "number" ? payload.expires_in : null,
    authedUserId: payload.authed_user?.id ?? null
  };
}
