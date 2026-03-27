import { query } from "@/lib/db";

export type BillingAccountRow = {
  user_id: string;
  plan_key: "starter" | "pro";
  next_billing_date: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;
  stripe_status: string | null;
  stripe_current_period_end: string | null;
  created_at: string;
  updated_at: string;
};

export type BillingPaymentMethodRow = {
  user_id: string;
  stripe_payment_method_id: string | null;
  brand: string;
  last4: string;
  exp_month: number;
  exp_year: number;
  holder_name: string;
  created_at: string;
  updated_at: string;
};

export type BillingInvoiceRow = {
  id: string;
  user_id: string;
  stripe_invoice_id: string | null;
  plan_key: "starter" | "pro";
  description: string;
  amount_cents: number;
  currency: string;
  status: "paid" | "open";
  hosted_invoice_url: string | null;
  invoice_pdf_url: string | null;
  issued_at: string;
  paid_at: string | null;
  period_start: string | null;
  period_end: string | null;
  created_at: string;
};

export type BillingUsageRow = {
  conversation_count: string;
  site_count: string;
};

export async function findBillingUsageRow(userId: string) {
  const result = await query<BillingUsageRow>(
    `
      SELECT
        COUNT(c.id)::text AS conversation_count,
        COUNT(DISTINCT s.id)::text AS site_count
      FROM sites s
      LEFT JOIN conversations c
        ON c.site_id = s.id
      WHERE s.user_id = $1
    `,
    [userId]
  );

  return result.rows[0] ?? { conversation_count: "0", site_count: "0" };
}

export async function findBillingAccountRow(userId: string) {
  const result = await query<BillingAccountRow>(
    `
      SELECT
        user_id,
        plan_key,
        next_billing_date,
        stripe_customer_id,
        stripe_subscription_id,
        stripe_price_id,
        stripe_status,
        stripe_current_period_end,
        created_at,
        updated_at
      FROM billing_accounts
      WHERE user_id = $1
      LIMIT 1
    `,
    [userId]
  );

  return result.rows[0] ?? null;
}

export async function upsertBillingAccountRow(input: {
  userId: string;
  planKey: "starter" | "pro";
  nextBillingDate: string | null;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  stripePriceId?: string | null;
  stripeStatus?: string | null;
  stripeCurrentPeriodEnd?: string | null;
}) {
  await query(
    `
      INSERT INTO billing_accounts (
        user_id,
        plan_key,
        next_billing_date,
        stripe_customer_id,
        stripe_subscription_id,
        stripe_price_id,
        stripe_status,
        stripe_current_period_end,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      ON CONFLICT (user_id) DO UPDATE SET
        plan_key = EXCLUDED.plan_key,
        next_billing_date = EXCLUDED.next_billing_date,
        stripe_customer_id = COALESCE(EXCLUDED.stripe_customer_id, billing_accounts.stripe_customer_id),
        stripe_subscription_id = EXCLUDED.stripe_subscription_id,
        stripe_price_id = EXCLUDED.stripe_price_id,
        stripe_status = EXCLUDED.stripe_status,
        stripe_current_period_end = EXCLUDED.stripe_current_period_end,
        updated_at = NOW()
    `,
    [
      input.userId,
      input.planKey,
      input.nextBillingDate,
      input.stripeCustomerId ?? null,
      input.stripeSubscriptionId ?? null,
      input.stripePriceId ?? null,
      input.stripeStatus ?? null,
      input.stripeCurrentPeriodEnd ?? null
    ]
  );
}

export async function findBillingAccountRowByStripeCustomerId(stripeCustomerId: string) {
  const result = await query<BillingAccountRow>(
    `
      SELECT
        user_id,
        plan_key,
        next_billing_date,
        stripe_customer_id,
        stripe_subscription_id,
        stripe_price_id,
        stripe_status,
        stripe_current_period_end,
        created_at,
        updated_at
      FROM billing_accounts
      WHERE stripe_customer_id = $1
      LIMIT 1
    `,
    [stripeCustomerId]
  );

  return result.rows[0] ?? null;
}

export async function findBillingAccountRowByStripeSubscriptionId(stripeSubscriptionId: string) {
  const result = await query<BillingAccountRow>(
    `
      SELECT
        user_id,
        plan_key,
        next_billing_date,
        stripe_customer_id,
        stripe_subscription_id,
        stripe_price_id,
        stripe_status,
        stripe_current_period_end,
        created_at,
        updated_at
      FROM billing_accounts
      WHERE stripe_subscription_id = $1
      LIMIT 1
    `,
    [stripeSubscriptionId]
  );

  return result.rows[0] ?? null;
}

