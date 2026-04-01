"use client";

import { startTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  DASHBOARD_HOME_RANGE_OPTIONS,
  type DashboardHomeRangeDays
} from "@/lib/data/dashboard-home-chart";

export function DashboardHomeRangeSelect({ value }: { value: DashboardHomeRangeDays }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <select
      id="dashboard-range"
      value={String(value)}
      onChange={(event) => {
        const nextValue = event.target.value;

        startTransition(() => {
          const params = new URLSearchParams(searchParams?.toString());
          if (nextValue === "7") {
            params.delete("range");
          } else {
            params.set("range", nextValue);
          }

          const query = params.toString();
          router.replace((query ? `${pathname}?${query}` : pathname) as never);
        });
      }}
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
