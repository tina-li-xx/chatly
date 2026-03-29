"use client";

import type { DashboardReferralSummary } from "@/lib/data";
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

function shareLinkLabel(value: string) {
  try {
    const url = new URL(value);
    return `${url.host}${url.pathname}`;
  } catch {
    return value;
  }
}

function shareLinkRef(value: string) {
  try {
    return new URL(value).searchParams.get("ref");
  } catch {
    return null;
  }
}

function ProgramCard({
  program
}: {
  program: DashboardReferralSummary["programs"][number];
}) {
  const linkLabel = shareLinkLabel(program.shareUrl);
  const refCode = shareLinkRef(program.shareUrl);

  return (
    <article className="flex h-full flex-col rounded-[24px] border border-slate-200 bg-[linear-gradient(180deg,#FFFFFF_0%,#F8FAFC_100%)] p-5 shadow-[0_10px_28px_rgba(15,23,42,0.04)]">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{program.label}</p>
      <p className="mt-3 text-[1.75rem] font-semibold leading-tight text-slate-900">{program.incentiveLabel}</p>
      <p className="mt-4 text-sm leading-7 text-slate-600">{program.description}</p>

      <div className="mt-auto space-y-3 pt-6">
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Code</p>
          <p className="mt-2 font-mono text-base font-semibold text-slate-900">{program.code}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Share link</p>
              <p className="mt-2 truncate text-sm font-medium text-slate-900">{linkLabel}</p>
              {refCode ? <p className="mt-1 truncate font-mono text-xs text-slate-500">ref={refCode}</p> : null}
            </div>
            <a
              href={program.shareUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex shrink-0 items-center justify-center rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
            >
              Open
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}

export function DashboardSettingsBillingReferralsCard({ referrals }: { referrals: DashboardReferralSummary }) {
  const earnedValue = referrals.earnedDiscountCents + referrals.earnedCommissionCents;

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

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {referrals.programs.map((program) => <ProgramCard key={program.id} program={program} />)}
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
    </>
  );
}
