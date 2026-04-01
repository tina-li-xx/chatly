"use client";

import { useEffect } from "react";
import { isValidTimeZone } from "@/lib/timezones";

export function useDashboardTimezoneSync() {
  useEffect(() => {
    if (typeof window === "undefined" || typeof fetch !== "function") {
      return;
    }

    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone?.trim();
    if (!isValidTimeZone(timeZone)) {
      return;
    }

    void fetch("/dashboard/settings/timezone", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ timezone: timeZone })
    }).catch(() => undefined);
  }, []);
}
