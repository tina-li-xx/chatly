"use client";

import type { ReactNode } from "react";
import type { DashboardReferralSummary } from "@/lib/referral-types";
import { DashboardSettingsBillingReferralsCard } from "./dashboard-settings-billing-referrals-card";
import { SettingsSectionHeader } from "./dashboard-settings-shared";

export function SettingsReferralsSection({
  title,
  subtitle,
  headerActions,
  referrals
}: {
  title: string;
  subtitle: string;
  headerActions?: ReactNode;
  referrals: DashboardReferralSummary;
}) {
  return (
    <div className="space-y-8">
      <SettingsSectionHeader title={title} subtitle={subtitle} actions={headerActions} />
      <DashboardSettingsBillingReferralsCard referrals={referrals} />
    </div>
  );
}
