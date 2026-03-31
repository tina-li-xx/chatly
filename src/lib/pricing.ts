import {
  CHATTING_FREE_MONTHLY_TOTAL_CENTS,
  CHATTING_GROWTH_BASE_ANNUAL_TOTAL_CENTS,
  CHATTING_GROWTH_BASE_MONTHLY_TOTAL_CENTS,
  CHATTING_GROWTH_BASE_TEAM_LIMIT,
  CHATTING_GROWTH_CONTACT_TEAM_SIZE,
  formatUsdFromCents,
  getGrowthPerMemberCents,
  getGrowthTotalCentsBeforeContactSales,
  normalizeGrowthMemberCount,
  type ChattingPricingInterval
} from "@/lib/pricing-model";

export type { ChattingPricingInterval } from "@/lib/pricing-model";

export const CHATTING_VISIBLE_PRICING_PLAN_ORDER = ["starter", "growth"] as const;
export const CHATTING_STARTER_PRICE_LABEL = "$0/month";
export const CHATTING_STARTER_PLAN_LINE = "Starter: 50 conversations/month";
export const CHATTING_ANNUAL_SAVINGS_LABEL = "2 months free";
export { CHATTING_GROWTH_BASE_TEAM_LIMIT, CHATTING_GROWTH_CONTACT_TEAM_SIZE } from "@/lib/pricing-model";
export const CHATTING_GROWTH_TIER_BREAKPOINTS = [1, 4, 10, 25, 50] as const;
export const CHATTING_GROWTH_MONTHLY_PRICE = `${formatUsdFromCents(CHATTING_GROWTH_BASE_MONTHLY_TOTAL_CENTS)}/month`;
export const CHATTING_GROWTH_ANNUAL_PRICE = `${formatUsdFromCents(CHATTING_GROWTH_BASE_ANNUAL_TOTAL_CENTS)}/year`;
export const CHATTING_GROWTH_PLAN_LINE = `Growth: ${formatChattingGrowthPriceLabel("monthly")}`;
export const CHATTING_PAID_PLANS_COPY = `Growth is ${formatChattingGrowthPriceLabel("monthly")}`;

export function isGrowthContactSalesTeamSize(memberCount: number) {
  return normalizeGrowthMemberCount(memberCount) >= CHATTING_GROWTH_CONTACT_TEAM_SIZE;
}

export function getChattingGrowthTierLabel(memberCount: number) {
  const safeMemberCount = normalizeGrowthMemberCount(memberCount);

  if (safeMemberCount <= CHATTING_GROWTH_BASE_TEAM_LIMIT) {
    return "1-3 members";
  }

  if (safeMemberCount < 10) {
    return "4-9 members";
  }

  if (safeMemberCount < 25) {
    return "10-24 members";
  }

  if (safeMemberCount < CHATTING_GROWTH_CONTACT_TEAM_SIZE) {
    return "25-49 members";
  }

  return "50+ members";
}

export function formatChattingGrowthPriceLabel(interval: ChattingPricingInterval) {
  const firstTierPrice = formatUsdFromCents(getGrowthPerMemberCents(interval, 4) ?? 0);
  const secondTierPrice = formatUsdFromCents(getGrowthPerMemberCents(interval, 10) ?? 0);
  const thirdTierPrice = formatUsdFromCents(getGrowthPerMemberCents(interval, 25) ?? 0);

  return interval === "annual"
    ? `${CHATTING_GROWTH_ANNUAL_PRICE} for 1-3 members, then ${firstTierPrice}/member from 4-9, ${secondTierPrice}/member from 10-24, and ${thirdTierPrice}/member from 25-49`
    : `${CHATTING_GROWTH_MONTHLY_PRICE} for 1-3 members, then ${firstTierPrice}/member from 4-9, ${secondTierPrice}/member from 10-24, and ${thirdTierPrice}/member from 25-49`;
}

export function getChattingGrowthDisplayPrice(interval: ChattingPricingInterval) {
  const volumePrice = formatUsdFromCents(getGrowthPerMemberCents(interval, 4) ?? 0);

  return interval === "annual"
    ? {
        amount: formatUsdFromCents(CHATTING_GROWTH_BASE_ANNUAL_TOTAL_CENTS),
        cadence: "/year",
        note: `1-3 members, then volume pricing from ${volumePrice}/member/year`
      }
    : {
        amount: formatUsdFromCents(CHATTING_GROWTH_BASE_MONTHLY_TOTAL_CENTS),
        cadence: "/month",
        note: `1-3 members, then volume pricing from ${volumePrice}/member/month`
      };
}

export function getChattingStarterDisplayPrice() {
  return { amount: formatUsdFromCents(CHATTING_FREE_MONTHLY_TOTAL_CENTS), cadence: "/month", note: null };
}

export function getChattingGrowthTotalCents(interval: ChattingPricingInterval, memberCount: number) {
  const safeMemberCount = normalizeGrowthMemberCount(memberCount);

  if (isGrowthContactSalesTeamSize(safeMemberCount)) {
    return null;
  }

  return getGrowthTotalCentsBeforeContactSales(interval, safeMemberCount);
}

export function formatChattingGrowthTotalLabel(interval: ChattingPricingInterval, memberCount: number) {
  const safeMemberCount = normalizeGrowthMemberCount(memberCount);
  const cadence = interval === "annual" ? "/year" : "/month";
  const total = getChattingGrowthTotalCents(interval, safeMemberCount);

  if (total === null) {
    return "50+ members - Contact us";
  }

  return `${safeMemberCount} member${safeMemberCount === 1 ? "" : "s"} - ${formatUsdFromCents(total)}${cadence}`;
}

export function getChattingGrowthPricingSummary(interval: ChattingPricingInterval, memberCount: number) {
  const safeMemberCount = normalizeGrowthMemberCount(memberCount);
  const monthlyPerMemberCents = getGrowthPerMemberCents("monthly", safeMemberCount);
  const monthlyTotalCents = getChattingGrowthTotalCents("monthly", safeMemberCount);
  const totalCents = getChattingGrowthTotalCents(interval, safeMemberCount);

  return {
    memberCount: safeMemberCount,
    contactSales: isGrowthContactSalesTeamSize(safeMemberCount),
    memberLabel:
      safeMemberCount >= CHATTING_GROWTH_CONTACT_TEAM_SIZE
        ? "50+ team members"
        : `${safeMemberCount} team member${safeMemberCount === 1 ? "" : "s"}`,
    tierLabel: getChattingGrowthTierLabel(safeMemberCount),
    monthlyPerMemberCents,
    totalCents,
    monthlyTotalCents,
    annualSavingsCents: monthlyTotalCents === null ? null : monthlyTotalCents * 2
  };
}

export function getChattingPaidStartingPriceCopy() {
  return "Free, then $20/month for 1-3 members";
}

export function getChattingMonthlyDifferencePrice(memberCount: number, competitorMonthlyCents: number) {
  const growthMonthlyTotalCents = getChattingGrowthTotalCents("monthly", memberCount);
  const differenceCents = Math.max(0, competitorMonthlyCents - (growthMonthlyTotalCents ?? 0));
  return `${formatUsdFromCents(differenceCents)}/month`;
}
