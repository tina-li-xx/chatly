import type { Pool } from "pg";

export async function runReferralSchemaInitialization(pool: Pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS referral_programs (
      id TEXT PRIMARY KEY,
      owner_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      code TEXT NOT NULL UNIQUE,
      program_type TEXT NOT NULL CHECK (program_type IN ('customer', 'affiliate', 'mutual')),
      label TEXT NOT NULL,
      referrer_reward_months INTEGER NOT NULL DEFAULT 0,
      referrer_reward_cents INTEGER NOT NULL DEFAULT 0,
      referred_reward_cents INTEGER NOT NULL DEFAULT 0,
      commission_bps INTEGER NOT NULL DEFAULT 0,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS referral_programs_owner_type_key
    ON referral_programs (owner_user_id, program_type);
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS referral_programs_owner_created_idx
    ON referral_programs (owner_user_id, created_at DESC);
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS referral_attributions (
      id TEXT PRIMARY KEY,
      program_id TEXT NOT NULL REFERENCES referral_programs(id) ON DELETE CASCADE,
      owner_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      referred_user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      referred_email TEXT NOT NULL,
      code TEXT NOT NULL,
      program_type TEXT NOT NULL CHECK (program_type IN ('customer', 'affiliate', 'mutual')),
      program_label TEXT NOT NULL,
      referrer_reward_months INTEGER NOT NULL DEFAULT 0,
      referrer_reward_cents INTEGER NOT NULL DEFAULT 0,
      referred_reward_cents INTEGER NOT NULL DEFAULT 0,
      commission_bps INTEGER NOT NULL DEFAULT 0,
      converted_to_paid_at TIMESTAMPTZ,
      first_paid_invoice_id TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS referral_attributions_owner_created_idx
    ON referral_attributions (owner_user_id, created_at DESC);
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS referral_attributions_referred_idx
    ON referral_attributions (referred_user_id);
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS referral_rewards (
      id TEXT PRIMARY KEY,
      reward_key TEXT NOT NULL UNIQUE,
      attribution_id TEXT NOT NULL REFERENCES referral_attributions(id) ON DELETE CASCADE,
      beneficiary_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      program_type TEXT NOT NULL CHECK (program_type IN ('customer', 'affiliate', 'mutual')),
      program_label TEXT NOT NULL,
      reward_role TEXT NOT NULL CHECK (reward_role IN ('referrer', 'referred')),
      reward_kind TEXT NOT NULL CHECK (reward_kind IN ('free_month', 'discount_credit', 'commission')),
      status TEXT NOT NULL CHECK (status IN ('pending', 'earned')),
      description TEXT NOT NULL,
      reward_months INTEGER NOT NULL DEFAULT 0,
      reward_cents INTEGER NOT NULL DEFAULT 0,
      commission_bps INTEGER NOT NULL DEFAULT 0,
      source_invoice_id TEXT,
      source_invoice_amount_cents INTEGER,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      earned_at TIMESTAMPTZ
    );
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS referral_rewards_beneficiary_created_idx
    ON referral_rewards (beneficiary_user_id, created_at DESC);
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS referral_rewards_attribution_created_idx
    ON referral_rewards (attribution_id, created_at DESC);
  `);
}
