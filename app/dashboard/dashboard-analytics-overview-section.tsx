"use client";

import { startTransition } from "react";
import { classNames } from "@/lib/utils";
import {
  GRANULARITY_OPTIONS,
  type AnalyticsGranularity,
  type ChartPoint,
  type StatCardProps
} from "./dashboard-analytics-types";
import { LineChart, StatCard } from "./dashboard-analytics-primary-charts";

export function DashboardAnalyticsOverviewSection({
  cards,
  conversationPoints,
  granularity,
  onGranularityChange
}: {
  cards: StatCardProps[];
  conversationPoints: ChartPoint[];
  granularity: AnalyticsGranularity;
  onGranularityChange: (value: AnalyticsGranularity) => void;
}) {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <h3 className="text-base font-medium text-slate-900">Conversations over time</h3>
          <div className="inline-flex rounded-lg bg-slate-100 p-1">
            {GRANULARITY_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => startTransition(() => onGranularityChange(option.value))}
                className={classNames(
                  "rounded-md px-3 py-1.5 text-[13px] transition",
                  granularity === option.value
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        <LineChart points={conversationPoints} />
      </div>
    </>
  );
}
