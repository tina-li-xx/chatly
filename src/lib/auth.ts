import { randomBytes } from "node:crypto";
import { cache } from "react";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  AUTH_SESSION_COOKIE_NAME,
  buildLoginPath,
  readAuthRequestPathHeader,
  readAuthSessionCookieValue
} from "@/lib/auth-redirect";
import { hashSessionToken } from "@/lib/auth-session-token";
import { isProductionRuntime } from "@/lib/env";
import { deleteAuthSessionByTokenHash, findCurrentUserByTokenHash, insertAuthSession } from "@/lib/repositories/auth-repository";
import { getWorkspaceAccess } from "@/lib/workspace-access";
import { mapUser } from "./auth-credentials";

export {
  changeUserPassword,
  signInUser,
  signUpInvitedUser,
  signUpUser
} from "./auth-credentials";
export { resumeOwnerOnboardingForUser } from "./auth-owner-onboarding";

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;

export async function setUserSession(userId: string, activeWorkspaceOwnerId?: string | null) {
  const sessionId = randomBytes(16).toString("hex");
  const token = randomBytes(32).toString("hex");
  const cookieStore = await cookies();

  await insertAuthSession({
    sessionId,
    userId,
    tokenHash: hashSessionToken(token),
    activeWorkspaceOwnerId: activeWorkspaceOwnerId ?? null
  });

  cookieStore.set(AUTH_SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProductionRuntime(),
    path: "/",
    maxAge: SESSION_TTL_SECONDS
  });
}

export async function clearUserSession() {
  const cookieStore = await cookies();
  const token = readAuthSessionCookieValue(cookieStore);

  if (token) {
    await deleteAuthSessionByTokenHash(hashSessionToken(token));
  }

  cookieStore.delete(AUTH_SESSION_COOKIE_NAME);
}

export const getCurrentUser = cache(async function getCurrentUser() {
  const token = readAuthSessionCookieValue(await cookies());
  if (!token) {
    return null;
  }

  const row = await findCurrentUserByTokenHash(hashSessionToken(token));
  if (!row) {
    return null;
  }

  const user = mapUser(row);
  const workspace = await getWorkspaceAccess(user.id, row.active_workspace_owner_id ?? undefined);
  return {
    ...user,
    workspaceOwnerId: workspace.ownerUserId,
    workspaceRole: workspace.role
  };
});

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect(buildLoginPath(readAuthRequestPathHeader(await headers())));
  }

  return user;
}
