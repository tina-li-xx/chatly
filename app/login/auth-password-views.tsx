"use client";

import type { FormEventHandler } from "react";
import { CheckCircleIcon } from "../dashboard/dashboard-ui";
import { FormButton, FormPasswordField, FormTextField } from "../ui/form-controls";
import { AuthFormIntro } from "./auth-shell";

type PasswordActionViewProps = {
  email?: string;
  isSubmitting: boolean;
  onBackToSignIn?: () => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
};

type SuccessViewProps = {
  body: string;
  onBackToSignIn: () => void;
  title: string;
};

export function ForgotPasswordView({
  email = "",
  isSubmitting,
  onBackToSignIn,
  onSubmit
}: PasswordActionViewProps) {
  return (
    <div>
      <AuthFormIntro
        title="Forgot password"
        caption="Remembered it?"
        actionLabel="Back to sign in"
        onAction={onBackToSignIn}
      />

      <form onSubmit={onSubmit} className="mt-10 space-y-5">
        <FormTextField
          label="Email"
          name="email"
          type="email"
          required
          autoComplete="email"
          defaultValue={email}
          placeholder="you@company.com"
        />

        <FormButton type="submit" fullWidth disabled={isSubmitting} trailingIcon={<span aria-hidden="true">→</span>}>
          Send reset link
        </FormButton>
      </form>
    </div>
  );
}

export function ResetPasswordView({
  isSubmitting,
  onSubmit
}: Omit<PasswordActionViewProps, "email" | "onBackToSignIn">) {
  return (
    <div>
      <AuthFormIntro title="Reset password" caption="Set a new password for your account." />

      <form onSubmit={onSubmit} className="mt-10 space-y-5">
        <FormPasswordField
          label="New password"
          name="password"
          required
          minLength={8}
          autoComplete="new-password"
          placeholder="Enter a new password"
        />

        <FormPasswordField
          label="Confirm password"
          name="confirmPassword"
          required
          minLength={8}
          autoComplete="new-password"
          placeholder="Re-enter your password"
        />

        <FormButton type="submit" fullWidth disabled={isSubmitting} trailingIcon={<span aria-hidden="true">→</span>}>
          Reset password
        </FormButton>
      </form>
    </div>
  );
}

export function AuthSuccessView({
  body,
  onBackToSignIn,
  title
}: SuccessViewProps) {
  return (
    <div className="text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
        <CheckCircleIcon className="h-8 w-8" />
      </div>
      <h1 className="display-font mt-8 text-5xl text-slate-900">{title}</h1>
      <p className="mt-5 text-lg leading-8 text-slate-500">{body}</p>
      <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <FormButton type="button" onClick={onBackToSignIn} trailingIcon={<span aria-hidden="true">→</span>}>
          Back to sign in
        </FormButton>
      </div>
    </div>
  );
}
