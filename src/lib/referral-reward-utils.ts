import { randomUUID } from "node:crypto";
import type { DashboardReferralSummary } from "@/lib/referral-definitions";
import type {
  ReferralAttributionRow,
  ReferralProgramRow,
  ReferralRewardRow
} from "@/lib/repositories/referral-repository";

type InvoiceLike = {
  id: string;
  amount_cents: number | string;
  paid_at: string | null;
  issued_at: string;
};

type ReferralRewardMutation = Omit<ReferralRewardRow, "created_at" | "earned_at"> & {
  earned_at?: string | null;
};

export const REFERRAL_PROGRAM_TYPES = ["customer", "affiliate", "mutual"] as const satisfies ReadonlyArray<
  ReferralProgramRow["program_type"]
>;

export function rewardKindForProgramType(programType: ReferralProgramRow["program_type"]) {
  switch (programType) {
    case "affiliate":
      return "commission";
    case "customer":
      return "free_month";
    default:
      return "discount_credit";
  }
}

export function summarizeReferralRewards(
  rewards: ReferralRewardRow[]
): Pick<
  DashboardReferralSummary,
  "pendingRewardCount" | "earnedRewardCount" | "earnedFreeMonths" | "earnedDiscountCents" | "earnedCommissionCents"
> {
  const earnedRewards = rewards.filter((reward) => reward.status === "earned");

  return {
    pendingRewardCount: rewards.length - earnedRewards.length,
    earnedRewardCount: earnedRewards.length,
    earnedFreeMonths: earnedRewards.reduce((sum, reward) => sum + Number(reward.reward_months), 0),
    earnedDiscountCents: earnedRewards
      .filter((reward) => reward.reward_kind === "discount_credit")
      .reduce((sum, reward) => sum + Number(reward.reward_cents), 0),
    earnedCommissionCents: earnedRewards
      .filter((reward) => reward.reward_kind === "commission")
      .reduce((sum, reward) => sum + Number(reward.reward_cents), 0)
  };
}

function rewardSource(invoice?: InvoiceLike) {
  if (!invoice) {
    return {
      source_invoice_id: null,
      source_invoice_amount_cents: null,
      earned_at: null
    };
  }

  return {
    source_invoice_id: invoice.id,
    source_invoice_amount_cents: Number(invoice.amount_cents),
    earned_at: invoice.paid_at ?? invoice.issued_at
  };
}

export function buildReferralReward(input: {
  rewardKey: string;
  attribution: Pick<ReferralAttributionRow, "id" | "program_type" | "program_label">;
  beneficiaryUserId: string;
  rewardRole: ReferralRewardRow["reward_role"];
  rewardKind: ReferralRewardRow["reward_kind"];
  status: ReferralRewardRow["status"];
  description: string;
  rewardMonths: number;
  rewardCents: number;
  commissionBps: number;
  invoice?: InvoiceLike;
}): ReferralRewardMutation {
  return {
    id: randomUUID(),
    reward_key: input.rewardKey,
    attribution_id: input.attribution.id,
    beneficiary_user_id: input.beneficiaryUserId,
    program_type: input.attribution.program_type,
    program_label: input.attribution.program_label,
    reward_role: input.rewardRole,
    reward_kind: input.rewardKind,
    status: input.status,
    description: input.description,
    reward_months: input.rewardMonths,
    reward_cents: input.rewardCents,
    commission_bps: input.commissionBps,
    ...rewardSource(input.invoice)
  };
}
