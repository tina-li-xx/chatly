import { Linking } from "react-native";
import { useEffect, useState } from "react";
import {
  createMobileSession,
  requestMobilePasswordReset,
  resetMobilePassword
} from "./auth-api";
import { AuthStatusScreen } from "./auth-status-screen";
import { authErrorViewModel, maskEmail, MobileAuthMode, readResetTokenFromUrl } from "./auth-helpers";
import { ForgotPasswordScreen } from "./forgot-password-screen";
import { LoginScreen } from "./login-screen";
import { ResetPasswordScreen } from "./reset-password-screen";
import type { MobileSession } from "./types";

type MobileAuthFlowProps = {
  baseUrl: string;
  onAuthenticated(session: MobileSession, rememberMe: boolean): Promise<void> | void;
};

export function MobileAuthFlow({ baseUrl, onAuthenticated }: MobileAuthFlowProps) {
  const [mode, setMode] = useState<MobileAuthMode>("signin");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const statusError = error ? authErrorViewModel(new Error(error)) : null;

  useEffect(() => {
    let mounted = true;

    async function hydrateInitialUrl() {
      const token = readResetTokenFromUrl(await Linking.getInitialURL());
      if (!mounted || !token) {
        return;
      }
      setResetToken(token);
      setMode("reset");
    }

    hydrateInitialUrl();
    const subscription = Linking.addEventListener("url", ({ url }) => {
      const token = readResetTokenFromUrl(url);
      if (!token) {
        return;
      }
      setResetToken(token);
      setError(null);
      setMode("reset");
    });

    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  async function run(action: () => Promise<void>) {
    setSubmitting(true);
    setError(null);
    try {
      await action();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "request-failed");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLogin(input: { email: string; password: string; rememberMe: boolean }) {
    await run(async () => {
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const next = await createMobileSession(baseUrl, input.email, input.password, timeZone);
      setEmail(input.email);
      await onAuthenticated({ baseUrl, ...next }, input.rememberMe);
    });
  }

  function handleForgotPassword(nextEmail: string) {
    void run(async () => {
      await requestMobilePasswordReset(baseUrl, nextEmail);
      setEmail(nextEmail);
      setMode("email-sent");
    });
  }

  function handleResetPassword(password: string, confirmPassword: string) {
    void run(async () => {
      await resetMobilePassword(baseUrl, resetToken, password, confirmPassword);
      setMode("success");
    });
  }

  if (mode === "forgot") {
    return (
      <ForgotPasswordScreen
        defaultEmail={email}
        error={error}
        submitting={submitting}
        onBack={() => {
          setError(null);
          setMode("signin");
        }}
        onSubmit={handleForgotPassword}
      />
    );
  }

  if (mode === "email-sent") {
    return (
      <AuthStatusScreen
        actionLabel="Open email app"
        description={`We sent a reset link to ${maskEmail(email)}. Click the link in the email to reset your password.`}
        icon="mail"
        message={statusError?.message ?? null}
        messageTone={statusError?.tone}
        secondaryLabel="Resend email"
        title="Check your email"
        onAction={() => Linking.openURL("mailto:")}
        onSecondaryAction={() => handleForgotPassword(email)}
      />
    );
  }

  if (mode === "reset") {
    return <ResetPasswordScreen error={error} submitting={submitting} onSubmit={handleResetPassword} />;
  }

  if (mode === "success") {
    return (
      <AuthStatusScreen
        actionLabel="Continue to sign in"
        description="Your password has been successfully reset."
        icon="checkmark"
        title="Password reset!"
        onAction={() => {
          setError(null);
          setMode("signin");
        }}
      />
    );
  }

  return (
    <LoginScreen
      defaultEmail={email}
      error={error}
      submitting={submitting}
      onForgotPassword={() => {
        setError(null);
        setMode("forgot");
      }}
      onOpenSignUp={() => Linking.openURL(`${baseUrl}/signup`)}
      onSubmit={(input) => void handleLogin(input)}
    />
  );
}
