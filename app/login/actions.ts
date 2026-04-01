"use server";

import { sanitizeReturnPath } from "@/lib/auth-redirect";
import { requestEmailVerificationForUserId } from "@/lib/auth-email-verification";
import {
  resumeOwnerOnboardingForUser,
  setUserSession,
  signInUser,
  signUpInvitedUser,
  signUpUser
} from "@/lib/auth";
import { sendAccountWelcomeEmail } from "@/lib/chatly-transactional-email-senders";
import { getPostAuthPath, onboardingPathForStep } from "@/lib/data";
import { getPublicAppUrl } from "@/lib/env";
import { acceptTeamInvite } from "@/lib/workspace-access";
import { formatAuthError, isExpectedAuthError } from "./action-errors";
import type { AuthActionState } from "./action-types";

export type { AuthActionState, PasswordActionState } from "./action-types";

function emptyFields() {
  return {
    email: "",
    password: "",
    websiteUrl: "",
    referralCode: ""
  };
}

async function getOwnerPostAuthPath(userId: string) {
  try {
    await resumeOwnerOnboardingForUser(userId);
    return await getPostAuthPath(userId);
  } catch (error) {
    if (error instanceof Error && error.message === "MISSING_DOMAIN") {
      return onboardingPathForStep("customize");
    }

    throw error;
  }
}

export async function loginAction(
  _previousState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "").trim();
  const inviteId = String(formData.get("inviteId") ?? "").trim();
  const redirectTo = String(formData.get("redirectTo") ?? "").trim();
  const fields = { ...emptyFields(), email, password };

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

    if (inviteId) {
      await acceptTeamInvite({ inviteId, userId: user.id, email: user.email });
    }

    const defaultNextPath = inviteId ? "/dashboard" : await getOwnerPostAuthPath(user.id);
    await setUserSession(user.id);
    const nextPath =
      !inviteId && defaultNextPath === onboardingPathForStep("done")
        ? sanitizeReturnPath(redirectTo) ?? defaultNextPath
        : defaultNextPath;

    return { ok: true, error: null, nextPath, fields };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected login error.";
    if (!isExpectedAuthError(message)) {
      console.error("loginAction failed", error);
    }

    return {
      ok: false,
      error: formatAuthError(message, "login"),
      nextPath: null,
      fields
    };
  }
}

export async function signupAction(
  _previousState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const websiteUrl = String(formData.get("websiteUrl") ?? "").trim();
  const referralCode = String(formData.get("referralCode") ?? "").trim();
  const inviteId = String(formData.get("inviteId") ?? "").trim();
  const fields = { email, password, websiteUrl, referralCode };

  try {
    const user = inviteId
      ? await signUpInvitedUser({ inviteId, email, password })
      : await signUpUser({ email, password, websiteUrl, referralCode });

    await setUserSession(user.id);

    if (!inviteId) {
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

    const nextPath = inviteId ? "/dashboard" : await getPostAuthPath(user.id);

    return {
      ok: true,
      error: null,
      nextPath,
      fields
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected signup error.";
    if (!isExpectedAuthError(message)) {
      console.error("signupAction failed", error);
    }

    return {
      ok: false,
      error: formatAuthError(message, "signup"),
      nextPath: null,
      fields
    };
  }
}
