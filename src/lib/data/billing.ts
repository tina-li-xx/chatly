import {
  BILLING_TRIAL_EXTENSION_DAYS,
  type BillingInterval,
  type BillingPlanFeatures,
  type BillingPlanKey,
  formatBillingPriceLabel,
  getBillingPlanDefinition,
  getBillingPlanFeatures,
  isPaidPlan,
  normalizeBillingInterval,
  normalizeBillingPlanKey
} from "@/lib/billing-plans";
import { countBillableWorkspaceSeats, normalizeBillableSeatCount } from "@/lib/billing-seats";
import { sendTrialExtensionOutreachEmail } from "@/lib/billing-outreach";
import {
  isActiveTrialWorkspace,
  isBillingTrialExtensionEligible
} from "@/lib/billing-trials";
import { getStarterConversationUsage } from "@/lib/freemium";
import { getDashboardReferralSummary, syncReferralRewardsForUser, type DashboardReferralSummary } from "@/lib/referrals";
import {
  findBillingAccountRow,
  findBillingPaymentMethodRow,
  findBillingUsageRow,
  listBillingInvoiceRows,
  upsertBillingAccountRow
} from "@/lib/repositories/billing-repository";
import { findBillingInsightsRow } from "@/lib/repositories/billing-insights-repository";
import {
  createStripeBillingPortalSession,
  createStripeCheckoutSession,
  extendStripeTrial,
  syncStripeBillingState
} from "@/lib/stripe-billing";
import { isStripeBillingReady, isStripeConfigured } from "@/lib/stripe";
import { getWorkspaceAccess } from "@/lib/workspace-access";

export type { BillingInterval, BillingPlanFeatures, BillingPlanKey } from "@/lib/billing-plans";

export type DashboardBillingPaymentMethod = {
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  holderName: string;
  updatedAt: string;
};

export type DashboardBillingInvoice = {
  id: string;
  planKey: BillingPlanKey;
  billingInterval: BillingInterval | null;
  seatQuantity: number | null;
  description: string;
  amountCents: number;
  currency: string;
  status: "paid" | "open";
  hostedInvoiceUrl: string | null;
  invoicePdfUrl: string | null;
  issuedAt: string;
  paidAt: string | null;
  periodStart: string | null;
  periodEnd: string | null;
};

export type DashboardBillingSummary = {
  planKey: BillingPlanKey;
  planName: string;
  priceLabel: string;
  billingInterval: BillingInterval | null;
  usedSeats: number;
  billedSeats: number | null;
  seatLimit: number | null;
  siteCount: number;
  conversationCount: number;
  messageCount?: number;
  avgResponseSeconds?: number | null;
  conversationLimit: number | null;
  conversationUsagePercent: number | null;
  upgradePromptThreshold: number | null;
  remainingConversations: number | null;
  showUpgradePrompt: boolean;
  limitReached: boolean;
  nextBillingDate: string | null;
  trialEndsAt: string | null;
  trialExtensionEligible: boolean;
  trialExtensionUsedAt: string | null;
  activityQualifiedForTrialExtension: boolean;
  subscriptionStatus: string | null;
  customerId: string | null;
  portalAvailable: boolean;
  checkoutAvailable: boolean;
  features: BillingPlanFeatures;
  paymentMethod: DashboardBillingPaymentMethod | null;
  invoices: DashboardBillingInvoice[];
  referrals: DashboardReferralSummary;
};

