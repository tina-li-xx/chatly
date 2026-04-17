import { normalizeBillingPlanKey } from "@/lib/billing-plans";
import { getContactPlanLimits } from "@/lib/plan-limits";
import {
  findBillingAccountRow
} from "@/lib/repositories/billing-repository";
import {
  hasAccessibleSiteRow,
  listContactConversationHistoryRows
} from "@/lib/repositories/contact-access-repository";
import {
  findWorkspaceContactSettingsValue
} from "@/lib/repositories/contact-settings-repository";
import {
  findAccessibleDashboardContactRow
} from "@/lib/repositories/contacts-repository";
import { decodeContactId, parseContactSettingsJson } from "@/lib/contact-utils";
import { getWorkspaceAccess } from "@/lib/workspace-access";

export async function resolveAccessibleContactContext(userId: string, contactId: string) {
  const decoded = decodeContactId(contactId);
  if (!decoded) {
    return null;
  }

  const workspace = await getWorkspaceAccess(userId);
  const row = await findAccessibleDashboardContactRow(
    workspace.ownerUserId,
    userId,
    decoded.siteId,
    decoded.email
  );
  if (!row) {
    return null;
  }

  return { decoded, workspace, row };
}

export async function loadConversationHistory(
  ownerUserId: string,
  viewerUserId: string,
  siteId: string,
  email: string
) {
  return listContactConversationHistoryRows({
    ownerUserId,
    viewerUserId,
    siteId,
    email
  });
}

export async function resolveContactSettings(userId: string) {
  const workspace = await getWorkspaceAccess(userId);
  const [account, settingsJson] = await Promise.all([
    findBillingAccountRow(workspace.ownerUserId),
    findWorkspaceContactSettingsValue(workspace.ownerUserId)
  ]);
  const planKey = normalizeBillingPlanKey(account?.plan_key);
  const settings = parseContactSettingsJson(settingsJson, planKey);

  return {
    workspace,
    planKey,
    settings,
    limits: getContactPlanLimits(planKey)
  };
}

export async function hasAccessibleSite(userId: string, siteId: string) {
  const workspace = await getWorkspaceAccess(userId);
  return hasAccessibleSiteRow({
    siteId,
    ownerUserId: workspace.ownerUserId,
    viewerUserId: userId
  });
}
