import "server-only";

import { getBillingPlanDefinition, normalizeBillingPlanKey } from "@/lib/billing-plans";
import {
  listFounderRecentConversationRows,
  listFounderWorkspaceRows,
  type FounderRecentConversationRow,
  type FounderWorkspaceRow
} from "@/lib/repositories/founder-switchboard-repository";
import { truncate } from "@/lib/utils";

const DAY_MS = 24 * 60 * 60 * 1000;

export type FounderWorkspace = {
  ownerUserId: string;
  ownerEmail: string;
  ownerCreatedAt: string;
  emailVerifiedAt: string | null;
  teamName: string;
  primaryDomain: string | null;
  siteCount: number;
  siteDomains: string[];
  verifiedWidgetCount: number;
  hasWidgetInstalled: boolean;
  planKey: "starter" | "growth";
  planName: string;
  billingInterval: "monthly" | "annual" | null;
  subscriptionStatus: string | null;
  seatQuantity: number;
  teamMemberCount: number;
  trialEndsAt: string | null;
  conversationsLast30Days: number;
  conversationsLast7Days: number;
  openConversations: number;
  lastConversationAt: string | null;
  lastLoginAt: string | null;
  attentionFlags: string[];
};

export type FounderAttentionItem = {
  ownerUserId: string;
  ownerEmail: string;
  teamName: string;
  reason: string;
  detail: string;
};

export type FounderRecentActivity = {
  conversationId: string;
  ownerUserId: string;
  ownerEmail: string;
  teamName: string;
  siteName: string;
  visitorEmail: string | null;
  createdAt: string;
  status: "open" | "resolved";
  pageUrl: string | null;
  preview: string;
};

export type FounderSwitchboardData = {
  summary: {
    totalWorkspaces: number;
    activeWorkspaces7d: number;
    payingWorkspaces: number;
    trialingWorkspaces: number;
    conversations30d: number;
    verifiedWidgets: number;
    attentionItems: number;
  };
  workspaces: FounderWorkspace[];
  attentionItems: FounderAttentionItem[];
  recentActivity: FounderRecentActivity[];
};

function toCount(value: string | null | undefined) {
  return Number(value ?? "0");
}

function daysUntil(value: string | null) {
  return value ? Math.ceil((new Date(value).getTime() - Date.now()) / DAY_MS) : null;
}

function isOlderThan(value: string | null, days: number) {
  return value ? Date.now() - new Date(value).getTime() > days * DAY_MS : false;
}

function mapWorkspace(row: FounderWorkspaceRow): FounderWorkspace {
  const planKey = normalizeBillingPlanKey(row.plan_key);
  const attentionFlags: string[] = [];

  if (!row.has_widget_installed && isOlderThan(row.owner_created_at, 3)) attentionFlags.push("widget");
  if (!row.email_verified_at && isOlderThan(row.owner_created_at, 2)) attentionFlags.push("email");
  if ((daysUntil(row.trial_ends_at) ?? 99) <= 5 && (daysUntil(row.trial_ends_at) ?? -1) >= 0) attentionFlags.push("trial");
  if (planKey === "growth" && toCount(row.conversations_last_30_days) === 0 && isOlderThan(row.owner_created_at, 14)) {
    attentionFlags.push("quiet");
  }

  return {
    ownerUserId: row.owner_user_id,
    ownerEmail: row.owner_email,
    ownerCreatedAt: row.owner_created_at,
    emailVerifiedAt: row.email_verified_at,
    teamName: row.team_name?.trim() || row.primary_domain?.trim() || row.owner_email,
    primaryDomain: row.primary_domain,
    siteCount: toCount(row.site_count),
    siteDomains: row.site_domains?.filter(Boolean) ?? [],
    verifiedWidgetCount: toCount(row.verified_widget_count),
    hasWidgetInstalled: row.has_widget_installed,
    planKey,
    planName: getBillingPlanDefinition(planKey).name,
    billingInterval: row.billing_interval,
    subscriptionStatus: row.stripe_status,
    seatQuantity: row.seat_quantity ?? 1,
    teamMemberCount: toCount(row.team_member_count),
    trialEndsAt: row.trial_ends_at,
    conversationsLast30Days: toCount(row.conversations_last_30_days),
    conversationsLast7Days: toCount(row.conversations_last_7_days),
    openConversations: toCount(row.open_conversations),
    lastConversationAt: row.last_conversation_at,
    lastLoginAt: row.last_login_at,
    attentionFlags
  };
}

function buildAttentionItems(workspaces: FounderWorkspace[]): FounderAttentionItem[] {
  return workspaces.flatMap((workspace) => {
    const items: Array<FounderAttentionItem & { priority: number }> = [];
    if (workspace.attentionFlags.includes("trial")) items.push({ ...workspace, reason: "Trial ending soon", detail: `Growth trial ends in ${daysUntil(workspace.trialEndsAt)} day(s).`, priority: 0 });
    if (workspace.attentionFlags.includes("widget")) items.push({ ...workspace, reason: "Widget still not verified", detail: workspace.primaryDomain ? `${workspace.primaryDomain} has not reported a verified install yet.` : "No site has reported a verified install yet.", priority: 1 });
    if (workspace.attentionFlags.includes("quiet")) items.push({ ...workspace, reason: "Paid workspace is quiet", detail: "No conversations landed in the last 30 days on a paid plan.", priority: 2 });
    if (workspace.attentionFlags.includes("email")) items.push({ ...workspace, reason: "Owner email still unverified", detail: "This workspace has product setup data, but the owner email is not verified yet.", priority: 3 });
    return items;
  }).sort((left, right) => left.priority - right.priority).map(({ priority: _priority, ...item }) => item);
}

function mapRecentActivity(row: FounderRecentConversationRow): FounderRecentActivity {
  return {
    conversationId: row.conversation_id,
    ownerUserId: row.owner_user_id,
    ownerEmail: row.owner_email,
    teamName: row.team_name?.trim() || row.owner_email,
    siteName: row.site_name,
    visitorEmail: row.visitor_email,
    createdAt: row.created_at,
    status: row.status,
    pageUrl: row.page_url,
    preview: truncate(row.first_message_preview?.trim() || row.visitor_email || "New conversation", 88)
  };
}

export async function getFounderSwitchboardData(): Promise<FounderSwitchboardData> {
  const workspaceRows = await listFounderWorkspaceRows();
  const workspaces = workspaceRows.map(mapWorkspace);
  const attentionItems = buildAttentionItems(workspaces);
  const conversations30d = workspaces.reduce((sum, workspace) => sum + workspace.conversationsLast30Days, 0);
  const recentRows = conversations30d ? await listFounderRecentConversationRows(conversations30d) : [];

  return {
    summary: {
      totalWorkspaces: workspaces.length,
      activeWorkspaces7d: workspaces.filter((workspace) => workspace.conversationsLast7Days > 0 || (workspace.lastLoginAt ? !isOlderThan(workspace.lastLoginAt, 7) : false)).length,
      payingWorkspaces: workspaces.filter((workspace) => workspace.planKey === "growth").length,
      trialingWorkspaces: workspaces.filter((workspace) => (daysUntil(workspace.trialEndsAt) ?? -1) >= 0).length,
      conversations30d,
      verifiedWidgets: workspaces.filter((workspace) => workspace.hasWidgetInstalled).length,
      attentionItems: attentionItems.length
    },
    workspaces,
    attentionItems,
    recentActivity: recentRows.map(mapRecentActivity)
  };
}
