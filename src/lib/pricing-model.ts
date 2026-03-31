import growthPricingConfig from "@/lib/growth-pricing-config.json";

export type ChattingPricingInterval = "monthly" | "annual";
export type ChattingGrowthStripePriceTier = {
  upTo: number | "inf";
  flatAmountCents: number | null;
  unitAmountCents: number | null;
};
type ChattingGrowthMemberPriceTier = {
  min: number;
  max: number;
  monthlyPerMemberCents: number;
};

export const CHATTING_FREE_MONTHLY_TOTAL_CENTS = growthPricingConfig.freeMonthlyTotalCents;
export const CHATTING_GROWTH_BASE_TEAM_LIMIT = growthPricingConfig.growthBaseTeamLimit;
export const CHATTING_GROWTH_CONTACT_TEAM_SIZE = growthPricingConfig.growthContactTeamSize;
export const CHATTING_GROWTH_BASE_MONTHLY_TOTAL_CENTS = growthPricingConfig.growthBaseMonthlyTotalCents;
const CHATTING_GROWTH_ANNUAL_BILLING_MULTIPLIER = growthPricingConfig.growthAnnualBillingMultiplier;
export const CHATTING_GROWTH_BASE_ANNUAL_TOTAL_CENTS =
  CHATTING_GROWTH_BASE_MONTHLY_TOTAL_CENTS * CHATTING_GROWTH_ANNUAL_BILLING_MULTIPLIER;
export const CHATTING_GROWTH_MEMBER_PRICE_TIERS =
  growthPricingConfig.growthMemberPriceTiers as readonly ChattingGrowthMemberPriceTier[];
const LAST_GROWTH_MEMBER_PRICE_TIER = CHATTING_GROWTH_MEMBER_PRICE_TIERS.at(-1) ?? null;

export function formatUsdFromCents(value: number, maximumFractionDigits = 0) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: maximumFractionDigits === 0 ? 0 : 2,
    maximumFractionDigits
  }).format(value / 100);
}

export function normalizeGrowthMemberCount(value: number) {
  return Math.max(1, Math.floor(value || 1));
}

function getGrowthBillingMultiplier(interval: ChattingPricingInterval) {
  return interval === "annual" ? CHATTING_GROWTH_ANNUAL_BILLING_MULTIPLIER : 1;
}

function getGrowthBaseTotalCents(interval: ChattingPricingInterval) {
  return CHATTING_GROWTH_BASE_MONTHLY_TOTAL_CENTS * getGrowthBillingMultiplier(interval);
}

function getGrowthTierUnitAmountCents(
  interval: ChattingPricingInterval,
  tier: ChattingGrowthMemberPriceTier | null
) {
  return tier ? tier.monthlyPerMemberCents * getGrowthBillingMultiplier(interval) : null;
}

export function getGrowthStripePriceTiers(interval: ChattingPricingInterval): ChattingGrowthStripePriceTier[] {
  return [
    {
      upTo: CHATTING_GROWTH_BASE_TEAM_LIMIT,
      flatAmountCents: getGrowthBaseTotalCents(interval),
      unitAmountCents: null
    },
    ...CHATTING_GROWTH_MEMBER_PRICE_TIERS.map((tier) => ({
      upTo: tier.max,
      flatAmountCents: null,
      unitAmountCents: getGrowthTierUnitAmountCents(interval, tier)
    })),
    {
      upTo: "inf",
      flatAmountCents: null,
      unitAmountCents: getGrowthTierUnitAmountCents(interval, LAST_GROWTH_MEMBER_PRICE_TIER)
    }
  ];
}

function getGrowthTierForMemberCount(memberCount: number) {
  const safeMemberCount = normalizeGrowthMemberCount(memberCount);
  return CHATTING_GROWTH_MEMBER_PRICE_TIERS.find((tier) => safeMemberCount >= tier.min && safeMemberCount <= tier.max) ?? null;
}

export function getGrowthPerMemberCents(interval: ChattingPricingInterval, memberCount: number) {
  const safeMemberCount = normalizeGrowthMemberCount(memberCount);

  if (safeMemberCount <= CHATTING_GROWTH_BASE_TEAM_LIMIT) {
    return Math.round(getGrowthBaseTotalCents(interval) / safeMemberCount);
  }

  const tier = getGrowthTierForMemberCount(safeMemberCount);
  return getGrowthTierUnitAmountCents(interval, tier);
}

export function getGrowthTotalCentsBeforeContactSales(interval: ChattingPricingInterval, memberCount: number) {
  const safeMemberCount = normalizeGrowthMemberCount(memberCount);

  if (safeMemberCount <= CHATTING_GROWTH_BASE_TEAM_LIMIT) {
    return getGrowthBaseTotalCents(interval);
  }

  const perMemberCents = getGrowthPerMemberCents(interval, safeMemberCount);
  return perMemberCents === null ? null : safeMemberCount * perMemberCents;
}
