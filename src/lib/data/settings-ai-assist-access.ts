import "server-only";

import { normalizeBillingPlanKey, type BillingPlanKey } from "@/lib/billing-plans";
import { ensureOwnerGrowthTrialBillingAccount } from "@/lib/billing-default-account";
import { parseDashboardAiAssistSettings } from "@/lib/data/settings-ai-assist";
import {
  findWorkspaceAiAssistSettingsValue
} from "@/lib/repositories/ai-assist-settings-repository";
import { getWorkspaceAccess } from "@/lib/workspace-access";

export async function getDashboardAiAssistAccess(userId: string) {
  const workspace = await getWorkspaceAccess(userId);
  const [account, settingsValue] = await Promise.all([
    ensureOwnerGrowthTrialBillingAccount(workspace.ownerUserId),
    findWorkspaceAiAssistSettingsValue(workspace.ownerUserId)
  ]);

  return {
    ownerUserId: workspace.ownerUserId,
    planKey: normalizeBillingPlanKey(account.plan_key) as BillingPlanKey,
    settings: parseDashboardAiAssistSettings(settingsValue)
  };
}
