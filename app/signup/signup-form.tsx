"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormButton, FormErrorMessage, FormPasswordField, FormTextField } from "../ui/form-controls";
import { AuthFormIntro, AuthPageShell } from "../login/auth-shell";
import { signupAction, type AuthActionState } from "../login/actions";

const INITIAL_AUTH_STATE: AuthActionState = {
  error: null,
  ok: false,
  nextPath: null,
  fields: {
    email: "",
    password: "",
    websiteUrl: "",
    referralCode: ""
  }
};

const SIGNUP_STATS = [
  { value: "Free", label: "To start" },
  { value: "5 min", label: "Setup time" },
  { value: "No CC", label: "Required" }
];

const SIGNUP_ONBOARDING_PATH = "/onboarding?step=customize";

export function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [signupState, setSignupState] = useState<AuthActionState>(INITIAL_AUTH_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const referralCodeFromQuery = String(searchParams.get("ref") ?? "").trim().toUpperCase();

  useEffect(() => {
    router.prefetch(SIGNUP_ONBOARDING_PATH);
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const websiteUrl = String(formData.get("websiteUrl") ?? "").trim();
    const referralCode = String(formData.get("referralCode") ?? referralCodeFromQuery).trim().toUpperCase();

    setIsSubmitting(true);
    setSignupState({
      error: null,
      ok: false,
      nextPath: null,
      fields: {
        email,
        password,
        websiteUrl,
        referralCode
      }
    });

    if (referralCode) {
      formData.set("referralCode", referralCode);
    }

    try {
      const result = await signupAction(INITIAL_AUTH_STATE, formData);
      setSignupState(result);

      if (result.ok) {
        router.replace((result.nextPath ?? SIGNUP_ONBOARDING_PATH) as never);
      } else {
        setIsSubmitting(false);
      }
    } catch {
      setIsSubmitting(false);
      setSignupState({
        error: "Account creation failed because of a server setup error. Check your local .env file and the server logs.",
        ok: false,
        nextPath: null,
        fields: {
          email,
          password,
          websiteUrl,
          referralCode
        }
      });
    }
  }

  return (
    <AuthPageShell
      heroTitle="Start chatting in minutes"
      heroDescription="Join 2,400+ teams who've transformed their customer conversations with Chatting."
      stats={SIGNUP_STATS}
    >
      <div>
        <AuthFormIntro
          title="Create your account"
          caption="Already have an account?"
          actionLabel="Sign in"
          onAction={() => router.push("/login")}
        />

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <FormErrorMessage message={signupState.error} />

          <FormTextField
            label="Work email"
            name="email"
            type="email"
            required
            autoComplete="email"
            defaultValue={signupState.fields.email}
            placeholder="you@company.com"
          />

          <FormTextField
            label="Website URL"
            name="websiteUrl"
            type="text"
            required
            autoComplete="url"
            defaultValue={signupState.fields.websiteUrl}
            placeholder="https://yoursite.com"
          />

          <FormTextField
            label="Referral code"
            name="referralCode"
            type="text"
            autoComplete="off"
            defaultValue={signupState.fields.referralCode || referralCodeFromQuery}
            placeholder="Optional"
          />

          <div>
            <FormPasswordField
              label="Password"
              name="password"
              required
              minLength={8}
              autoComplete="new-password"
              defaultValue={signupState.fields.password}
              placeholder="Create a password"
            />
          </div>

          <FormButton
            type="submit"
            fullWidth
            disabled={isSubmitting}
            trailingIcon={<span aria-hidden="true">→</span>}
          >
            {isSubmitting ? "Creating account..." : "Create account"}
          </FormButton>
        </form>

        <p className="mt-5 text-center text-sm leading-6 text-slate-500">
          By signing up, you agree to our{" "}
          <Link href="/terms" className="font-semibold text-blue-600">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="font-semibold text-blue-600">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </AuthPageShell>
  );
}
