import {
  getBillingDisplayPrice,
  getBillingPreviewDisplayPrice,
  type BillingInterval
} from "@/lib/billing-plans";
import { CHATTING_GROWTH_CONTACT_TEAM_SIZE } from "@/lib/pricing";

export type LandingBillingInterval = BillingInterval;

export const LANDING_DEFAULT_TEAM_SIZE = 1;

export function clampLandingTeamSize(value: number) {
  return Math.min(CHATTING_GROWTH_CONTACT_TEAM_SIZE, Math.max(1, Math.round(value || 0)));
}

export function getLandingStarterDisplayPrice(interval: LandingBillingInterval) {
  return getBillingDisplayPrice("starter", interval);
}

export function getLandingGrowthDisplayPrice(interval: LandingBillingInterval, memberCount: number) {
  return getBillingPreviewDisplayPrice("growth", interval, memberCount);
}

export function getLandingGrowthPriceNote(interval: LandingBillingInterval) {
  return getBillingDisplayPrice("growth", interval).note;
}
