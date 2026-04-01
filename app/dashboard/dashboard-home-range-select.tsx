"use client";

import {
  DASHBOARD_HOME_RANGE_OPTIONS,
  resolveDashboardHomeRange,
  type DashboardHomeRangeDays
} from "@/lib/data/dashboard-home-chart";

export function DashboardHomeRangeSelect({
  value,
  onChange
}: {
  value: DashboardHomeRangeDays;
  onChange: (value: DashboardHomeRangeDays) => void;
}) {
  return (
    <select
      id="dashboard-range"
      value={String(value)}
      onChange={(event) => onChange(resolveDashboardHomeRange(event.target.value))}
      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 outline-none transition focus:border-blue-500"
    >
      {DASHBOARD_HOME_RANGE_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
