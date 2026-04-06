import "server-only";

import { cache } from "react";
import { resolveAiAssistUsageWindow } from "@/lib/ai-assist-warning";
import { ensureOwnerGrowthTrialBillingAccount } from "@/lib/billing-default-account";
import { normalizeBillingPlanKey } from "@/lib/billing-plans";
import { getAiAssistMonthlyRequestLimit } from "@/lib/plan-limits";

export const getDashboardAiAssistBillingCycle = cache(async function getDashboardAiAssistBillingCycle(
  ownerUserId: string,
  now = new Date()
) {
  const account = await ensureOwnerGrowthTrialBillingAccount(ownerUserId, now);
  const window = resolveAiAssistUsageWindow(account, now);
  const planKey = normalizeBillingPlanKey(account.plan_key);

  return {
    planKey,
    limit: getAiAssistMonthlyRequestLimit(planKey),
    startIso: window.start.toISOString(),
    nextIso: window.next.toISOString(),
    previousStartIso: window.previousStart.toISOString(),
    label: window.label
  };
});
