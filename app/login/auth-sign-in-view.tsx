"use client";

import { FormPasswordField, FormSubmitButton, FormTextField } from "../ui/form-controls";
import { AuthFormIntro } from "./auth-shell";
import { BrowserTimeZoneField } from "./browser-timezone-field";

type LoginViewProps = {
  email: string;
  inviteEmail: string;
  inviteId: string;
  isInviteFlow: boolean;
  onCreateAccount: () => void;
  onForgotPassword: () => void;
  password: string;
  redirectTo: string;
  submitAction: (payload: FormData) => void;
};

export function SignInAuthView({
  email,
  inviteEmail,
  inviteId,
  isInviteFlow,
  onCreateAccount,
  onForgotPassword,
  password,
  redirectTo,
  submitAction
}: LoginViewProps) {
  const initialEmail = email || inviteEmail;

  return (
    <div>
      <AuthFormIntro
        title={isInviteFlow ? "Sign in to accept your invite" : "Sign in"}
        caption={isInviteFlow ? "Need a new account instead?" : "Don't have an account?"}
        actionLabel="Create one"
        onAction={onCreateAccount}
      />

      <form action={submitAction} className="mt-8 space-y-5">
        {isInviteFlow ? (
          <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900">
            Use {inviteEmail || "the invited email"} to join this workspace.
          </div>
        ) : null}
        <BrowserTimeZoneField />
        {isInviteFlow ? <input type="hidden" name="inviteId" value={inviteId} /> : null}
        {redirectTo ? <input type="hidden" name="redirectTo" value={redirectTo} /> : null}

        <FormTextField
          label="Email"
          name="email"
          type="email"
          required
          autoComplete="email"
          defaultValue={initialEmail}
          placeholder="you@company.com"
        />

        <FormPasswordField
          label="Password"
          name="password"
          required
          autoComplete="current-password"
          defaultValue={password}
          placeholder="Enter your password"
        />

        <div className="flex justify-end text-sm">
          <button type="button" onClick={onForgotPassword} className="font-semibold text-blue-600">
            Forgot password?
          </button>
        </div>

        <FormSubmitButton idleLabel="Sign in" pendingLabel="Signing in..." />
      </form>
    </div>
  );
}
