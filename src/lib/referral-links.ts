import { getPublicAppUrl } from "@/lib/env";

export function buildReferralSignupUrl(code?: string | null) {
  const url = new URL("/signup", getPublicAppUrl());

  if (code) {
    url.searchParams.set("ref", code);
  }

  return url.toString();
}

export function referralShareUrl(code: string) {
  return buildReferralSignupUrl(code);
}
