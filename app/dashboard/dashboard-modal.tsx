"use client";

import type { ReactNode } from "react";
import { classNames } from "@/lib/utils";
import { DASHBOARD_ICON_BUTTON_CLASS } from "./dashboard-controls";
import { XIcon } from "./dashboard-ui";

export function DashboardModal({
  title,
  description,
  onClose,
  children,
  widthClass = "max-w-[560px]"
}: {
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  widthClass?: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        className={classNames(
          "relative w-full rounded-2xl bg-white shadow-[0_20px_60px_rgba(0,0,0,0.2)]",
          widthClass
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className={DASHBOARD_ICON_BUTTON_CLASS}
            aria-label="Close modal"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
