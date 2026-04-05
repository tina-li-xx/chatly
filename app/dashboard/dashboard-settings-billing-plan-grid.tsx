"use client";

import {
  getBillingDisplayPrice,
  getBillingPreviewDisplayPrice,
  type BillingInterval,
  type BillingPlanKey
} from "@/lib/billing-plans";
import type { DashboardBillingSummary } from "@/lib/data/billing-types";
import {
  getChattingGrowthPricingSummary
} from "@/lib/pricing";
import { FormButton } from "../ui/form-controls";
import { PricingPlanCard } from "../pricing-plan-card";
import { SettingsCard } from "./dashboard-settings-shared";
import { DashboardSettingsBillingTeamSizeSlider } from "./dashboard-settings-billing-team-size-slider";

export function DashboardSettingsBillingPlanGrid({
  billing,
  billingPlanPending,
  memberCount,
  selectedInterval,
  onMemberCountChange,
  onSetSelectedInterval,
  onSelectPlan
}: {
  billing: DashboardBillingSummary;
  billingPlanPending: string | null;
  memberCount: number;
  selectedInterval: BillingInterval;
  onMemberCountChange: (value: number) => void;
  onSetSelectedInterval: (value: BillingInterval) => void;
  onSelectPlan: (planKey: BillingPlanKey, billingInterval: BillingInterval, seatQuantity?: number) => void;
}) {
  const preview = getChattingGrowthPricingSummary(selectedInterval, memberCount);
  const growthPendingKey = `growth:${selectedInterval}`;
  const starterPendingKey = `starter:${selectedInterval}`;
  const growthIsCurrentPlan = billing.planKey === "growth";
  const growthMatchesSelectedInterval = growthIsCurrentPlan && billing.billingInterval === selectedInterval;
  const starterIsCurrent = billing.planKey === "starter";

  return (
    <SettingsCard title="Compare plans" description="Compare plans by team size.">
      <div className="space-y-6">
        <DashboardSettingsBillingTeamSizeSlider
          memberCount={memberCount}
          interval={selectedInterval}
          onMemberCountChange={onMemberCountChange}
          onIntervalChange={onSetSelectedInterval}
        />

        <div className="grid gap-4 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.15fr)]">
          <PricingPlanCard
            planKey="starter"
            interval={selectedInterval}
            featuredLabel={starterIsCurrent ? "Current plan" : null}
            priceNotePlacement="hidden"
            action={
              <FormButton
                type="button"
                onClick={() => onSelectPlan("starter", selectedInterval)}
                disabled={starterIsCurrent || Boolean(billingPlanPending)}
                variant="secondary"
                fullWidth
              >
                {billingPlanPending === starterPendingKey ? "Processing..." : starterIsCurrent ? "Current plan" : "Downgrade"}
              </FormButton>
            }
          />

          <PricingPlanCard
            planKey="growth"
            interval={selectedInterval}
            displayPriceOverride={getBillingPreviewDisplayPrice("growth", selectedInterval, memberCount)}
            featuredLabel={growthIsCurrentPlan ? "Current plan" : null}
            priceNote={getBillingDisplayPrice("growth", selectedInterval).note}
            priceNotePlacement="feature"
            action={
              <FormButton
                type="button"
                onClick={() => onSelectPlan("growth", selectedInterval, memberCount)}
                disabled={growthMatchesSelectedInterval || preview.totalCents === null || Boolean(billingPlanPending)}
                fullWidth
              >
                {billingPlanPending === growthPendingKey
                  ? "Processing..."
                  : growthMatchesSelectedInterval
                    ? "Current plan"
                    : growthIsCurrentPlan
                      ? `Switch to ${selectedInterval === "annual" ? "Yearly" : "Monthly"}`
                      : "Upgrade to Growth"}
              </FormButton>
            }
          />
        </div>
      </div>
    </SettingsCard>
  );
}