function formatBillingDate(value: string | Date | null) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat("en-GB", {
    month: "long",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}

function toDashboardPaymentMethod(
  paymentMethod: Awaited<ReturnType<typeof findBillingPaymentMethodRow>>
): DashboardBillingPaymentMethod | null {
  if (!paymentMethod) {
    return null;
  }

  return {
    brand: paymentMethod.brand,
    last4: paymentMethod.last4,
    expMonth: Number(paymentMethod.exp_month),
    expYear: Number(paymentMethod.exp_year),
    holderName: paymentMethod.holder_name,
    updatedAt: paymentMethod.updated_at
  };
}

function toDashboardInvoices(
  invoices: Awaited<ReturnType<typeof listBillingInvoiceRows>>
): DashboardBillingInvoice[] {
  return invoices.map((invoice) => ({
    id: invoice.id,
    planKey: normalizeBillingPlanKey(invoice.plan_key),
    billingInterval: invoice.billing_interval ? normalizeBillingInterval(invoice.billing_interval) : null,
    seatQuantity: invoice.seat_quantity == null ? null : Number(invoice.seat_quantity),
    description: invoice.description,
    amountCents: Number(invoice.amount_cents),
    currency: invoice.currency,
    status: invoice.status,
    hostedInvoiceUrl: invoice.hosted_invoice_url,
    invoicePdfUrl: invoice.invoice_pdf_url,
    issuedAt: invoice.issued_at,
    paidAt: invoice.paid_at,
    periodStart: invoice.period_start,
    periodEnd: invoice.period_end
  }));
}

async function ensureBillingAccount(userId: string) {
  const existing = await findBillingAccountRow(userId);
  if (existing) {
    return existing;
  }

  await upsertBillingAccountRow({
    userId,
    planKey: "starter",
    billingInterval: "monthly",
    seatQuantity: 1,
    nextBillingDate: null
  });

  return {
    user_id: userId,
    plan_key: "starter" as const,
    billing_interval: "monthly" as const,
    seat_quantity: 1,
    next_billing_date: null,
    stripe_customer_id: null,
    stripe_subscription_id: null,
    stripe_price_id: null,
    stripe_status: null,
    stripe_current_period_end: null,
    trial_started_at: null,
    trial_ends_at: null,
    trial_extension_used_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

async function resolveUsedSeats(userId: string, usedSeats?: number) {
  if (typeof usedSeats === "number" && Number.isFinite(usedSeats)) {
    return normalizeBillableSeatCount(usedSeats);
  }

  return countBillableWorkspaceSeats(userId);
}

async function buildDashboardBillingSummary(userId: string, usedSeats?: number) {
  const resolvedUsedSeats = await resolveUsedSeats(userId, usedSeats);
  const [account, usage, paymentMethodRow, invoiceRows, referrals] = await Promise.all([
    ensureBillingAccount(userId),
    findBillingInsightsRow(userId),
    findBillingPaymentMethodRow(userId),
    listBillingInvoiceRows(userId),
    getDashboardReferralSummary(userId)
  ]);

  const planKey = normalizeBillingPlanKey(account.plan_key);
  const billingInterval = isPaidPlan(planKey) ? normalizeBillingInterval(account.billing_interval) : null;
  const plan = getBillingPlanDefinition(planKey);
  const billingReady = isStripeBillingReady();
  const siteCount = Number(usage.site_count ?? 0);
  const monthlyConversationCount = Number(usage.conversation_count ?? 0);
  const monthlyMessageCount = Number(usage.message_count ?? 0);
  const avgResponseSeconds =
    usage.avg_response_seconds == null ? null : Math.round(Number(usage.avg_response_seconds));
  const starterConversationUsage =
    planKey === "starter" ? getStarterConversationUsage(monthlyConversationCount) : null;
  const activityQualifiedForTrialExtension = isActiveTrialWorkspace({
    siteCount,
    conversationCount: monthlyConversationCount,
    usedSeats: resolvedUsedSeats
  });
  const trialExtensionEligible = isBillingTrialExtensionEligible({
    planKey,
    subscriptionStatus: account.stripe_status,
    trialEndsAt: account.trial_ends_at,
    trialExtensionUsedAt: account.trial_extension_used_at,
    siteCount,
    conversationCount: monthlyConversationCount,
    usedSeats: resolvedUsedSeats
  });

  return {
    planKey,
    planName: plan.dashboardName,
    priceLabel: formatBillingPriceLabel(planKey, billingInterval),
    billingInterval,
    usedSeats: resolvedUsedSeats,
    billedSeats: isPaidPlan(planKey) ? Number(account.seat_quantity ?? resolvedUsedSeats) : null,
    seatLimit: plan.seatLimit,
    siteCount,
    conversationCount: starterConversationUsage?.conversationCount ?? monthlyConversationCount,
    messageCount: monthlyMessageCount,
    avgResponseSeconds,
    conversationLimit: starterConversationUsage?.conversationLimit ?? null,
    conversationUsagePercent: starterConversationUsage?.conversationUsagePercent ?? null,
    upgradePromptThreshold: starterConversationUsage?.upgradePromptThreshold ?? null,
    remainingConversations: starterConversationUsage?.remainingConversations ?? null,
    showUpgradePrompt: starterConversationUsage?.shouldShowUpgradePrompt ?? false,
    limitReached: starterConversationUsage?.limitReached ?? false,
    nextBillingDate: formatBillingDate(account.next_billing_date),
    trialEndsAt: formatBillingDate(account.trial_ends_at),
    trialExtensionEligible,
    trialExtensionUsedAt: formatBillingDate(account.trial_extension_used_at),
    activityQualifiedForTrialExtension,
    subscriptionStatus: account.stripe_status,
    customerId: account.stripe_customer_id,
    portalAvailable: Boolean(account.stripe_customer_id && billingReady),
    checkoutAvailable: billingReady,
    features: getBillingPlanFeatures(planKey),
    paymentMethod: toDashboardPaymentMethod(paymentMethodRow),
    invoices: toDashboardInvoices(invoiceRows),
    referrals
  } satisfies DashboardBillingSummary;
}

export async function getDashboardBillingSummary(userId: string, usedSeats?: number) {
  const workspace = await getWorkspaceAccess(userId);
  const resolvedUsedSeats = await resolveUsedSeats(workspace.ownerUserId, usedSeats);
  const account = await ensureBillingAccount(workspace.ownerUserId);

  if (account.stripe_customer_id && isStripeConfigured()) {
    await syncStripeBillingState(workspace.ownerUserId, undefined, resolvedUsedSeats).catch(() => {});
  }

  await syncReferralRewardsForUser(workspace.ownerUserId);
  return buildDashboardBillingSummary(workspace.ownerUserId, resolvedUsedSeats);
}

export async function syncDashboardBillingSummary(userId: string, email: string, usedSeats?: number) {
  const workspace = await getWorkspaceAccess(userId);
  const resolvedUsedSeats = await resolveUsedSeats(workspace.ownerUserId, usedSeats);

  if (isStripeConfigured()) {
    await syncStripeBillingState(workspace.ownerUserId, workspace.ownerEmail || email, resolvedUsedSeats).catch(() => {});
  }

  await syncReferralRewardsForUser(workspace.ownerUserId);
  return buildDashboardBillingSummary(workspace.ownerUserId, resolvedUsedSeats);
}

export async function createDashboardBillingCheckoutSession(
  userId: string,
  email: string,
  input: {
    planKey: BillingPlanKey;
    billingInterval: BillingInterval;
    seatQuantity: number;
  }
) {
  const workspace = await getWorkspaceAccess(userId);
  return createStripeCheckoutSession(workspace.ownerUserId, workspace.ownerEmail || email, input);
}

export async function createDashboardBillingPortalSession(userId: string, email: string) {
  const workspace = await getWorkspaceAccess(userId);
  return createStripeBillingPortalSession(workspace.ownerUserId, workspace.ownerEmail || email);
}

export async function requestDashboardTrialExtension(userId: string, email: string) {
  const workspace = await getWorkspaceAccess(userId);
  const resolvedUsedSeats = await resolveUsedSeats(workspace.ownerUserId);

  if (isStripeConfigured()) {
    await syncStripeBillingState(workspace.ownerUserId, workspace.ownerEmail || email, resolvedUsedSeats).catch(() => {});
  }

  const [account, usage] = await Promise.all([
    ensureBillingAccount(workspace.ownerUserId),
    findBillingUsageRow(workspace.ownerUserId)
  ]);
  const planKey = normalizeBillingPlanKey(account.plan_key);
  const siteCount = Number(usage.site_count ?? 0);
  const conversationCount = Number(usage.conversation_count ?? 0);

  if (!isBillingTrialExtensionEligible({
    planKey,
    subscriptionStatus: account.stripe_status,
    trialEndsAt: account.trial_ends_at,
    trialExtensionUsedAt: account.trial_extension_used_at,
    siteCount,
    conversationCount,
    usedSeats: resolvedUsedSeats
  })) {
    throw new Error("TRIAL_EXTENSION_UNAVAILABLE");
  }

  const extended = await extendStripeTrial(workspace.ownerUserId, BILLING_TRIAL_EXTENSION_DAYS, resolvedUsedSeats);
  const billing = await buildDashboardBillingSummary(workspace.ownerUserId, resolvedUsedSeats);

  let outreachQueued = true;

  if (extended.trialEndsAt) {
    try {
      await sendTrialExtensionOutreachEmail({
        to: workspace.ownerEmail || email,
        planName: getBillingPlanDefinition(planKey).name,
        trialEndsAt: extended.trialEndsAt
      });
    } catch (error) {
      outreachQueued = false;
    }
  }

  return {
    billing,
    outreachQueued
  };
}
