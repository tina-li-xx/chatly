import { formatCommission } from "@/lib/referral-display";
import { referralShareUrl } from "@/lib/referral-links";
import type { ReferralAttributionRow, ReferralProgramRow, ReferralRewardRow } from "@/lib/repositories/referral-repository";

export { formatCommission } from "@/lib/referral-display";
export { referralShareUrl } from "@/lib/referral-links";

export type DashboardReferralProgram = {
  id: string;
  code: string;
  label: string;
  programType: "customer" | "affiliate" | "mutual";
  incentiveLabel: string;
  description: string;
  shareUrl: string;
};

export type DashboardReferralAttribution = {
  id: string;
  referredEmail: string;
  programLabel: string;
  programType: "customer" | "affiliate" | "mutual";
  status: "pending" | "converted";
  createdAt: string;
  convertedAt: string | null;
};

export type DashboardReferralReward = {
  id: string;
  programLabel: string;
  programType: "customer" | "affiliate" | "mutual";
  rewardRole: "referrer" | "referred";
  rewardKind: "free_month" | "discount_credit" | "commission";
  status: "pending" | "earned";
  description: string;
  rewardMonths: number;
  rewardCents: number;
  commissionBps: number;
  sourceInvoiceId: string | null;
  sourceInvoiceAmountCents: number | null;
  createdAt: string;
  earnedAt: string | null;
};

export type DashboardReferralSummary = {
  programs: DashboardReferralProgram[];
  attributedSignups: DashboardReferralAttribution[];
  rewards: DashboardReferralReward[];
  pendingRewardCount: number;
  earnedRewardCount: number;
  earnedFreeMonths: number;
  earnedDiscountCents: number;
  earnedCommissionCents: number;
};

export const DEFAULT_REFERRAL_PROGRAMS: Record<
  ReferralProgramRow["program_type"],
  Omit<ReferralProgramRow, "id" | "owner_user_id" | "code" | "is_active" | "created_at" | "updated_at"> & {
    prefix: string;
    description: string;
  }
> = {
  customer: {
    prefix: "REF",
    label: "Customer referrals",
    referrer_reward_months: 1,
    referrer_reward_cents: 0,
    referred_reward_cents: 0,
    commission_bps: 0,
    program_type: "customer",
    description: "Give one free month when a referred signup becomes a paid workspace."
  },
  affiliate: {
    prefix: "AFF",
    label: "Affiliate program",
    referrer_reward_months: 0,
    referrer_reward_cents: 0,
    referred_reward_cents: 0,
    commission_bps: 2500,
    program_type: "affiliate",
    description: "Earn a recurring 25% commission on paid invoices from referred workspaces."
  },
  mutual: {
    prefix: "GIVE",
    label: "Give $10, get $10",
    referrer_reward_months: 0,
    referrer_reward_cents: 1000,
    referred_reward_cents: 1000,
    commission_bps: 0,
    program_type: "mutual",
    description: "Unlock a $10 credit for both sides after the referred workspace becomes paid."
  }
};

export function rewardKey(attributionId: string, suffix: string) {
  return `${attributionId}:${suffix}`;
}

export function incentiveLabel(
  program: Pick<
    ReferralProgramRow,
    "program_type" | "referrer_reward_months" | "referrer_reward_cents" | "referred_reward_cents" | "commission_bps"
  >
) {
  if (program.program_type === "customer") {
    return `${program.referrer_reward_months} free month${program.referrer_reward_months === 1 ? "" : "s"}`;
  }

  if (program.program_type === "affiliate") {
    return formatCommission(program.commission_bps);
  }

  return `$${program.referrer_reward_cents / 100} for you and $${program.referred_reward_cents / 100} for them`;
}

export function rewardDescription(
  row: ReferralAttributionRow,
  role: ReferralRewardRow["reward_role"],
  earned = false
) {
  if (row.program_type === "customer") {
    return earned ? "Free month earned after first paid conversion." : "Pending free month after first paid conversion.";
  }

  if (row.program_type === "affiliate") {
    return earned
      ? `Affiliate commission earned on the first paid invoice at ${formatCommission(row.commission_bps)}.`
      : `Pending affiliate commission until the first paid invoice lands at ${formatCommission(row.commission_bps)}.`;
  }

  return role === "referrer"
    ? earned
      ? "Referral credit earned after the referred workspace became paid."
      : "Pending $10 referral credit after the referred workspace becomes paid."
    : earned
      ? "Welcome credit earned after your workspace became paid."
      : "Pending $10 welcome credit after your workspace becomes paid.";
}

export function commissionFromAmount(amountCents: number, commissionBps: number) {
  return Math.round((amountCents * commissionBps) / 10000);
}

export function normalizeProgramRows(rows: ReferralProgramRow[]): DashboardReferralProgram[] {
  return rows.map((row) => ({
    id: row.id,
    code: row.code,
    label: row.label,
    programType: row.program_type,
    incentiveLabel: incentiveLabel(row),
    description: DEFAULT_REFERRAL_PROGRAMS[row.program_type].description,
    shareUrl: referralShareUrl(row.code)
  }));
}

export function normalizeAttributionRows(rows: ReferralAttributionRow[]): DashboardReferralAttribution[] {
  return rows.map((row) => ({
    id: row.id,
    referredEmail: row.referred_email,
    programLabel: row.program_label,
    programType: row.program_type,
    status: row.converted_to_paid_at ? "converted" : "pending",
    createdAt: row.created_at,
    convertedAt: row.converted_to_paid_at
  }));
}

export function normalizeRewardRows(rows: ReferralRewardRow[]): DashboardReferralReward[] {
  return rows.map((row) => ({
    id: row.id,
    programLabel: row.program_label,
    programType: row.program_type,
    rewardRole: row.reward_role,
    rewardKind: row.reward_kind,
    status: row.status,
    description: row.description,
    rewardMonths: Number(row.reward_months),
    rewardCents: Number(row.reward_cents),
    commissionBps: Number(row.commission_bps),
    sourceInvoiceId: row.source_invoice_id,
    sourceInvoiceAmountCents: row.source_invoice_amount_cents == null ? null : Number(row.source_invoice_amount_cents),
    createdAt: row.created_at,
    earnedAt: row.earned_at
  }));
}

export function normalizeReferralCode(value: string | null | undefined) {
  return (value ?? "").trim().toUpperCase().replace(/[^A-Z0-9-]/g, "");
}
