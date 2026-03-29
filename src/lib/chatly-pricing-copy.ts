import {
  CHATLY_GROWTH_MONTHLY_PRICE,
  CHATLY_STARTER_PLAN_LINE,
  CHATLY_STARTER_PRICE_LABEL
} from "@/lib/pricing";

export { CHATLY_GROWTH_MONTHLY_PRICE, CHATLY_STARTER_PLAN_LINE, CHATLY_STARTER_PRICE_LABEL };

export const CHATLY_PRO_MONTHLY_PRICE = "$79/month";
export const CHATLY_GROWTH_PLAN_LINE = `Growth: ${CHATLY_GROWTH_MONTHLY_PRICE}`;
export const CHATLY_PRO_PLAN_LINE = `Pro: ${CHATLY_PRO_MONTHLY_PRICE}`;

export function getChatlyPaidStartingPriceCopy() {
  return `Free - from ${CHATLY_GROWTH_MONTHLY_PRICE}`;
}

export function getChatlyMonthlyDifferencePrice(
  planOrMemberCount: string | number,
  memberCountOrCompetitorMonthlyCents: number,
  competitorMonthlyCents?: number
) {
  const memberCount = typeof planOrMemberCount === "number" ? planOrMemberCount : memberCountOrCompetitorMonthlyCents;
  const competitorMonthlyPrice = typeof planOrMemberCount === "number"
    ? memberCountOrCompetitorMonthlyCents
    : competitorMonthlyCents ?? 0;
  const chattingMonthlyPrice = memberCount <= 5 ? 2_900 : 2_900 + (memberCount - 5) * 1_000;
  const differenceCents = Math.max(0, competitorMonthlyPrice - chattingMonthlyPrice);
  return `$${Math.round(differenceCents / 100)}/month`;
}
