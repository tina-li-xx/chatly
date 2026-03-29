import { randomBytes, randomUUID } from "node:crypto";
import {
  findReferralAttributionByReferredUserId,
  findReferralProgramByCode,
  insertReferralAttribution,
  insertReferralProgram,
  listReferralAttributionsByOwnerUserId,
  listReferralProgramsByOwnerUserId,
  listReferralRewardsByBeneficiaryUserId,
  upsertReferralReward,
  type ReferralProgramRow
} from "@/lib/repositories/referral-repository";
import {
  DEFAULT_REFERRAL_PROGRAMS,
  normalizeAttributionRows,
  normalizeProgramRows,
  normalizeReferralCode,
  normalizeRewardRows,
  rewardDescription,
  rewardKey,
  type DashboardReferralSummary
} from "@/lib/referral-definitions";
import {
  buildReferralReward,
  REFERRAL_PROGRAM_TYPES,
  rewardKindForProgramType,
  summarizeReferralRewards
} from "@/lib/referral-reward-utils";
export type { DashboardReferralAttribution, DashboardReferralProgram, DashboardReferralReward, DashboardReferralSummary } from "@/lib/referral-definitions";
export { normalizeReferralCode } from "@/lib/referral-definitions";
export { syncReferralRewardsForUser } from "@/lib/referral-sync";

type RewardNumbers = ReturnType<typeof rewardNumbers>;
type RewardAttribution = Parameters<typeof buildReferralReward>[0]["attribution"];

function rewardNumbers(
  program: Pick<ReferralProgramRow, "referrer_reward_months" | "referrer_reward_cents" | "referred_reward_cents" | "commission_bps">
) {
  return {
    referrerRewardMonths: Number(program.referrer_reward_months),
    referrerRewardCents: Number(program.referrer_reward_cents),
    referredRewardCents: Number(program.referred_reward_cents),
    commissionBps: Number(program.commission_bps)
  };
}

async function upsertPendingSignupReward(input: {
  rewardKey: string;
  attribution: RewardAttribution;
  beneficiaryUserId: string;
  rewardRole: "referrer" | "referred";
  rewardKind: "free_month" | "discount_credit" | "commission";
  description: string;
  rewardMonths: number;
  rewardCents: number;
  commissionBps: number;
}) {
  await upsertReferralReward(
    buildReferralReward({
      rewardKey: input.rewardKey,
      attribution: input.attribution,
      beneficiaryUserId: input.beneficiaryUserId,
      rewardRole: input.rewardRole,
      rewardKind: input.rewardKind,
      status: "pending",
      description: input.description,
      rewardMonths: input.rewardMonths,
      rewardCents: input.rewardCents,
      commissionBps: input.commissionBps
    })
  );
}

async function createMissingProgram(ownerUserId: string, type: ReferralProgramRow["program_type"]) {
  const config = DEFAULT_REFERRAL_PROGRAMS[type];

  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      await insertReferralProgram({
        id: randomUUID(),
        owner_user_id: ownerUserId,
        code: `${config.prefix}-${randomBytes(3).toString("hex").toUpperCase()}`,
        program_type: type,
        label: config.label,
        referrer_reward_months: config.referrer_reward_months,
        referrer_reward_cents: config.referrer_reward_cents,
        referred_reward_cents: config.referred_reward_cents,
        commission_bps: config.commission_bps,
        is_active: true
      });
      return;
    } catch (error) {
      if (error instanceof Error && error.message.includes("referral_programs_code_key")) continue;
      throw error;
    }
  }
  throw new Error("REFERRAL_CODE_GENERATION_FAILED");
}

export async function ensureDefaultReferralPrograms(userId: string) {
  const existing = await listReferralProgramsByOwnerUserId(userId);
  const seen = new Set(existing.map((program) => program.program_type));
  let missingProgram = false;

  for (const type of REFERRAL_PROGRAM_TYPES) {
    if (!seen.has(type)) {
      missingProgram = true;
      await createMissingProgram(userId, type);
    }
  }
  return missingProgram ? listReferralProgramsByOwnerUserId(userId) : existing;
}

export async function getDashboardReferralSummary(userId: string): Promise<DashboardReferralSummary> {
  const [programs, attributedSignups, rewards] = await Promise.all([
    ensureDefaultReferralPrograms(userId),
    listReferralAttributionsByOwnerUserId(userId),
    listReferralRewardsByBeneficiaryUserId(userId)
  ]);
  return {
    programs: normalizeProgramRows(programs),
    attributedSignups: normalizeAttributionRows(attributedSignups),
    rewards: normalizeRewardRows(rewards),
    ...summarizeReferralRewards(rewards)
  };
}

export async function validateReferralCodeForSignup(referralCode?: string | null) {
  const code = normalizeReferralCode(referralCode);
  if (!code) return null;
  const program = await findReferralProgramByCode(code);
  if (!program || !program.is_active) throw new Error("INVALID_REFERRAL_CODE");
  return program;
}

export async function applyReferralCodeForSignup(input: { userId: string; email: string; referralCode?: string | null }) {
  const program = await validateReferralCodeForSignup(input.referralCode);
  if (!program) return null;
  if (program.owner_user_id === input.userId) throw new Error("SELF_REFERRAL");

  const numbers = rewardNumbers(program);
  const attribution =
    (await findReferralAttributionByReferredUserId(input.userId)) ??
    (await insertReferralAttribution({
      id: randomUUID(),
      program_id: program.id,
      owner_user_id: program.owner_user_id,
      referred_user_id: input.userId,
      referred_email: input.email,
      code: program.code,
      program_type: program.program_type,
      program_label: program.label,
      referrer_reward_months: numbers.referrerRewardMonths,
      referrer_reward_cents: numbers.referrerRewardCents,
      referred_reward_cents: numbers.referredRewardCents,
      commission_bps: numbers.commissionBps
    }));
  if (!attribution) return null;

  await upsertPendingSignupReward({
    rewardKey: rewardKey(attribution.id, "signup-referrer"),
    attribution,
    beneficiaryUserId: program.owner_user_id,
    rewardRole: "referrer",
    rewardKind: rewardKindForProgramType(program.program_type),
    description: rewardDescription(attribution, "referrer"),
    rewardMonths: numbers.referrerRewardMonths,
    rewardCents: numbers.referrerRewardCents,
    commissionBps: numbers.commissionBps
  });

  if (program.program_type === "mutual") {
    await upsertPendingSignupReward({
      rewardKey: rewardKey(attribution.id, "signup-referred"),
      attribution,
      beneficiaryUserId: input.userId,
      rewardRole: "referred",
      rewardKind: "discount_credit",
      description: rewardDescription(attribution, "referred"),
      rewardMonths: 0,
      rewardCents: numbers.referredRewardCents,
      commissionBps: 0
    });
  }
  return attribution;
}
