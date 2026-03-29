type RewardValueInput = {
  rewardKind: "free_month" | "discount_credit" | "commission";
  rewardMonths: number;
  rewardCents: number;
  commissionBps: number;
};

type RewardLedgerInput = RewardValueInput & {
  sourceInvoiceAmountCents: number | null;
};

export function commissionRateLabel(commissionBps: number) {
  return `${commissionBps / 100}% recurring`;
}

export function formatCommission(commissionBps: number) {
  return `${commissionRateLabel(commissionBps)} commission`;
}

export function rewardValueLabel(reward: RewardValueInput, formatCurrency: (amountCents: number) => string) {
  if (reward.rewardKind === "free_month") {
    return `${reward.rewardMonths} free month${reward.rewardMonths === 1 ? "" : "s"}`;
  }

  if (reward.rewardKind === "commission" && reward.rewardCents <= 0) {
    return commissionRateLabel(reward.commissionBps);
  }

  return formatCurrency(reward.rewardCents);
}

export function rewardLedgerLabel(reward: RewardLedgerInput, formatCurrency: (amountCents: number) => string) {
  if (reward.rewardKind !== "commission") {
    return null;
  }

  if (reward.sourceInvoiceAmountCents == null) {
    return `${commissionRateLabel(reward.commissionBps)} on paid invoices once the referred workspace converts.`;
  }

  return `Tracked from a ${formatCurrency(reward.sourceInvoiceAmountCents)} paid invoice at ${commissionRateLabel(reward.commissionBps)}.`;
}
