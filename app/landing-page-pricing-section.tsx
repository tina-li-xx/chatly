"use client";

import { useId, useState } from "react";
import {
  LANDING_DEFAULT_TEAM_SIZE,
  clampLandingTeamSize,
  type LandingBillingInterval
} from "@/lib/landing-pricing";
import { CheckIcon } from "./dashboard/dashboard-ui";
import { DashboardSettingsBillingTeamSizeSlider } from "./dashboard/dashboard-settings-billing-team-size-slider";
import { LandingGrowthPricingCard, LandingStarterPricingCard } from "./landing-page-pricing-cards";

export function LandingPricingSection() {
  const headingId = useId();
  const [interval, setInterval] = useState<LandingBillingInterval>("monthly");
  const [memberCount, setMemberCount] = useState(LANDING_DEFAULT_TEAM_SIZE);

  return (
    <section id="pricing" className="bg-slate-50">
      <div className="mx-auto w-full max-w-[1200px] px-6 py-24">
        <div className="mx-auto max-w-[600px] text-center">
          <div className="inline-flex rounded-full bg-blue-50 px-[14px] py-[6px] text-[13px] font-medium text-blue-700">
            Pricing
          </div>
          <h2 id={headingId} className="display-font mt-4 text-4xl leading-tight text-slate-900 sm:text-5xl">
            Simple, transparent pricing
          </h2>
        </div>

        <div role="group" aria-labelledby={headingId} className="mx-auto mt-12 max-w-[980px] space-y-6">
          <DashboardSettingsBillingTeamSizeSlider
            memberCount={memberCount}
            interval={interval}
            subtitle={null}
            onMemberCountChange={(value) => setMemberCount(clampLandingTeamSize(value))}
            onIntervalChange={setInterval}
          />

          <div className="grid gap-4 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.15fr)]">
            <LandingStarterPricingCard interval={interval} />
            <LandingGrowthPricingCard interval={interval} memberCount={memberCount} />
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2 text-sm text-slate-500">
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckIcon className="h-3 w-3" />
          </span>
          <span>No credit card required</span>
        </div>
      </div>
    </section>
  );
}
