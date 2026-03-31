import type { Pool } from "pg";

export async function runBillingSchemaInitialization(pool: Pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS billing_accounts (
      user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      plan_key TEXT NOT NULL DEFAULT 'starter',
      billing_interval TEXT NOT NULL DEFAULT 'monthly',
      seat_quantity INTEGER NOT NULL DEFAULT 1,
      next_billing_date TIMESTAMPTZ,
      stripe_customer_id TEXT UNIQUE,
      stripe_subscription_id TEXT UNIQUE,
      stripe_price_id TEXT,
      stripe_status TEXT,
      stripe_current_period_end TIMESTAMPTZ,
      trial_started_at TIMESTAMPTZ,
      trial_ends_at TIMESTAMPTZ,
      trial_extension_used_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    ALTER TABLE billing_accounts
    ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE;
  `);

  await pool.query(`
    ALTER TABLE billing_accounts
    ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT UNIQUE;
  `);

  await pool.query(`
    ALTER TABLE billing_accounts
    ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;
  `);

  await pool.query(`
    ALTER TABLE billing_accounts
    ADD COLUMN IF NOT EXISTS stripe_status TEXT;
  `);

  await pool.query(`
    ALTER TABLE billing_accounts
    ADD COLUMN IF NOT EXISTS stripe_current_period_end TIMESTAMPTZ;
  `);

  await pool.query(`
    ALTER TABLE billing_accounts
    ADD COLUMN IF NOT EXISTS billing_interval TEXT NOT NULL DEFAULT 'monthly';
  `);

  await pool.query(`
    ALTER TABLE billing_accounts
    ADD COLUMN IF NOT EXISTS seat_quantity INTEGER NOT NULL DEFAULT 1;
  `);

  await pool.query(`
    ALTER TABLE billing_accounts
    ADD COLUMN IF NOT EXISTS trial_started_at TIMESTAMPTZ;
  `);

  await pool.query(`
    ALTER TABLE billing_accounts
    ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ;
  `);

  await pool.query(`
    ALTER TABLE billing_accounts
    ADD COLUMN IF NOT EXISTS trial_extension_used_at TIMESTAMPTZ;
  `);

  await pool.query(`
    UPDATE billing_accounts
    SET plan_key = 'growth'
    WHERE plan_key = 'pro';
  `);

  await pool.query(`
    ALTER TABLE billing_accounts
    DROP CONSTRAINT IF EXISTS billing_accounts_plan_key_check;
  `);

  await pool.query(`
    ALTER TABLE billing_accounts
    ADD CONSTRAINT billing_accounts_plan_key_check
    CHECK (plan_key IN ('starter', 'growth'));
  `);

  await pool.query(`
    ALTER TABLE billing_accounts
    DROP CONSTRAINT IF EXISTS billing_accounts_billing_interval_check;
  `);

  await pool.query(`
    ALTER TABLE billing_accounts
    ADD CONSTRAINT billing_accounts_billing_interval_check
    CHECK (billing_interval IN ('monthly', 'annual'));
  `);

  await pool.query(`
    ALTER TABLE billing_accounts
    DROP CONSTRAINT IF EXISTS billing_accounts_seat_quantity_check;
  `);

  await pool.query(`
    ALTER TABLE billing_accounts
    ADD CONSTRAINT billing_accounts_seat_quantity_check
    CHECK (seat_quantity >= 1);
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS billing_payment_methods (
      user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      stripe_payment_method_id TEXT UNIQUE,
      brand TEXT NOT NULL,
      last4 TEXT NOT NULL,
      exp_month INTEGER NOT NULL,
      exp_year INTEGER NOT NULL,
      holder_name TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    ALTER TABLE billing_payment_methods
    ADD COLUMN IF NOT EXISTS stripe_payment_method_id TEXT UNIQUE;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS billing_invoices (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      stripe_invoice_id TEXT UNIQUE,
      plan_key TEXT NOT NULL,
      billing_interval TEXT,
      seat_quantity INTEGER,
      description TEXT NOT NULL,
      amount_cents INTEGER NOT NULL,
      currency TEXT NOT NULL DEFAULT 'USD',
      status TEXT NOT NULL DEFAULT 'paid',
      hosted_invoice_url TEXT,
      invoice_pdf_url TEXT,
      issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      paid_at TIMESTAMPTZ,
      period_start TIMESTAMPTZ,
      period_end TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    ALTER TABLE billing_invoices
    ADD COLUMN IF NOT EXISTS stripe_invoice_id TEXT UNIQUE;
  `);

  await pool.query(`
    ALTER TABLE billing_invoices
    ADD COLUMN IF NOT EXISTS hosted_invoice_url TEXT;
  `);

  await pool.query(`
    ALTER TABLE billing_invoices
    ADD COLUMN IF NOT EXISTS invoice_pdf_url TEXT;
  `);

  await pool.query(`
    ALTER TABLE billing_invoices
    ADD COLUMN IF NOT EXISTS billing_interval TEXT;
  `);

  await pool.query(`
    ALTER TABLE billing_invoices
    ADD COLUMN IF NOT EXISTS seat_quantity INTEGER;
  `);

  await pool.query(`
    UPDATE billing_invoices
    SET plan_key = 'growth'
    WHERE plan_key = 'pro';
  `);

  await pool.query(`
    ALTER TABLE billing_invoices
    DROP CONSTRAINT IF EXISTS billing_invoices_plan_key_check;
  `);

  await pool.query(`
    ALTER TABLE billing_invoices
    ADD CONSTRAINT billing_invoices_plan_key_check
    CHECK (plan_key IN ('starter', 'growth'));
  `);

  await pool.query(`
    ALTER TABLE billing_invoices
    DROP CONSTRAINT IF EXISTS billing_invoices_billing_interval_check;
  `);

  await pool.query(`
    ALTER TABLE billing_invoices
    ADD CONSTRAINT billing_invoices_billing_interval_check
    CHECK (billing_interval IS NULL OR billing_interval IN ('monthly', 'annual'));
  `);

  await pool.query(`
    ALTER TABLE billing_invoices
    DROP CONSTRAINT IF EXISTS billing_invoices_status_check;
  `);

  await pool.query(`
    ALTER TABLE billing_invoices
    ADD CONSTRAINT billing_invoices_status_check
    CHECK (status IN ('paid', 'open'));
  `);
}
