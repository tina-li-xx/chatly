"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isValidTimeZone } from "@/lib/timezones";
import {
  PREFERRED_TIME_ZONE_COOKIE_MAX_AGE,
  PREFERRED_TIME_ZONE_COOKIE_NAME
} from "@/lib/user-timezone-cookie-shared";

let pendingTimeZoneSync: Promise<string | null> | null = null;
let lastSyncedTimeZone: string | null = null;

function syncDashboardTimeZone() {
  if (
    typeof window === "undefined" ||
    typeof document === "undefined" ||
    typeof fetch !== "function"
  ) {
    return Promise.resolve(null);
  }

  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone?.trim();
  if (!isValidTimeZone(timeZone)) {
    return Promise.resolve(null);
  }

  const hasMatchingCookie = document.cookie
    .split(";")
    .some((segment) => segment.trim().startsWith(`${PREFERRED_TIME_ZONE_COOKIE_NAME}=${timeZone}`));

  if (hasMatchingCookie && lastSyncedTimeZone === timeZone) {
    return Promise.resolve(timeZone);
  }

  document.cookie = [
    `${PREFERRED_TIME_ZONE_COOKIE_NAME}=${timeZone}`,
    "Path=/",
    `Max-Age=${PREFERRED_TIME_ZONE_COOKIE_MAX_AGE}`,
    "SameSite=Lax",
    window.location.protocol === "https:" ? "Secure" : ""
  ]
    .filter(Boolean)
    .join("; ");

  if (!pendingTimeZoneSync) {
    pendingTimeZoneSync = fetch("/dashboard/settings/timezone", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ timezone: timeZone })
    })
      .then(() => {
        lastSyncedTimeZone = timeZone;
        return timeZone;
      })
      .catch(() => null)
      .finally(() => {
        pendingTimeZoneSync = null;
      });
  }

  return pendingTimeZoneSync;
}

export function useDashboardTimezoneSync({
  refreshOnSuccess = false
}: {
  refreshOnSuccess?: boolean;
} = {}) {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    void syncDashboardTimeZone().then((timeZone) => {
      if (!cancelled && refreshOnSuccess && timeZone) {
        router.refresh();
      }
    });

    return () => {
      cancelled = true;
    };
  }, [refreshOnSuccess, router]);
}
