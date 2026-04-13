"use client";

import type { DashboardReferralAttribution } from "@/lib/referral-types";
import { classNames } from "@/lib/utils";
import {
  formatReferralDate,
  referralProgramShortLabel,
  referralStatusMeta,
  referralWorkspaceLabel
} from "./dashboard-settings-referrals-helpers";
import { DASHBOARD_TABLE_LABEL_CLASS } from "./dashboard-table-styles";
import { UsersIcon } from "./dashboard-ui";

function StatusBadge({ status }: { status: DashboardReferralAttribution["status"] }) {
  const meta = referralStatusMeta(status);

  return (
    <span className={classNames("inline-flex rounded-full px-2.5 py-1 text-xs font-medium", meta.className)}>
      {meta.label}
    </span>
  );
}

function DesktopTable({ signups }: { signups: DashboardReferralAttribution[] }) {
  return (
    <div className="hidden md:block">
      <table className="w-full">
        <thead className="bg-slate-50">
          <tr>
            {["Workspace", "Email", "Program", "Code used", "Status", "Date"].map((label) => (
              <th
                key={label}
                className={classNames(
                  "px-5 py-3.5 text-left",
                  DASHBOARD_TABLE_LABEL_CLASS,
                  label === "Status" && "text-center",
                  label === "Date" && "text-right"
                )}
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {signups.map((signup) => (
            <tr key={signup.id} className="border-t border-slate-100 bg-white transition hover:bg-slate-50">
              <td className="px-5 py-4 align-middle">
                <p className="text-sm font-medium text-slate-900">{referralWorkspaceLabel(signup)}</p>
              </td>
              <td className="px-5 py-4 align-middle text-sm text-slate-600">{signup.referredEmail}</td>
              <td className="px-5 py-4 align-middle text-[13px] text-slate-600">
                {referralProgramShortLabel(signup.programType)}
              </td>
              <td className="px-5 py-4 align-middle font-mono text-[13px] text-slate-500">{signup.code}</td>
              <td className="px-5 py-4 text-center align-middle">
                <StatusBadge status={signup.status} />
              </td>
              <td className="px-5 py-4 text-right align-middle text-[13px] text-slate-500">
                {formatReferralDate(signup.status === "converted" && signup.convertedAt ? signup.convertedAt : signup.createdAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MobileCards({ signups }: { signups: DashboardReferralAttribution[] }) {
  return (
    <div className="space-y-3 p-4 md:hidden">
      {signups.map((signup) => (
        <article key={signup.id} className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-900">{referralWorkspaceLabel(signup)}</p>
              <p className="mt-1 truncate text-sm text-slate-600">{signup.referredEmail}</p>
            </div>
            <StatusBadge status={signup.status} />
          </div>
          <div className="mt-4 space-y-2 text-[13px] text-slate-600">
            <p>
              <span className="text-slate-500">Program:</span> {referralProgramShortLabel(signup.programType)}
            </p>
            <p className="font-mono text-slate-500">
              <span className="font-sans text-slate-500">Code:</span> {signup.code}
            </p>
            <p>
              <span className="text-slate-500">Date:</span>{" "}
              {formatReferralDate(signup.status === "converted" && signup.convertedAt ? signup.convertedAt : signup.createdAt)}
            </p>
          </div>
        </article>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="px-6 py-16 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center text-slate-300">
        <UsersIcon className="h-12 w-12" />
      </div>
      <p className="mt-5 text-[15px] font-medium text-slate-700">No referred signups yet.</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        Share one of the codes above to start tracking attribution.
      </p>
    </div>
  );
}

export function DashboardSettingsReferralSignups({
  signups
}: {
  signups: DashboardReferralAttribution[];
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      {signups.length ? (
        <>
          <DesktopTable signups={signups} />
          <MobileCards signups={signups} />
        </>
      ) : (
        <EmptyState />
      )}
    </div>
  );
}
