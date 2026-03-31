import {
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
import { ensureOwnerGrowthTrialBillingAccount } from "@/lib/billing-default-account";
import { getEffectiveBillingSubscriptionStatus } from "@/lib/billing-trial-state";
import { countBillableWorkspaceSeats, normalizeBillableSeatCount } from "@/lib/billing-seats";
import type {
  DashboardBillingInvoice,
  DashboardBillingPaymentMethod,
  DashboardBillingSummary
} from "@/lib/data/billing-types";
import { getStarterConversationUsage } from "@/lib/freemium";
import { getDashboardReferralSummary, syncReferralRewardsForUser, type DashboardReferralSummary } from "@/lib/referrals";
import {
  findBillingAccountRow,
  findBillingPaymentMethodRow,
  listBillingInvoiceRows
} from "@/lib/repositories/billing-repository";
import { findBillingInsightsRow } from "@/lib/repositories/billing-insights-repository";
import {
  createStripeBillingPortalSession,
  createStripeCheckoutSession,
  syncStripeBillingState
} from "@/lib/stripe-billing";
import { isStripeBillingReady, isStripeConfigured } from "@/lib/stripe";
import { getWorkspaceAccess } from "@/lib/workspace-access";

export type { BillingInterval, BillingPlanFeatures, BillingPlanKey } from "@/lib/billing-plans";
export type {
  DashboardBillingInvoice,
  DashboardBillingPaymentMethod,
  DashboardBillingSummary
} from "@/lib/data/billing-types";

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
  return ensureOwnerGrowthTrialBillingAccount(userId);
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
  const subscriptionStatus = getEffectiveBillingSubscriptionStatus({
    planKey,
    subscriptionStatus: account.stripe_status,
    stripeSubscriptionId: account.stripe_subscription_id,
    trialEndsAt: account.trial_ends_at
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
    subscriptionStatus,
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
