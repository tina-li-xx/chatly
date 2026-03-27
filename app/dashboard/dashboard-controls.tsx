"use client";

import { classNames } from "@/lib/utils";
import { CheckCircleIcon, WarningIcon } from "./dashboard-ui";

export type DashboardNoticeTone = "success" | "error";

export type DashboardNoticeState = {
  tone: DashboardNoticeTone;
  message: string;
} | null;

export const DASHBOARD_INPUT_CLASS =
  "h-11 w-full rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-900 transition placeholder:text-slate-400 focus:border-blue-500";

export const DASHBOARD_SELECT_CLASS =
  "h-11 w-full rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-900 transition focus:border-blue-500";

export const DASHBOARD_PRIMARY_BUTTON_CLASS =
  "inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50";

export const DASHBOARD_SECONDARY_BUTTON_CLASS =
  "inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50";

export const DASHBOARD_ICON_BUTTON_CLASS =
  "inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700";

export function DashboardTopNotice({ notice }: { notice: DashboardNoticeState }) {
  if (!notice) {
    return null;
  }

  return (
    <div className="fixed right-6 top-20 z-40">
      <div
        className={classNames(
          "flex items-center gap-3 rounded-lg border px-4 py-3 shadow-sm",
          notice.tone === "success"
            ? "border-green-200 bg-green-50 text-green-700"
            : "border-red-200 bg-red-50 text-red-700"
        )}
      >
        {notice.tone === "success" ? <CheckCircleIcon className="h-4 w-4" /> : <WarningIcon className="h-4 w-4" />}
        <span className="text-sm font-medium">{notice.message}</span>
      </div>
    </div>
  );
}
