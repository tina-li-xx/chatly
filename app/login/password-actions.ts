"use server";

import { setUserSession } from "@/lib/auth";
import { requestEmailVerification } from "@/lib/auth-email-verification";
import { requestPasswordReset, resetPasswordWithToken } from "@/lib/auth-password-reset";
import { withServerActionErrorAlerting } from "@/lib/server-action-error-alerting";
import { FORGOT_PASSWORD_ERROR_MESSAGE, RESET_PASSWORD_ERROR_MESSAGE } from "./auth-error-messages";
import type { PasswordActionState } from "./action-types";
import { getOwnerPostAuthPath } from "./post-auth-path";

const RESEND_VERIFICATION_ERROR_MESSAGE =
  "We couldn't send the verification link right now. Please try again in a moment.";

function passwordActionError(error: string): PasswordActionState {
  return {
    ok: false,
    error,
    message: null,
    nextPath: null
  };
}

function readEmail(formData: FormData) {
  return String(formData.get("email") ?? "").trim();
}

function isInvalidResetTokenError(error: unknown) {
  return error instanceof Error && error.message === "INVALID_RESET_TOKEN";
}

function wrapPasswordAction(
  actionId: string,
  action: (formData: FormData) => Promise<PasswordActionState>,
  onError: (error: unknown) => PasswordActionState,
  shouldReport?: (error: unknown) => boolean
) {
  return withServerActionErrorAlerting(action, {
    actionId,
    onError,
    shouldReport
  });
}

async function runEmailAction(input: {
  action: (email: string) => Promise<unknown>;
  email: string;
  successMessage: string;
}) {
  const { action, email, successMessage } = input;

  if (!email) {
    return passwordActionError("Enter your work email to continue.");
  }

  await action(email);
  return {
    ok: true,
    error: null,
    message: successMessage,
    nextPath: null
  };
}

async function handleForgotPasswordAction(formData: FormData): Promise<PasswordActionState> {
  const email = readEmail(formData);
  return runEmailAction({
    action: requestPasswordReset,
    email,
    successMessage: `We sent a password reset link to ${email}.`
  });
}

async function handleResendVerificationAction(formData: FormData): Promise<PasswordActionState> {
  const email = readEmail(formData);
  return runEmailAction({
    action: requestEmailVerification,
    email,
    successMessage: "If that address belongs to an account that still needs verification, we sent a new link."
  });
}

async function handleResetPasswordAction(formData: FormData): Promise<PasswordActionState> {
  const token = String(formData.get("token") ?? "").trim();
  const password = String(formData.get("password") ?? "").trim();
  const confirmPassword = String(formData.get("confirmPassword") ?? "").trim();

  if (!password || password.length < 8) {
    return passwordActionError("Use at least 8 characters for the new password.");
  }

  if (password !== confirmPassword) {
    return passwordActionError("Your password confirmation does not match.");
  }

  const { userId } = await resetPasswordWithToken(token, password);
  const nextPath = await getOwnerPostAuthPath(userId);
  await setUserSession(userId);

  return {
    ok: true,
    error: null,
    message: "Your password has been reset.",
    nextPath
  };
}

export const forgotPasswordAction = wrapPasswordAction(
  "app/login/password-actions.ts:forgotPasswordAction",
  handleForgotPasswordAction,
  () => passwordActionError(FORGOT_PASSWORD_ERROR_MESSAGE)
);

export const resendVerificationAction = wrapPasswordAction(
  "app/login/password-actions.ts:resendVerificationAction",
  handleResendVerificationAction,
  () => passwordActionError(RESEND_VERIFICATION_ERROR_MESSAGE)
);

export const resetPasswordAction = wrapPasswordAction(
  "app/login/password-actions.ts:resetPasswordAction",
  handleResetPasswordAction,
  (error) =>
    passwordActionError(
      isInvalidResetTokenError(error)
        ? "That reset link is invalid or has expired."
        : RESET_PASSWORD_ERROR_MESSAGE
    ),
  (error) => !isInvalidResetTokenError(error)
);
