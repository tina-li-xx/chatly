import { query } from "@/lib/db";

const PROGRAM_COLUMNS =
  "id, owner_user_id, code, program_type, label, referrer_reward_months, referrer_reward_cents, referred_reward_cents, commission_bps, is_active, created_at, updated_at";
const ATTRIBUTION_COLUMNS =
  "id, program_id, owner_user_id, referred_user_id, referred_email, code, program_type, program_label, referrer_reward_months, referrer_reward_cents, referred_reward_cents, commission_bps, converted_to_paid_at, first_paid_invoice_id, created_at, updated_at";
const REWARD_COLUMNS =
  "id, reward_key, attribution_id, beneficiary_user_id, program_type, program_label, reward_role, reward_kind, status, description, reward_months, reward_cents, commission_bps, source_invoice_id, source_invoice_amount_cents, created_at, earned_at";

export type ReferralProgramRow = {
  id: string;
  owner_user_id: string;
  code: string;
  program_type: "customer" | "affiliate" | "mutual";
  label: string;
  referrer_reward_months: number;
  referrer_reward_cents: number;
  referred_reward_cents: number;
  commission_bps: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ReferralAttributionRow = {
  id: string;
  program_id: string;
  owner_user_id: string;
  referred_user_id: string;
  referred_email: string;
  code: string;
  program_type: "customer" | "affiliate" | "mutual";
  program_label: string;
  referrer_reward_months: number;
  referrer_reward_cents: number;
  referred_reward_cents: number;
  commission_bps: number;
  converted_to_paid_at: string | null;
  first_paid_invoice_id: string | null;
  created_at: string;
  updated_at: string;
};

export type ReferralRewardRow = {
  id: string;
  reward_key: string;
  attribution_id: string;
  beneficiary_user_id: string;
  program_type: "customer" | "affiliate" | "mutual";
  program_label: string;
  reward_role: "referrer" | "referred";
  reward_kind: "free_month" | "discount_credit" | "commission";
  status: "pending" | "earned";
  description: string;
  reward_months: number;
  reward_cents: number;
  commission_bps: number;
  source_invoice_id: string | null;
  source_invoice_amount_cents: number | null;
  created_at: string;
  earned_at: string | null;
};

export async function listReferralProgramsByOwnerUserId(ownerUserId: string) {
  const result = await query<ReferralProgramRow>(
    `SELECT ${PROGRAM_COLUMNS} FROM referral_programs WHERE owner_user_id = $1 ORDER BY CASE program_type WHEN 'customer' THEN 1 WHEN 'affiliate' THEN 2 ELSE 3 END`,
    [ownerUserId]
  );
  return result.rows;
}

export async function insertReferralProgram(input: Omit<ReferralProgramRow, "created_at" | "updated_at">) {
  const result = await query<ReferralProgramRow>(
    `INSERT INTO referral_programs (id, owner_user_id, code, program_type, label, referrer_reward_months, referrer_reward_cents, referred_reward_cents, commission_bps, is_active)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     ON CONFLICT (owner_user_id, program_type) DO NOTHING
     RETURNING ${PROGRAM_COLUMNS}`,
    [
      input.id,
      input.owner_user_id,
      input.code,
      input.program_type,
      input.label,
      input.referrer_reward_months,
      input.referrer_reward_cents,
      input.referred_reward_cents,
      input.commission_bps,
      input.is_active
    ]
  );
  return result.rows[0] ?? null;
}

export async function findReferralProgramByCode(code: string) {
  const result = await query<ReferralProgramRow>(
    `SELECT ${PROGRAM_COLUMNS} FROM referral_programs WHERE code = $1 LIMIT 1`,
    [code]
  );
  return result.rows[0] ?? null;
}

export async function insertReferralAttribution(input: Omit<ReferralAttributionRow, "created_at" | "updated_at" | "converted_to_paid_at" | "first_paid_invoice_id">) {
  const result = await query<ReferralAttributionRow>(
    `INSERT INTO referral_attributions (id, program_id, owner_user_id, referred_user_id, referred_email, code, program_type, program_label, referrer_reward_months, referrer_reward_cents, referred_reward_cents, commission_bps)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
     RETURNING ${ATTRIBUTION_COLUMNS}`,
    [
      input.id,
      input.program_id,
      input.owner_user_id,
      input.referred_user_id,
      input.referred_email,
      input.code,
      input.program_type,
      input.program_label,
      input.referrer_reward_months,
      input.referrer_reward_cents,
      input.referred_reward_cents,
      input.commission_bps
    ]
  );
  return result.rows[0] ?? null;
}

export async function findReferralAttributionByReferredUserId(referredUserId: string) {
  const result = await query<ReferralAttributionRow>(
    `SELECT ${ATTRIBUTION_COLUMNS} FROM referral_attributions WHERE referred_user_id = $1 LIMIT 1`,
    [referredUserId]
  );
  return result.rows[0] ?? null;
}

export async function markReferralAttributionConverted(attributionId: string, convertedAt: string, firstPaidInvoiceId: string) {
  await query(
    `UPDATE referral_attributions
     SET converted_to_paid_at = COALESCE(converted_to_paid_at, $2), first_paid_invoice_id = COALESCE(first_paid_invoice_id, $3), updated_at = NOW()
     WHERE id = $1`,
    [attributionId, convertedAt, firstPaidInvoiceId]
  );
}

export async function listReferralAttributionsByOwnerUserId(ownerUserId: string, limit = 12) {
  const result = await query<ReferralAttributionRow>(
    `SELECT ${ATTRIBUTION_COLUMNS} FROM referral_attributions WHERE owner_user_id = $1 ORDER BY created_at DESC LIMIT $2`,
    [ownerUserId, limit]
  );
  return result.rows;
}

export async function upsertReferralReward(input: Omit<ReferralRewardRow, "created_at" | "earned_at"> & { earned_at?: string | null }) {
  const result = await query<ReferralRewardRow>(
    `INSERT INTO referral_rewards (id, reward_key, attribution_id, beneficiary_user_id, program_type, program_label, reward_role, reward_kind, status, description, reward_months, reward_cents, commission_bps, source_invoice_id, source_invoice_amount_cents, earned_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
     ON CONFLICT (reward_key) DO UPDATE SET
       status = EXCLUDED.status,
       description = EXCLUDED.description,
       reward_months = EXCLUDED.reward_months,
       reward_cents = EXCLUDED.reward_cents,
       commission_bps = EXCLUDED.commission_bps,
       source_invoice_id = COALESCE(EXCLUDED.source_invoice_id, referral_rewards.source_invoice_id),
       source_invoice_amount_cents = COALESCE(EXCLUDED.source_invoice_amount_cents, referral_rewards.source_invoice_amount_cents),
       earned_at = COALESCE(EXCLUDED.earned_at, referral_rewards.earned_at)
     RETURNING ${REWARD_COLUMNS}`,
    [
      input.id,
      input.reward_key,
      input.attribution_id,
      input.beneficiary_user_id,
      input.program_type,
      input.program_label,
      input.reward_role,
      input.reward_kind,
      input.status,
      input.description,
      input.reward_months,
      input.reward_cents,
      input.commission_bps,
      input.source_invoice_id,
      input.source_invoice_amount_cents,
      input.earned_at ?? null
    ]
  );
  return result.rows[0] ?? null;
}

export async function listReferralRewardsByBeneficiaryUserId(userId: string, limit = 20) {
  const result = await query<ReferralRewardRow>(
    `SELECT ${REWARD_COLUMNS} FROM referral_rewards WHERE beneficiary_user_id = $1 ORDER BY COALESCE(earned_at, created_at) DESC, created_at DESC LIMIT $2`,
    [userId, limit]
  );
  return result.rows;
}

export async function listReferralRewardsByAttributionId(attributionId: string) {
  const result = await query<ReferralRewardRow>(
    `SELECT ${REWARD_COLUMNS} FROM referral_rewards WHERE attribution_id = $1 ORDER BY created_at ASC`,
    [attributionId]
  );
  return result.rows;
}
