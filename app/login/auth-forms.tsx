"use client";

import type { FormEvent } from "react";
import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "../ui/toast-provider";
import {
  AuthSuccessView,
  ForgotPasswordView,
  ResetPasswordView,
  SignInAuthView
} from "./auth-form-views";
import { AuthPageShell } from "./auth-shell";
import {
  type AuthFormsProps,
  type AuthMode,
  DEFAULT_SUCCESS_COPY,
  INITIAL_AUTH_STATE,
  SIGNIN_STATS
} from "./auth-forms-config";
import { submitPasswordFlow } from "./auth-form-submit";
import type { PasswordActionState } from "./action-types";
import { loginAction } from "./actions";
import { forgotPasswordAction, resendVerificationAction, resetPasswordAction } from "./password-actions";
import { ResendVerificationView } from "./auth-verification-view";

export function AuthForms({
  initialMode = "signin",
  resetToken = "",
  inviteId = "",
  inviteEmail = "",
  redirectTo = ""
}: AuthFormsProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const inviteQuery = inviteId
    ? `?invite=${encodeURIComponent(inviteId)}${inviteEmail ? `&email=${encodeURIComponent(inviteEmail)}` : ""}`
    : "";
  const isInviteFlow = Boolean(inviteId);
  const [mode, setMode] = useState<AuthMode>(initialMode === "reset" && resetToken ? "reset" : initialMode);
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
  const [successCopy, setSuccessCopy] = useState(DEFAULT_SUCCESS_COPY);
  const [loginState, loginFormAction] = useActionState(loginAction, INITIAL_AUTH_STATE);
  const lastLoginToastErrorRef = useRef<string | null>(null);
  const handleCreateAccount = () => router.push(`/signup${inviteQuery}` as never);

  useEffect(() => {
    if (loginState.ok) {
      router.replace((loginState.nextPath ?? "/dashboard") as never);
    }
  }, [loginState.nextPath, loginState.ok, router]);

  useEffect(() => {
    if (!loginState.error || lastLoginToastErrorRef.current === loginState.error) {
      return;
    }

    lastLoginToastErrorRef.current = loginState.error;
    showToast("error", loginState.error);
  }, [loginState, showToast]);

  function handleLoginAction(formData: FormData) {
    lastLoginToastErrorRef.current = null;
    return loginFormAction(formData);
  }

  function handleModeChange(nextMode: AuthMode) {
    setMode(nextMode);
  }

  function showSuccess(title: string, defaultBody: string, result: PasswordActionState) {
    setSuccessCopy({
      title,
      body: result.message ?? defaultBody
    });
    setMode("success");
  }

  async function handleForgotSubmit(event: FormEvent<HTMLFormElement>) {
    await submitPasswordFlow({
      action: forgotPasswordAction,
      event,
      onError: (message) => showToast("error", message),
      onSuccess: (result) => showSuccess("Reset email sent", "Check your inbox for the reset link.", result),
      setSubmitting: setPasswordSubmitting
    });
  }

  async function handleResetSubmit(event: FormEvent<HTMLFormElement>) {
    await submitPasswordFlow({
      action: resetPasswordAction,
      event,
      mutateFormData: (formData) => formData.set("token", resetToken),
      onError: (message) => showToast("error", message),
      onSuccess: (result) =>
        showSuccess("Password updated", "Your password has been reset. You can sign in with the new one now.", result),
      setSubmitting: setPasswordSubmitting
    });
  }

  async function handleResendSubmit(event: FormEvent<HTMLFormElement>) {
    await submitPasswordFlow({
      action: resendVerificationAction,
      event,
      onError: (message) => showToast("error", message),
      onSuccess: (result) =>
        showSuccess("Verification email sent", "Check your inbox for the verification link.", result),
      setSubmitting: setPasswordSubmitting
    });
  }

  return (
    <AuthPageShell
      heroTitle={isInviteFlow ? "Join your team's workspace" : "Welcome back to Chatting"}
      heroDescription={
        isInviteFlow
          ? "Sign in with the invited email to accept your workspace access and jump into the inbox."
          : "Connect with your visitors in real-time. Turn conversations into customers."
      }
      stats={SIGNIN_STATS}
    >
      {mode === "signin" ? (
        <SignInAuthView
          email={loginState.fields.email}
          inviteEmail={inviteEmail}
          inviteId={inviteId}
          isInviteFlow={isInviteFlow}
          onCreateAccount={handleCreateAccount}
          onForgotPassword={() => handleModeChange("forgot")}
          onResendVerification={() => handleModeChange("verify")}
          password={loginState.fields.password}
          redirectTo={redirectTo}
          submitAction={handleLoginAction}
        />
      ) : null}

      {mode === "forgot" ? (
        <ForgotPasswordView
          email={loginState.fields.email}
          isSubmitting={passwordSubmitting}
          onBackToSignIn={() => handleModeChange("signin")}
          onSubmit={handleForgotSubmit}
        />
      ) : null}

      {mode === "reset" ? (
        <ResetPasswordView isSubmitting={passwordSubmitting} onSubmit={handleResetSubmit} />
      ) : null}

      {mode === "verify" ? (
        <ResendVerificationView
          email={loginState.fields.email}
          isSubmitting={passwordSubmitting}
          onBackToSignIn={() => handleModeChange("signin")}
          onSubmit={handleResendSubmit}
        />
      ) : null}

      {mode === "success" ? (
        <AuthSuccessView
          body={successCopy.body}
          onBackToSignIn={() => handleModeChange("signin")}
          onCreateAccount={handleCreateAccount}
          title={successCopy.title}
        />
      ) : null}
    </AuthPageShell>
  );
}
