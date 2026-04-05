"use server";

import { setUserSession } from "@/lib/auth";
import { requestEmailVerification } from "@/lib/auth-email-verification";
import { requestPasswordReset, resetPasswordWithToken } from "@/lib/auth-password-reset";
import { FORGOT_PASSWORD_ERROR_MESSAGE, RESET_PASSWORD_ERROR_MESSAGE } from "./auth-error-messages";
import type { PasswordActionState } from "./action-types";
import { getOwnerPostAuthPath } from "./post-auth-path";

function passwordActionError(error: string): PasswordActionState {
  return {
    ok: false,
    error,
    message: null,
    nextPath: null
  };
}

async function runEmailAction(input: {
  action: (email: string) => Promise<unknown>;
  email: string;
  errorMessage: string;
  logLabel: string;
  successMessage: string;
}) {
  const { action, email, errorMessage, logLabel, successMessage } = input;

  if (!email) {
    return passwordActionError("Enter your work email to continue.");
  }

  try {
    await action(email);
    return {
      ok: true,
      error: null,
      message: successMessage,
      nextPath: null
    };
  } catch (error) {
    console.error(`${logLabel} failed`, error);
    return passwordActionError(errorMessage);
  }
}

export async function forgotPasswordAction(formData: FormData): Promise<PasswordActionState> {
  const email = String(formData.get("email") ?? "").trim();
  return runEmailAction({
    action: requestPasswordReset,
    email,
    errorMessage: FORGOT_PASSWORD_ERROR_MESSAGE,
    logLabel: "forgotPasswordAction",
    successMessage: `We sent a password reset link to ${email}.`
  });
}

export async function resendVerificationAction(formData: FormData): Promise<PasswordActionState> {
  const email = String(formData.get("email") ?? "").trim();
  return runEmailAction({
    action: requestEmailVerification,
    email,
    errorMessage: "We couldn't send the verification link right now. Please try again in a moment.",
    logLabel: "resendVerificationAction",
    successMessage: "If that address belongs to an account that still needs verification, we sent a new link."
  });
}

export async function resetPasswordAction(formData: FormData): Promise<PasswordActionState> {
  const token = String(formData.get("token") ?? "").trim();
  const password = String(formData.get("password") ?? "").trim();
  const confirmPassword = String(formData.get("confirmPassword") ?? "").trim();

  if (!password || password.length < 8) {
    return passwordActionError("Use at least 8 characters for the new password.");
  }

  if (password !== confirmPassword) {
    return passwordActionError("Your password confirmation does not match.");
  }

  try {
    const { userId } = await resetPasswordWithToken(token, password);
    const nextPath = await getOwnerPostAuthPath(userId);
    await setUserSession(userId);

    return {
      ok: true,
      error: null,
      message: "Your password has been reset.",
      nextPath
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected password reset error.";
    if (message !== "INVALID_RESET_TOKEN") {
      console.error("resetPasswordAction failed", error);
    }

    return passwordActionError(
      message === "INVALID_RESET_TOKEN" ? "That reset link is invalid or has expired." : RESET_PASSWORD_ERROR_MESSAGE
    );
  }
}
