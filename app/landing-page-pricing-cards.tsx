"use client";

import {
  getLandingGrowthDisplayPrice,
  getLandingGrowthPriceNote,
  getLandingStarterDisplayPrice,
  type LandingBillingInterval
} from "@/lib/landing-pricing";
import { ButtonLink } from "./components/ui/Button";
import { PricingPlanCard } from "./pricing-plan-card";

export function LandingStarterPricingCard({ interval }: { interval: LandingBillingInterval }) {
  return (
    <PricingPlanCard
      planKey="starter"
      interval={interval}
      displayPriceOverride={getLandingStarterDisplayPrice(interval)}
      action={
        <ButtonLink href="/signup" variant="secondary" fullWidth>
          Get started free
        </ButtonLink>
      }
    />
  );
}

export function LandingGrowthPricingCard({
  interval,
  memberCount
}: {
  interval: LandingBillingInterval;
  memberCount: number;
}) {
  const displayPrice = getLandingGrowthDisplayPrice(interval, memberCount);

  return (
    <PricingPlanCard
      planKey="growth"
      interval={interval}
      displayPriceOverride={displayPrice}
      priceNote={displayPrice.note ?? getLandingGrowthPriceNote(interval)}
      action={
        <ButtonLink href="/signup" fullWidth>
          Start free trial
        </ButtonLink>
      }
    />
  );
}
