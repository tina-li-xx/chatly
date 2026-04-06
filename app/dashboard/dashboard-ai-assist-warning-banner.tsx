"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { DashboardAiAssistWarningBanner as DashboardAiAssistWarningBannerData } from "@/lib/ai-assist-warning";
import { WarningIcon } from "./dashboard-ui";

const DISMISS_DURATION_MS = 24 * 60 * 60 * 1000;

function dismissKey(warning: DashboardAiAssistWarningBannerData) {
  return `chatting:ai-assist-warning:${warning.ownerUserId}:${warning.state}:${warning.resetsAt}`;
}

function resetLabel(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short"
  }).format(new Date(value));
}

export function DashboardAiAssistWarningBanner({
  warning,
  canManageBilling
}: {
  warning: DashboardAiAssistWarningBannerData | null;
  canManageBilling: boolean;
}) {
  const [dismissed, setDismissed] = useState(false);
  const storageKey = useMemo(
    () => (warning ? dismissKey(warning) : null),
    [warning]
  );

  useEffect(() => {
    if (!storageKey || typeof window === "undefined") {
      setDismissed(false);
      return;
    }

    const saved = window.localStorage.getItem(storageKey);
    setDismissed(saved != null && Date.now() - Number(saved) < DISMISS_DURATION_MS);
  }, [storageKey]);

  if (!warning || dismissed) {
    return null;
  }

  return (
    <div className={warning.state === "limited" ? "border-b-2 border-red-200 bg-red-50" : "border-b-2 border-amber-200 bg-amber-50"}>
      <div className="mx-auto flex w-full max-w-[1200px] items-start justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-start gap-3">
          <WarningIcon className={warning.state === "limited" ? "mt-0.5 h-5 w-5 shrink-0 text-red-600" : "mt-0.5 h-5 w-5 shrink-0 text-amber-600"} />
          <div className="text-sm">
            <p className={warning.state === "limited" ? "font-semibold text-red-700" : "font-semibold text-amber-700"}>
              {warning.state === "limited"
                ? "AI Assist limit reached."
                : `Your team has used ${warning.percentUsed}% of the AI Assist requests included in this billing cycle.`}
            </p>
            <p className={warning.state === "limited" ? "mt-1 text-red-600" : "mt-1 text-amber-700"}>
              {warning.state === "limited"
                ? `Features are paused until ${resetLabel(warning.resetsAt)}.`
                : `${warning.remaining} requests remaining. Resets ${resetLabel(warning.resetsAt)}.`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {canManageBilling ? (
            <Link href="/dashboard/settings?section=billing" className={warning.state === "limited" ? "text-sm font-semibold text-red-700 hover:text-red-800" : "text-sm font-semibold text-amber-700 hover:text-amber-800"}>
              {warning.planKey === "starter" ? "Upgrade" : "Open billing"}
            </Link>
          ) : null}
          <button
            type="button"
            onClick={() => {
              if (storageKey && typeof window !== "undefined") {
                window.localStorage.setItem(storageKey, String(Date.now()));
              }
              setDismissed(true);
            }}
            className={warning.state === "limited" ? "text-sm font-semibold text-red-500 hover:text-red-700" : "text-sm font-semibold text-amber-500 hover:text-amber-700"}
            aria-label="Dismiss AI Assist warning"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}
