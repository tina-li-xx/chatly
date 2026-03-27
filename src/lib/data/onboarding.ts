import { findUserOnboardingState, updateUserOnboardingStep } from "@/lib/repositories/onboarding-repository";
import type { OnboardingStep } from "@/lib/types";
import { listSitesForUser } from "./sites";

export type ActiveOnboardingStep = Exclude<OnboardingStep, "signup" | "team" | "done">;

export function onboardingPathForStep(step: OnboardingStep) {
  if (step === "done") {
    return "/dashboard";
  }

  if (step === "team") {
    return "/onboarding?step=customize";
  }

  return `/onboarding?step=${step}`;
}

export function normalizeOnboardingStep(
  value: string | null | undefined,
  fallback: OnboardingStep
): OnboardingStep {
  if (value === "team") {
    return "customize";
  }

  if (value === "customize" || value === "install" || value === "done") {
    return value;
  }

  return fallback === "team" ? "customize" : fallback;
}

export async function getUserOnboardingStep(userId: string) {
  const state = await findUserOnboardingState(userId);
  return normalizeOnboardingStep(state?.onboarding_step, "done");
}

export async function getPostAuthPath(userId: string) {
  const step = await getUserOnboardingStep(userId);
  return onboardingPathForStep(step);
}

export async function setUserOnboardingStep(userId: string, step: Exclude<OnboardingStep, "signup">) {
  return updateUserOnboardingStep(userId, step);
}

export async function getOnboardingData(userId: string) {
  const [step, sites] = await Promise.all([
    getUserOnboardingStep(userId),
    listSitesForUser(userId)
  ]);

  return {
    step,
    site: sites[0] ?? null
  };
}
