import "server-only";

import { GoogleAuth, Impersonated } from "google-auth-library";
import { getFcmPushConfig } from "@/lib/env.server";

const CLOUD_PLATFORM_SCOPE = "https://www.googleapis.com/auth/cloud-platform";
const FCM_SCOPE = "https://www.googleapis.com/auth/firebase.messaging";

type FcmAccessClient = Awaited<ReturnType<GoogleAuth["getClient"]>> | Impersonated;

export async function getFcmPushBearerToken() {
  const config = getFcmPushConfig();
  const projectId = await resolveProjectId(config.projectId);
  const client = await createFcmAccessClient(config.impersonatedServiceAccount);
  const accessToken = await readAccessToken(client);

  return {
    projectId,
    accessToken
  };
}

async function resolveProjectId(configuredProjectId: string | null) {
  if (configuredProjectId) {
    return configuredProjectId;
  }

  try {
    return await new GoogleAuth().getProjectId();
  } catch {
    throw new Error("FCM_PROJECT_ID_NOT_CONFIGURED");
  }
}

async function createFcmAccessClient(impersonatedServiceAccount: string | null): Promise<FcmAccessClient> {
  if (!impersonatedServiceAccount) {
    return new GoogleAuth({ scopes: [FCM_SCOPE] }).getClient();
  }

  const sourceClient = await new GoogleAuth({ scopes: [CLOUD_PLATFORM_SCOPE] }).getClient();
  return new Impersonated({
    sourceClient,
    targetPrincipal: impersonatedServiceAccount,
    targetScopes: [FCM_SCOPE],
    lifetime: 3600
  });
}

async function readAccessToken(client: FcmAccessClient) {
  const response = await client.getAccessToken();
  const accessToken = typeof response === "string" ? response : response?.token ?? null;
  if (!accessToken) {
    throw new Error("FCM_AUTH_TOKEN_MISSING");
  }

  return accessToken;
}
