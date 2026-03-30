"use server";

import { setUserSession, signInUser, signUpUser } from "@/lib/auth";
import { sendAccountWelcomeEmail } from "@/lib/chatly-transactional-email-senders";
import { getPostAuthPath } from "@/lib/data";
import { getPublicAppUrl } from "@/lib/env";

export type AuthActionState = {
  error: string | null;
  ok: boolean;
  nextPath: string | null;
  fields: {
    email: string;
    password: string;
    websiteUrl: string;
    referralCode: string;
  };
};

function formatAuthError(message: string, mode: "login" | "signup") {
  const envLabel =
    process.env.NODE_ENV === "production"
      ? "your deployment environment"
      : "your local .env file";

  if (message === "EMAIL_TAKEN") {
    return "That email already has an account.";
  }

  if (message === "WEAK_PASSWORD") {
    return "Use at least 8 characters for the password.";
  }

  if (message === "MISSING_PASSWORD") {
    return "Password is required.";
  }

  if (message === "MISSING_EMAIL") {
    return "Work email is required.";
  }

  if (message === "MISSING_DOMAIN") {
    return "Website URL is required.";
  }

  if (message === "INVALID_REFERRAL_CODE" || message === "SELF_REFERRAL") {
    return "That referral code wasn't recognized.";
  }

  if (message.includes("DATABASE_URL")) {
    return `DATABASE_URL is missing or invalid in ${envLabel}.`;
  }

  if (message.includes("AUTH_SECRET")) {
    return `AUTH_SECRET is missing in ${envLabel}.`;
  }

  if (
    message.includes("connect") ||
    message.includes("ECONN") ||
    message.includes("getaddrinfo") ||
    message.includes("password authentication failed") ||
    message.includes("connection")
  ) {
    return `Database connection failed. Check the Neon DATABASE_URL in ${envLabel}.`;
  }

  return mode === "signup"
    ? `Account creation failed because of a server setup error. Check ${envLabel} and the server logs.`
    : `Sign in failed because of a server setup error. Check ${envLabel} and the server logs.`;
}

function isExpectedAuthError(message: string) {
  return (
    message === "EMAIL_TAKEN" ||
    message === "WEAK_PASSWORD" ||
    message === "MISSING_PASSWORD" ||
    message === "MISSING_EMAIL" ||
    message === "MISSING_DOMAIN" ||
    message === "INVALID_REFERRAL_CODE" ||
    message === "SELF_REFERRAL"
  );
}

export async function loginAction(
  _previousState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "").trim();

  const fields = {
    email,
    password,
    websiteUrl: "",
    referralCode: ""
  };

  if (!email) {
    return {
      ok: false,
      error: "Work email is required.",
      nextPath: null,
      fields
    };
  }

  if (!password) {
    return {
      ok: false,
      error: "Password is required.",
      nextPath: null,
      fields
    };
  }

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

    await setUserSession(user.id);
    const nextPath = await getPostAuthPath(user.id);

    return {
      ok: true,
      error: null,
      nextPath,
      fields
    };
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

  const fields = {
    email,
    password,
    websiteUrl,
    referralCode
  };

  try {
    const user = await signUpUser({
      email,
      password,
      websiteUrl,
      referralCode
    });

    await setUserSession(user.id);
    try {
      await sendAccountWelcomeEmail({
        to: user.email,
        firstName: user.email.split("@")[0] || "there",
        dashboardUrl: `${getPublicAppUrl()}/dashboard`
      });
    } catch (emailError) {
      console.error("signup welcome email failed", emailError);
    }

    return {
      ok: true,
      error: null,
      nextPath: "/onboarding?step=customize",
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
