"use client";

import type { DashboardReferralSummary } from "@/lib/data";
import { rewardLedgerLabel, rewardValueLabel } from "@/lib/referral-display";
import { formatDateTime } from "@/lib/utils";
import { formatMoney, SettingsCard } from "./dashboard-settings-shared";

const EMPTY_STATE_CLASS = "rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500";

function badgeToneClass(isComplete: boolean) {
  return isComplete ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700";
}

function EmptyState({ children }: { children: string }) {
  return <div className={EMPTY_STATE_CLASS}>{children}</div>;
}

function StatusBadge({ complete, earnedLabel, pendingLabel }: { complete: boolean; earnedLabel: string; pendingLabel: string }) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-medium ${badgeToneClass(complete)}`}>
      {complete ? earnedLabel : pendingLabel}
    </span>
  );
}

export function DashboardSettingsBillingReferralsCard({ referrals }: { referrals: DashboardReferralSummary }) {
  const earnedValue = referrals.earnedDiscountCents + referrals.earnedCommissionCents;
  const formatUsd = (amountCents: number) => formatMoney(amountCents, "USD");

  return (
    <>
      <SettingsCard
        title="Referral programs"
        description="Share a code or direct signup link. Rewards stay pending until the referred workspace becomes paid."
      >
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-[20px] bg-slate-50 px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Referred signups</p>
            <p className="mt-3 text-2xl font-semibold text-slate-900">{referrals.attributedSignups.length}</p>
          </div>
          <div className="rounded-[20px] bg-slate-50 px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Pending rewards</p>
            <p className="mt-3 text-2xl font-semibold text-slate-900">{referrals.pendingRewardCount}</p>
          </div>
          <div className="rounded-[20px] bg-slate-50 px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Earned value tracked</p>
            <p className="mt-3 text-2xl font-semibold text-slate-900">
              {referrals.earnedFreeMonths ? `${referrals.earnedFreeMonths} mo` : formatMoney(earnedValue, "USD")}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-3">
          {referrals.programs.map((program) => (
            <article key={program.id} className="rounded-[22px] border border-slate-200 bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{program.label}</p>
              <p className="mt-3 text-xl font-semibold text-slate-900">{program.incentiveLabel}</p>
              <p className="mt-3 text-sm leading-6 text-slate-600">{program.description}</p>
              <div className="mt-5 rounded-2xl bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Code</p>
                <p className="mt-2 font-mono text-sm font-semibold text-slate-900">{program.code}</p>
              </div>
              <a
                href={program.shareUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-4 block break-all text-sm font-medium text-blue-600 transition hover:text-blue-700"
              >
                {program.shareUrl}
              </a>
            </article>
          ))}
        </div>
      </SettingsCard>

      <SettingsCard title="Referred signups" description="See which shared codes turned into real workspaces and which ones converted to paid.">
        {referrals.attributedSignups.length ? (
          <div className="overflow-hidden rounded-lg border border-slate-200">
            {referrals.attributedSignups.map((signup) => (
              <div
                key={signup.id}
                className="flex flex-col gap-3 border-b border-slate-100 px-4 py-4 text-sm last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-slate-900">{signup.referredEmail}</p>
                  <p className="mt-1 text-[13px] text-slate-500">
                    {signup.programLabel} · Added {formatDateTime(signup.createdAt)}
                  </p>
                </div>
                <StatusBadge complete={signup.status === "converted"} earnedLabel="Paid conversion" pendingLabel="Pending paid conversion" />
              </div>
            ))}
          </div>
        ) : (
          <EmptyState>
            No referred signups yet. Share one of the codes above to start tracking attribution.
          </EmptyState>
        )}
      </SettingsCard>

      <SettingsCard title="Reward ledger" description="Pending rewards become earned after a paid conversion or paid invoice lands in Stripe.">
        {referrals.rewards.length ? (
          <div className="overflow-hidden rounded-lg border border-slate-200">
            {referrals.rewards.map((reward) => {
              const ledgerLabel = rewardLedgerLabel(reward, formatUsd);

              return (
                <div
                  key={reward.id}
                  className="flex flex-col gap-3 border-b border-slate-100 px-4 py-4 text-sm last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium text-slate-900">{reward.description}</p>
                    <p className="mt-1 text-[13px] text-slate-500">
                      {reward.programLabel} · {reward.rewardRole === "referrer" ? "For you" : "For the new workspace"} ·{" "}
                      {formatDateTime(reward.earnedAt ?? reward.createdAt)}
                    </p>
                    {ledgerLabel ? <p className="mt-1 text-[13px] text-slate-500">{ledgerLabel}</p> : null}
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge complete={reward.status === "earned"} earnedLabel="Earned" pendingLabel="Pending" />
                    <span className="text-sm font-medium text-slate-900">{rewardValueLabel(reward, formatUsd)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState>
            No referral rewards yet. New pending rewards will appear here as soon as a signup uses one of your codes.
          </EmptyState>
        )}
      </SettingsCard>
    </>
  );
}
