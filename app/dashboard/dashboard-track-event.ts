"use client";

import {
  DASHBOARD_ANALYTICS_EVENT
} from "@/lib/browser-event-contracts";

export function trackDashboardEvent(name: string, detail: Record<string, unknown> = {}) {
  if (typeof window === "undefined") {
    return;
  }

  const payload = { detail: { name, ...detail } };
  window.dispatchEvent(new CustomEvent(DASHBOARD_ANALYTICS_EVENT, payload));
}
