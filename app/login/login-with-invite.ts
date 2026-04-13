"use server";

import { signInUser } from "@/lib/auth";
import { findExistingUserIdByEmail, markAuthUserEmailVerified } from "@/lib/repositories/auth-repository";
import { withServerActionErrorAlerting } from "@/lib/server-action-error-alerting";
import { validateTeamInvite } from "@/lib/workspace-access";
import { isExpectedAuthError } from "./action-errors";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

async function signInWithInviteAwareVerificationAction(input: {
  email: string;
  password: string;
  inviteId: string;
}) {
  try {
    return await signInUser(input.email, input.password);
  } catch (error) {
    if (!(error instanceof Error) || error.message !== "EMAIL_NOT_VERIFIED") {
      throw error;
    }

    const email = normalizeEmail(input.email);
    await validateTeamInvite(input.inviteId, email);
    const userId = await findExistingUserIdByEmail(email);
    if (!userId) {
      throw error;
    }

    await markAuthUserEmailVerified(userId);
    return signInUser(email, input.password);
  }
}

export const signInWithInviteAwareVerification = withServerActionErrorAlerting(
  signInWithInviteAwareVerificationAction,
  {
    actionId: "app/login/login-with-invite.ts:signInWithInviteAwareVerification",
    shouldReport: (error) => !(error instanceof Error && isExpectedAuthError(error.message)),
    onError: (error) => {
      throw error;
    }
  }
);
