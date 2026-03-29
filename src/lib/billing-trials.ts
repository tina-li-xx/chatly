import {
  type BillingPlanKey,
  getBillingPlanFeatures,
  isPaidPlan
} from "@/lib/billing-plans";

export type BillingTrialEligibilityInput = {
  planKey: BillingPlanKey;
  subscriptionStatus: string | null;
  trialEndsAt: string | null;
  trialExtensionUsedAt: string | null;
  siteCount: number;
  conversationCount: number;
  usedSeats: number;
};

export function isActiveTrialWorkspace(input: Pick<
  BillingTrialEligibilityInput,
  "siteCount" | "conversationCount" | "usedSeats"
>) {
  return input.conversationCount >= 3 || input.usedSeats >= 2 || input.siteCount >= 2;
}

export function isBillingTrialExtensionEligible(input: BillingTrialEligibilityInput) {
  if (!isPaidPlan(input.planKey)) {
    return false;
  }

  if (!getBillingPlanFeatures(input.planKey).trialExtensions) {
    return false;
  }

  if (input.subscriptionStatus !== "trialing" || !input.trialEndsAt) {
    return false;
  }

  if (input.trialExtensionUsedAt) {
    return false;
  }

  return isActiveTrialWorkspace(input);
}
