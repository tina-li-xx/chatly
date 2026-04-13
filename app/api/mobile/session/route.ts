import { clearUserSession, issueUserSessionToken, signInUser } from "@/lib/auth";
import { jsonError, jsonOk, requireJsonRouteUser } from "@/lib/route-helpers";
import { withRouteErrorAlerting } from "@/lib/route-error-alerting";
import { getRouteRequestId } from "@/lib/route-request-logging";
import { persistPreferredTimeZoneForUser } from "@/lib/user-timezone-preference";
import { getWorkspaceAccess } from "@/lib/workspace-access";

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;

function logMobileSession(
  requestId: string,
  stage: string,
  details: Record<string, unknown>
) {
  console.info(`[mobile-session:${requestId}] ${stage}`, details);
}

function buildSessionPayload(user: {
  id: string;
  email: string;
  createdAt: string;
  workspaceOwnerId: string;
  workspaceRole: "owner" | "admin" | "member";
}) {
  return {
    user,
    expiresInSeconds: SESSION_TTL_SECONDS
  };
}

async function handlePOST(request: Request) {
  const requestId = getRouteRequestId(request);

  try {
    const body = await request.json().catch(() => null);
    const email = String(body?.email ?? "").trim();
    const password = String(body?.password ?? "").trim();
    const timeZone = body?.timeZone;

    logMobileSession(requestId, "attempt", {
      email,
      passwordLength: password.length,
      timeZone: typeof timeZone === "string" ? timeZone : null
    });

    if (!email || !password) {
      logMobileSession(requestId, "missing-fields", {
        emailLength: email.length,
        passwordLength: password.length
      });
      return jsonError("missing-fields", 400);
    }

    const user = await signInUser(email, password);
    if (!user) {
      logMobileSession(requestId, "invalid-credentials", { email });
      return jsonError("invalid-credentials", 401);
    }

    const token = await issueUserSessionToken(user.id);
    await persistPreferredTimeZoneForUser(user.id, timeZone);
    const workspace = await getWorkspaceAccess(user.id);

    logMobileSession(requestId, "success", {
      userId: user.id,
      workspaceOwnerId: workspace.ownerUserId,
      workspaceRole: workspace.role
    });

    return jsonOk({
      token,
      ...buildSessionPayload({
        ...user,
        workspaceOwnerId: workspace.ownerUserId,
        workspaceRole: workspace.role
      })
    });
  } catch (error) {
    if (error instanceof Error && error.message === "EMAIL_NOT_VERIFIED") {
      logMobileSession(requestId, "email-not-verified", {});
      return jsonError("email-not-verified", 403);
    }

    throw error;
  }
}

async function handleGET() {
  const auth = await requireJsonRouteUser();
  if ("response" in auth) {
    return auth.response;
  }

  return jsonOk(buildSessionPayload(auth.user));
}

async function handleDELETE() {
  const auth = await requireJsonRouteUser();
  if ("response" in auth) {
    return auth.response;
  }

  await clearUserSession();
  return jsonOk({ revoked: true });
}

export const POST = withRouteErrorAlerting(handlePOST, "app/api/mobile/session/route.ts:POST");
export const GET = withRouteErrorAlerting(handleGET, "app/api/mobile/session/route.ts:GET");
export const DELETE = withRouteErrorAlerting(handleDELETE, "app/api/mobile/session/route.ts:DELETE");