export async function findBillingPaymentMethodRow(userId: string) {
  const result = await query<BillingPaymentMethodRow>(
    `
      SELECT
        user_id,
        stripe_payment_method_id,
        brand,
        last4,
        exp_month,
        exp_year,
        holder_name,
        created_at,
        updated_at
      FROM billing_payment_methods
      WHERE user_id = $1
      LIMIT 1
    `,
    [userId]
  );

  return result.rows[0] ?? null;
}

export async function upsertBillingPaymentMethodRow(input: {
  userId: string;
  stripePaymentMethodId?: string | null;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  holderName: string;
}) {
  await query(
    `
      INSERT INTO billing_payment_methods (
        user_id,
        stripe_payment_method_id,
        brand,
        last4,
        exp_month,
        exp_year,
        holder_name,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      ON CONFLICT (user_id) DO UPDATE SET
        stripe_payment_method_id = EXCLUDED.stripe_payment_method_id,
        brand = EXCLUDED.brand,
        last4 = EXCLUDED.last4,
        exp_month = EXCLUDED.exp_month,
        exp_year = EXCLUDED.exp_year,
        holder_name = EXCLUDED.holder_name,
        updated_at = NOW()
    `,
    [
      input.userId,
      input.stripePaymentMethodId ?? null,
      input.brand,
      input.last4,
      input.expMonth,
      input.expYear,
      input.holderName
    ]
  );
}

export async function clearBillingPaymentMethodRow(userId: string) {
  await query(
    `
      DELETE FROM billing_payment_methods
      WHERE user_id = $1
    `,
    [userId]
  );
}

export async function listBillingInvoiceRows(userId: string, limit = 12) {
  const result = await query<BillingInvoiceRow>(
    `
      SELECT
        id,
        user_id,
        stripe_invoice_id,
        plan_key,
        description,
        amount_cents,
        currency,
        status,
        hosted_invoice_url,
        invoice_pdf_url,
        issued_at,
        paid_at,
        period_start,
        period_end,
        created_at
      FROM billing_invoices
      WHERE user_id = $1
      ORDER BY issued_at DESC, created_at DESC
      LIMIT $2
    `,
    [userId, limit]
  );

  return result.rows;
}

export async function insertBillingInvoiceRow(input: {
  id: string;
  userId: string;
  stripeInvoiceId?: string | null;
  planKey: "starter" | "pro";
  description: string;
  amountCents: number;
  currency: string;
  status: "paid" | "open";
  hostedInvoiceUrl?: string | null;
  invoicePdfUrl?: string | null;
  issuedAt: string;
  paidAt: string | null;
  periodStart: string | null;
  periodEnd: string | null;
}) {
  await query(
    `
      INSERT INTO billing_invoices (
        id,
        user_id,
        stripe_invoice_id,
        plan_key,
        description,
        amount_cents,
        currency,
        status,
        hosted_invoice_url,
        invoice_pdf_url,
        issued_at,
        paid_at,
        period_start,
        period_end,
        created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW())
      ON CONFLICT (id) DO UPDATE SET
        stripe_invoice_id = EXCLUDED.stripe_invoice_id,
        plan_key = EXCLUDED.plan_key,
        description = EXCLUDED.description,
        amount_cents = EXCLUDED.amount_cents,
        currency = EXCLUDED.currency,
        status = EXCLUDED.status,
        hosted_invoice_url = EXCLUDED.hosted_invoice_url,
        invoice_pdf_url = EXCLUDED.invoice_pdf_url,
        issued_at = EXCLUDED.issued_at,
        paid_at = EXCLUDED.paid_at,
        period_start = EXCLUDED.period_start,
        period_end = EXCLUDED.period_end
    `,
    [
      input.id,
      input.userId,
      input.stripeInvoiceId ?? null,
      input.planKey,
      input.description,
      input.amountCents,
      input.currency,
      input.status,
      input.hostedInvoiceUrl ?? null,
      input.invoicePdfUrl ?? null,
      input.issuedAt,
      input.paidAt,
      input.periodStart,
      input.periodEnd
    ]
  );
}
