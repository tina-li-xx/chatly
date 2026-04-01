"use client";

import { useEffect, useState } from "react";
import type {
  DashboardHomeChart,
  DashboardHomeRangeDays
} from "@/lib/data/dashboard-home-chart";
import type { DashboardHomeChartData } from "@/lib/data/dashboard-home";
import { useToast } from "../ui/toast-provider";
import { DashboardHomeRangeSelect } from "./dashboard-home-range-select";

type DashboardHomeChartResponse = DashboardHomeChartData & { ok?: boolean };

const CHART_FETCH_ERROR = "Please try again in a moment.";

function toChartData(chart: DashboardHomeChart, chartPending: boolean): DashboardHomeChartData {
  return { chart, chartPending };
}

function DashboardHomeChartSkeleton() {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-slate-900">Conversations</h2>
        <div className="h-9 w-24 rounded-lg bg-slate-100" />
      </div>

      <div className="mt-5 flex h-32 items-end gap-3 animate-pulse">
        {[28, 56, 44, 68, 40, 52].map((height, index) => (
          <div key={index} className="flex w-8 flex-col items-center gap-2">
            <div className="flex h-[100px] w-8 items-end">
              <div className="w-8 rounded-t-sm bg-slate-100" style={{ height: `${height}%` }} />
            </div>
            <div className="h-3 w-7 rounded bg-slate-100" />
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-end justify-between border-t border-slate-200 pt-4 animate-pulse">
        <div className="space-y-2">
          <div className="h-7 w-12 rounded bg-slate-100" />
          <div className="h-3 w-24 rounded bg-slate-100" />
        </div>
        <div className="space-y-2 text-right">
          <div className="h-3 w-12 rounded bg-slate-100" />
          <div className="h-3 w-20 rounded bg-slate-100" />
        </div>
      </div>
    </article>
  );
}

function metricBadge(value: number | null) {
  if (value == null) {
    return { text: "No data", tone: "text-slate-500" };
  }

  if (value === 0) {
    return { text: "0", tone: "text-slate-500" };
  }

  return {
    text: `${value > 0 ? "+" : ""}${value}%`,
    tone: value > 0 ? "text-green-600" : "text-slate-500"
  };
}

export function DashboardHomeConversationsCard({
  chart: initialChart,
  chartPending: initialPending
}: DashboardHomeChartData) {
  const { showToast } = useToast();
  const [chartData, setChartData] = useState<DashboardHomeChartData>(() =>
    toChartData(initialChart, initialPending)
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setChartData(toChartData(initialChart, initialPending));
    setLoading(false);
  }, [initialChart, initialPending]);

  async function handleRangeChange(nextRange: DashboardHomeRangeDays) {
    if (loading || nextRange === chartData.chart.rangeDays) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/dashboard/home-chart?range=${nextRange}`, {
        method: "GET",
        cache: "no-store"
      });
      const payload = (await response.json()) as DashboardHomeChartResponse;
      if (!response.ok || !payload.ok) {
        throw new Error(CHART_FETCH_ERROR);
      }

      setChartData(toChartData(payload.chart, payload.chartPending));
    } catch (error) {
      showToast(
        "error",
        "We couldn't update the conversations chart.",
        error instanceof Error ? error.message : CHART_FETCH_ERROR
      );
    } finally {
      setLoading(false);
    }
  }

  if (chartData.chartPending || loading) {
    return <DashboardHomeChartSkeleton />;
  }

  const { chart } = chartData;
  const chartBadge = metricBadge(chart.changePercent);
  const chartMax = Math.max(...chart.points.map((point) => point.count), 1);

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-slate-900">Conversations</h2>
        <label className="sr-only" htmlFor="dashboard-range">
          Time period
        </label>
        <DashboardHomeRangeSelect
          value={chart.rangeDays}
          onChange={(value) => void handleRangeChange(value)}
        />
      </div>

      <div className="mt-5 flex h-32 items-end gap-3">
        {chart.points.map((point) => (
          <div key={point.label} className="flex w-8 flex-col items-center gap-2">
            <div className="flex h-[100px] w-8 items-end">
              <div
                className="w-8 rounded-t-sm bg-blue-600"
                style={{
                  height: `${Math.max((point.count / chartMax) * 100, point.count > 0 ? 12 : 4)}px`
                }}
              />
            </div>
            <span className="text-xs font-normal text-slate-400">{point.label}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-end justify-between border-t border-slate-200 pt-4">
        <div>
          <p className="text-2xl font-bold tracking-tight text-slate-900">{chart.total}</p>
          <p className="mt-1 text-xs font-normal text-slate-500">{chart.totalLabel}</p>
        </div>
        <div className="text-right">
          <p className={`text-xs font-medium ${chartBadge.tone}`}>{chartBadge.text}</p>
          <p className="mt-1 text-xs font-normal text-slate-500">{chart.comparisonLabel}</p>
        </div>
      </div>
    </article>
  );
}
