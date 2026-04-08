"use server";

import { sanitizeReturnPath } from "@/lib/auth-redirect";
import { requestEmailVerificationForUserId } from "@/lib/auth-email-verification";
import {
  setUserSession,
  signInUser,
  signUpInvitedUser,
  signUpUser
} from "@/lib/auth";
import { sendAccountWelcomeEmail } from "@/lib/chatting-transactional-email-senders";
import { onboardingPathForStep } from "@/lib/data";
import { getPublicAppUrl } from "@/lib/env";
import { persistPreferredTimeZoneForUser } from "@/lib/user-timezone-preference";
import { acceptTeamInvite } from "@/lib/workspace-access";
import { resolveExpectedAuthActionError, wrapAuthAction } from "./action-error-alerting";
import type { AuthActionState } from "./action-types";
import { getOwnerPostAuthPath } from "./post-auth-path";

export type { AuthActionState, PasswordActionState } from "./action-types";

function emptyFields() {
  return {
    email: "",
    password: "",
    websiteUrl: "",
    referralCode: ""
  };
}

async function sendOwnerSignupFollowUps(user: { id: string; email: string }) {
  try {
    await requestEmailVerificationForUserId(user.id);
  } catch (verificationError) {
    console.error("signup verification email failed", verificationError);
  }

  try {
    await sendAccountWelcomeEmail({
      to: user.email,
      firstName: user.email.split("@")[0] || "there",
      dashboardUrl: `${getPublicAppUrl()}/dashboard`
    });
  } catch (emailError) {
    console.error("signup welcome email failed", emailError);
  }
}

function readInviteContext(formData: FormData) {
  return {
    inviteId: String(formData.get("inviteId") ?? "").trim(),
    timeZone: String(formData.get("timezone") ?? "").trim()
  };
}

function readLoginFields(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "").trim();
  return {
    ...readInviteContext(formData),
    email,
    password,
    redirectTo: String(formData.get("redirectTo") ?? "").trim(),
    fields: { ...emptyFields(), email, password }
  };
}

function readSignupFields(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const websiteUrl = String(formData.get("websiteUrl") ?? "").trim();
  const referralCode = String(formData.get("referralCode") ?? "").trim();
  return {
    ...readInviteContext(formData),
    email,
    password,
    websiteUrl,
    referralCode,
    fields: { email, password, websiteUrl, referralCode }
  };
}

async function handleLoginAction(
  _previousState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const { email, password, inviteId, redirectTo, timeZone, fields } = readLoginFields(formData);

  if (!email) return { ok: false, error: "Work email is required.", nextPath: null, fields };
  if (!password) return { ok: false, error: "Password is required.", nextPath: null, fields };

  try {
    const user = await signInUser(email, password);
    if (!user) {
      return {
        ok: false,
        error: "That email and password combination didn't match.",
        nextPath: null,
        fields
      };
    }

    let inviteWorkspaceOwnerId: string | null = null;
    if (inviteId) {
      const invite = await acceptTeamInvite({ inviteId, userId: user.id, email: user.email });
      inviteWorkspaceOwnerId = invite.ownerUserId;
    }

    const defaultNextPath = inviteId ? "/dashboard" : await getOwnerPostAuthPath(user.id);
    await setUserSession(user.id, inviteWorkspaceOwnerId);
    await persistPreferredTimeZoneForUser(user.id, timeZone);
    const nextPath =
      !inviteId && defaultNextPath === onboardingPathForStep("done")
        ? sanitizeReturnPath(redirectTo) ?? defaultNextPath
        : defaultNextPath;

    return { ok: true, error: null, nextPath, fields };
  } catch (error) {
    const formattedError = resolveExpectedAuthActionError(error, "login");
    if (!formattedError) {
      throw error;
    }

    return {
      ok: false,
      error: formattedError,
      nextPath: null,
      fields
    };
  }
}

async function handleSignupAction(
  _previousState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const { email, password, websiteUrl, referralCode, inviteId, timeZone, fields } =
    readSignupFields(formData);

  try {
    const user = inviteId
      ? await signUpInvitedUser({ inviteId, email, password })
      : await signUpUser({ email, password, websiteUrl, referralCode });
    const workspaceOwnerId =
      "workspaceOwnerId" in user && typeof user.workspaceOwnerId === "string" ? user.workspaceOwnerId : null;

    await persistPreferredTimeZoneForUser(user.id, timeZone);

    if (inviteId) {
      await setUserSession(user.id, workspaceOwnerId);
      return {
        ok: true,
        error: null,
        nextPath: "/dashboard",
        fields
      };
    }

    await sendOwnerSignupFollowUps(user);

    return {
      ok: true,
      error: null,
      nextPath: null,
      fields
    };
  } catch (error) {
    const formattedError = resolveExpectedAuthActionError(error, "signup");
    if (!formattedError) {
      throw error;
    }

    return {
      ok: false,
      error: formattedError,
      nextPath: null,
      fields
    };
  }
}

export const loginAction = wrapAuthAction(
  "app/login/actions.ts:loginAction",
  "login",
  readLoginFields,
  handleLoginAction
);

export const signupAction = wrapAuthAction(
  "app/login/actions.ts:signupAction",
  "signup",
  readSignupFields,
  handleSignupAction
);
