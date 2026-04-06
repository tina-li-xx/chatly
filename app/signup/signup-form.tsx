"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormButton, FormPasswordField, FormTextField } from "../ui/form-controls";
import { BrowserTimeZoneField } from "../login/browser-timezone-field";
import { useToast } from "../ui/toast-provider";
import { getGenericAuthErrorMessage } from "../login/auth-error-messages";
import { AuthFormIntro, AuthPageShell } from "../login/auth-shell";
import { signupAction, type AuthActionState } from "../login/actions";
import { trackGrometricsEvent } from "@/lib/grometrics";

const INITIAL_AUTH_STATE: AuthActionState = {
  error: null,
  ok: false,
  nextPath: null,
  fields: { email: "", password: "", websiteUrl: "", referralCode: "" }
};

const SIGNUP_STATS = [{ value: "Free", label: "To start" }, { value: "3 min", label: "Setup time" }, { value: "No CC", label: "Required" }];

export function SignupForm() {
  const router = useRouter();
  const { showToast } = useToast();
  const searchParams = useSearchParams();
  const [signupState, setSignupState] = useState<AuthActionState>(INITIAL_AUTH_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inviteIdFromQuery = String(searchParams.get("invite") ?? "").trim();
  const referralCodeFromQuery = String(searchParams.get("ref") ?? "").trim().toUpperCase();
  const emailFromQuery = String(searchParams.get("email") ?? "").trim();
  const isInviteSignup = Boolean(inviteIdFromQuery);
  const loginPath = inviteIdFromQuery
    ? `/login?invite=${encodeURIComponent(inviteIdFromQuery)}${emailFromQuery ? `&email=${encodeURIComponent(emailFromQuery)}` : ""}`
    : "/login";
  const formEmail = signupState.fields.email || emailFromQuery;
  const formReferralCode = signupState.fields.referralCode || referralCodeFromQuery;
  const showVerificationNotice = signupState.ok && !signupState.nextPath && !isInviteSignup;
  const verificationDestination = formEmail || "your inbox";

  useEffect(() => {
    if (isInviteSignup) router.prefetch("/dashboard");
  }, [isInviteSignup, router]);

  function handleReturnToSignup() {
    setSignupState((current) => ({ ...current, ok: false }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const websiteUrl = String(formData.get("websiteUrl") ?? "").trim();
    const referralCode = String(formData.get("referralCode") ?? referralCodeFromQuery).trim().toUpperCase();
    const fields = { email, password, websiteUrl, referralCode };
    setIsSubmitting(true);
    setSignupState({ error: null, ok: false, nextPath: null, fields });
    if (referralCode) {
      formData.set("referralCode", referralCode);
    }
    if (inviteIdFromQuery) {
      formData.set("inviteId", inviteIdFromQuery);
    }
    try {
      const result = await signupAction(INITIAL_AUTH_STATE, formData);
      setSignupState(result);
      if (result.ok) {
        trackGrometricsEvent("signup_completed", {
          source: isInviteSignup ? "invite_signup" : "signup_page",
          flow: isInviteSignup ? "invite" : "self_serve",
          has_referral_code: !isInviteSignup && Boolean(referralCode),
          has_website_url: Boolean(websiteUrl)
        });
        if (result.nextPath) {
          router.replace(result.nextPath as never);
        } else {
          setIsSubmitting(false);
        }
      } else if (!result.ok) {
        setIsSubmitting(false);
        if (result.error) {
          showToast("error", result.error);
        }
      }
    } catch {
      const error = getGenericAuthErrorMessage("signup");
      setIsSubmitting(false);
      setSignupState({ error, ok: false, nextPath: null, fields });
      showToast("error", error);
    }
  }

  return (
    <AuthPageShell
      heroTitle={isInviteSignup ? "Join the workspace" : "Start chatting in minutes"}
      heroDescription={isInviteSignup
        ? "Create your account with the invited email and we'll drop you straight into the shared inbox."
        : "Join 2,400+ teams who've transformed their customer conversations with Chatting."}
      stats={SIGNUP_STATS}
    >
      <div>
        <AuthFormIntro
          title={
            showVerificationNotice
              ? "Check your email"
              : isInviteSignup
                ? "Create your teammate account"
                : "Create your account"
          }
          caption={
            showVerificationNotice
              ? `We sent a verification link to ${verificationDestination}.`
              : isInviteSignup
                ? "Already have an account for this email?"
                : "Already have an account?"
          }
          actionLabel={showVerificationNotice ? undefined : "Sign in"}
          onAction={showVerificationNotice ? undefined : () => router.push(loginPath as never)}
        />

        {showVerificationNotice ? (
          <div className="mt-8 space-y-3 text-center">
            <p className="text-sm leading-6 text-slate-500">
              Wrong email? Edit it and send a new link.
            </p>
            <div className="flex justify-center">
              <FormButton type="button" variant="secondary" onClick={handleReturnToSignup}>
                Edit email
              </FormButton>
            </div>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              {isInviteSignup ? (
                <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900">
                  Create this account with {emailFromQuery || "the invited email"} to join the workspace.
                </div>
              ) : null}
              <BrowserTimeZoneField />

              <FormTextField
                label="Work email"
                name="email"
                type="email"
                required
                autoComplete="email"
                defaultValue={formEmail}
                placeholder="you@company.com"
              />

              {isInviteSignup ? null : (
                <>
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
                    defaultValue={formReferralCode}
                    placeholder="Optional"
                  />
                </>
              )}

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
                trailingIcon={<span aria-hidden="true">→</span>}>
                {isSubmitting ? "Creating account..." : isInviteSignup ? "Join workspace" : "Create account"}
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
          </>
        )}
      </div>
    </AuthPageShell>
  );
}
