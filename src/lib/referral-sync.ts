import { listBillingInvoiceRows } from "@/lib/repositories/billing-repository";
import {
  findReferralAttributionByReferredUserId,
  listReferralRewardsByAttributionId,
  markReferralAttributionConverted,
  upsertReferralReward
} from "@/lib/repositories/referral-repository";
import {
  commissionFromAmount,
  formatCommission,
  rewardDescription,
  rewardKey
} from "@/lib/referral-definitions";
import { buildReferralReward } from "@/lib/referral-reward-utils";

type PaidInvoice = Awaited<ReturnType<typeof listBillingInvoiceRows>>[number];
type ReferralAttribution = NonNullable<Awaited<ReturnType<typeof findReferralAttributionByReferredUserId>>>;

function toPaidInvoices(invoices: Awaited<ReturnType<typeof listBillingInvoiceRows>>) {
  return invoices
    .filter((invoice) => invoice.status === "paid" && Number(invoice.amount_cents) > 0)
    .sort((left, right) => new Date(left.issued_at).getTime() - new Date(right.issued_at).getTime());
}

async function upsertEarnedReward(input: {
  rewardKey: string;
  attribution: ReferralAttribution;
  beneficiaryUserId: string;
  rewardRole: "referrer" | "referred";
  rewardKind: "free_month" | "discount_credit" | "commission";
  description: string;
  rewardMonths: number;
  rewardCents: number;
  commissionBps: number;
  invoice: PaidInvoice;
}) {
  await upsertReferralReward(
    buildReferralReward({
      rewardKey: input.rewardKey,
      attribution: input.attribution,
      beneficiaryUserId: input.beneficiaryUserId,
      rewardRole: input.rewardRole,
      rewardKind: input.rewardKind,
      status: "earned",
      description: input.description,
      rewardMonths: input.rewardMonths,
      rewardCents: input.rewardCents,
      commissionBps: input.commissionBps,
      invoice: input.invoice
    })
  );
}

async function upsertAffiliateCommissionReward(input: {
  attribution: ReferralAttribution;
  rewardKey: string;
  description: string;
  commissionBps: number;
  invoice: PaidInvoice;
}) {
  await upsertEarnedReward({
    rewardKey: input.rewardKey,
    attribution: input.attribution,
    beneficiaryUserId: input.attribution.owner_user_id,
    rewardRole: "referrer",
    rewardKind: "commission",
    description: input.description,
    rewardMonths: 0,
    rewardCents: commissionFromAmount(Number(input.invoice.amount_cents), input.commissionBps),
    commissionBps: input.commissionBps,
    invoice: input.invoice
  });
}

export async function syncReferralRewardsForUser(userId: string) {
  const attribution = await findReferralAttributionByReferredUserId(userId);
  if (!attribution) {
    return;
  }

  const paidInvoices = toPaidInvoices(await listBillingInvoiceRows(userId, 24));
  if (!paidInvoices.length) {
    return;
  }

  const [firstPaidInvoice, ...remainingInvoices] = paidInvoices;
  const earnedAt = firstPaidInvoice.paid_at ?? firstPaidInvoice.issued_at;

  await markReferralAttributionConverted(attribution.id, earnedAt, firstPaidInvoice.id);

  if (attribution.program_type === "affiliate") {
    const commissionBps = Number(attribution.commission_bps);

    await upsertAffiliateCommissionReward({
      attribution,
      rewardKey: rewardKey(attribution.id, "signup-referrer"),
      description: rewardDescription(attribution, "referrer", true),
      commissionBps,
      invoice: firstPaidInvoice
    });

    for (const invoice of remainingInvoices) {
      await upsertAffiliateCommissionReward({
        attribution,
        rewardKey: rewardKey(attribution.id, `commission-${invoice.id}`),
        description: `Recurring affiliate commission earned at ${formatCommission(commissionBps)}.`,
        commissionBps,
        invoice
      });
    }

    return;
  }

  const rewards = await listReferralRewardsByAttributionId(attribution.id);

  for (const reward of rewards.filter((row) => row.status === "pending")) {
    await upsertEarnedReward({
      rewardKey: reward.reward_key,
      attribution,
      beneficiaryUserId: reward.beneficiary_user_id,
      rewardRole: reward.reward_role,
      rewardKind: reward.reward_kind,
      description: rewardDescription(attribution, reward.reward_role, true),
      rewardMonths: Number(reward.reward_months),
      rewardCents: Number(reward.reward_cents),
      commissionBps: Number(reward.commission_bps),
      invoice: firstPaidInvoice
    });
  }
}
