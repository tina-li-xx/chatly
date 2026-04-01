import { ensureOwnerGrowthTrialBillingAccount } from "@/lib/billing-default-account";
import { createSiteForUser, listSitesForUser } from "@/lib/data/sites";
import {
  completeUserOwnerOnboarding,
  updateUserOwnerOnboardingStage
} from "@/lib/repositories/auth-owner-onboarding-repository";
import { findAuthUserById } from "@/lib/repositories/auth-repository";
import { applyReferralCodeForSignup, normalizeReferralCode } from "@/lib/referrals";
import { normalizeSiteDomain } from "@/lib/widget-settings";

const NON_RETRYABLE_REFERRAL_ERRORS = new Set(["INVALID_REFERRAL_CODE", "SELF_REFERRAL"]);

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function defaultSiteNameForEmail(email: string) {
  const domain = normalizeEmail(email).split("@")[1];
  const label = domain?.split(".")[0];
  return label ? `${label.charAt(0).toUpperCase()}${label.slice(1)}` : "My site";
}

async function ensureOwnerPrimarySite(userId: string, email: string, siteDomain: string) {
  const existingSites = await listSitesForUser(userId);
  if (existingSites[0]) {
    return existingSites[0];
  }

  return createSiteForUser(userId, {
    name: defaultSiteNameForEmail(email),
    domain: siteDomain
  });
}

async function markOwnerOnboardingComplete(userId: string) {
  await completeUserOwnerOnboarding(userId);
  return "complete" as const;
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "UNKNOWN_OWNER_ONBOARDING_ERROR";
}

export async function resumeOwnerOnboardingForUser(userId: string) {
  const user = await findAuthUserById(userId);
  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  let stage = user.owner_onboarding_stage;
  if (stage === "complete") {
    return stage;
  }

  const siteDomain = normalizeSiteDomain(user.owner_onboarding_site_domain);
  if (!siteDomain && stage === "account_created") {
    throw new Error("MISSING_DOMAIN");
  }

  if (siteDomain) {
    await ensureOwnerPrimarySite(user.id, user.email, siteDomain);
    if (stage === "account_created") {
      stage = (await updateUserOwnerOnboardingStage(user.id, "site_created"))?.owner_onboarding_stage ?? "site_created";
    }
  }

  if (stage === "site_created") {
    await ensureOwnerGrowthTrialBillingAccount(user.id);
    stage = (await updateUserOwnerOnboardingStage(user.id, "billing_ready"))?.owner_onboarding_stage ?? "billing_ready";
  }

  if (stage === "billing_ready") {
    const referralCode = normalizeReferralCode(user.owner_onboarding_referral_code);
    if (!referralCode) {
      return markOwnerOnboardingComplete(user.id);
    }

    try {
      await applyReferralCodeForSignup({
        userId: user.id,
        email: user.email,
        referralCode
      });
      stage =
        (await updateUserOwnerOnboardingStage(user.id, "referral_applied"))?.owner_onboarding_stage ??
        "referral_applied";
    } catch (error) {
      const message = errorMessage(error);
      console.error("owner onboarding referral resume failed", error);
      if (NON_RETRYABLE_REFERRAL_ERRORS.has(message)) {
        return markOwnerOnboardingComplete(user.id);
      }
      return stage;
    }
  }

  if (stage === "referral_applied") {
    return markOwnerOnboardingComplete(user.id);
  }

  return stage;
}
