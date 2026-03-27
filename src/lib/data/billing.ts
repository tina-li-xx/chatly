import {
  findBillingAccountRow,
  findBillingPaymentMethodRow,
  findBillingUsageRow,
  listBillingInvoiceRows,
  upsertBillingAccountRow
} from "@/lib/repositories/billing-repository";
import { listPendingTeamInviteRows } from "@/lib/repositories/settings-repository";
import {
  createStripeBillingPortalSession,
  createStripeCheckoutSession,
  syncStripeBillingState
} from "@/lib/stripe-billing";
import { isStripeBillingReady, isStripeConfigured } from "@/lib/stripe";

export type BillingPlanKey = "starter" | "pro";

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
  usedSeats: number;
  seatLimit: number | null;
  siteCount: number;
  conversationCount: number;
  nextBillingDate: string | null;
  subscriptionStatus: string | null;
  customerId: string | null;
  portalAvailable: boolean;
  checkoutAvailable: boolean;
  paymentMethod: DashboardBillingPaymentMethod | null;
  invoices: DashboardBillingInvoice[];
};

const PLAN_DETAILS: Record<
  BillingPlanKey,
  {
    planName: string;
    priceLabel: string;
    seatLimit: number | null;
  }
> = {
  starter: {
    planName: "Starter Plan",
    priceLabel: "$0/month",
    seatLimit: 5
  },
  pro: {
    planName: "Pro Plan",
    priceLabel: "$79/month",
    seatLimit: null
  }
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

function normalizePlanKey(value: string): BillingPlanKey {
  return value === "pro" ? "pro" : "starter";
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
    planKey: normalizePlanKey(invoice.plan_key),
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
    nextBillingDate: null
  });

  return {
    user_id: userId,
    plan_key: "starter" as const,
    next_billing_date: null,
    stripe_customer_id: null,
    stripe_subscription_id: null,
    stripe_price_id: null,
    stripe_status: null,
    stripe_current_period_end: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

async function resolveUsedSeats(userId: string, usedSeats?: number) {
  if (typeof usedSeats === "number" && Number.isFinite(usedSeats)) {
    return usedSeats;
  }

  const inviteRows = await listPendingTeamInviteRows(userId);
  return 1 + inviteRows.filter((invite) => invite.status === "pending").length;
}

async function buildDashboardBillingSummary(userId: string, usedSeats?: number) {
  const resolvedUsedSeats = await resolveUsedSeats(userId, usedSeats);
  const [account, usage, paymentMethodRow, invoiceRows] = await Promise.all([
    ensureBillingAccount(userId),
    findBillingUsageRow(userId),
    findBillingPaymentMethodRow(userId),
    listBillingInvoiceRows(userId)
  ]);

  const planKey = normalizePlanKey(account.plan_key);
  const plan = PLAN_DETAILS[planKey];
  const billingReady = isStripeBillingReady();

  return {
    planKey,
    planName: plan.planName,
    priceLabel: plan.priceLabel,
    usedSeats: resolvedUsedSeats,
    seatLimit: plan.seatLimit,
    siteCount: Number(usage.site_count ?? 0),
    conversationCount: Number(usage.conversation_count ?? 0),
    nextBillingDate: formatBillingDate(account.next_billing_date),
    subscriptionStatus: account.stripe_status,
    customerId: account.stripe_customer_id,
    portalAvailable: Boolean(account.stripe_customer_id && billingReady),
    checkoutAvailable: billingReady,
    paymentMethod: toDashboardPaymentMethod(paymentMethodRow),
    invoices: toDashboardInvoices(invoiceRows)
  } satisfies DashboardBillingSummary;
}

export async function getDashboardBillingSummary(userId: string, usedSeats?: number) {
  const account = await ensureBillingAccount(userId);

  if (account.stripe_customer_id && isStripeConfigured()) {
    await syncStripeBillingState(userId).catch(() => {});
  }

  return buildDashboardBillingSummary(userId, usedSeats);
}

export async function syncDashboardBillingSummary(userId: string, email: string, usedSeats?: number) {
  if (isStripeConfigured()) {
    await syncStripeBillingState(userId, email).catch(() => {});
  }

  return buildDashboardBillingSummary(userId, usedSeats);
}

export async function createDashboardBillingCheckoutSession(userId: string, email: string) {
  return createStripeCheckoutSession(userId, email);
}

export async function createDashboardBillingPortalSession(userId: string, email: string) {
  return createStripeBillingPortalSession(userId, email);
}
