"use client";

import { useDashboardTimezoneSync } from "./use-dashboard-timezone-sync";

export function DashboardHomeTimeZoneBootstrap() {
  useDashboardTimezoneSync({ refreshOnSuccess: true });
  return null;
}
