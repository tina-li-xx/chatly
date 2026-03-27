"use client";

import { classNames } from "@/lib/utils";
import { BarChartIcon } from "./dashboard-ui";
import {
  formatDurationShort,
  type ChartPoint
} from "./dashboard-analytics-core";
import type {
  HeatMapCell,
  StatBadge,
  StatCardProps
} from "./dashboard-analytics-types";

function comparisonRatio(current: number | null, previous: number | null) {
  if (current == null || previous == null) {
    return 0.5;
  }

  const total = current + previous;
  if (total <= 0) {
    return 0.5;
  }

  return current / total;
}

export function AnalyticsEmptyState({
  title,
  description
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-6 py-16 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-300">
        <BarChartIcon className="h-8 w-8" />
      </div>
      <h2 className="mt-5 text-lg font-medium text-slate-700">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">{description}</p>
    </div>
  );
}

export function StatCard({
  label,
  value,
  badge,
  previousLabel,
  previousValue,
  currentValue
}: StatCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <p className="text-[13px] font-normal text-slate-500">{label}</p>
        {badge ? (
          <span
            className={classNames(
              "rounded-full px-2 py-1 text-xs font-medium",
              badge.tone === "positive" && "bg-green-50 text-green-600",
              badge.tone === "negative" && "bg-red-50 text-red-600",
              badge.tone === "neutral" && "bg-slate-100 text-slate-600"
            )}
          >
            {badge.value}
          </span>
        ) : null}
      </div>
      <p className="mb-2 text-[32px] font-bold leading-none text-slate-900">{value}</p>
      <div className="mb-2 h-1 rounded-full bg-slate-100">
        <div
          className="h-1 rounded-full bg-blue-500"
          style={{ width: `${Math.max(8, comparisonRatio(currentValue, previousValue) * 100)}%` }}
        />
      </div>
      <p className="text-xs font-normal text-slate-400">{previousLabel}</p>
    </div>
  );
}

export function LineChart({ points }: { points: ChartPoint[] }) {
  const width = 760;
  const height = 280;
  const margin = { top: 12, right: 12, bottom: 28, left: 40 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;
  const maxValue = Math.max(1, ...points.map((point) => point.value));
  const baselineY = margin.top + chartHeight;
  const xStep = points.length > 1 ? chartWidth / (points.length - 1) : 0;
  const pointsWithCoordinates = points.map((point, index) => {
    const x = points.length > 1 ? margin.left + index * xStep : margin.left + chartWidth / 2;
    const y = margin.top + chartHeight - (point.value / maxValue) * chartHeight;
    return { ...point, x, y };
  });

  const linePath = pointsWithCoordinates
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
  const areaPath = pointsWithCoordinates.length
    ? `${linePath} L ${pointsWithCoordinates.at(-1)?.x ?? margin.left} ${margin.top + chartHeight} L ${
        pointsWithCoordinates[0]?.x ?? margin.left
      } ${margin.top + chartHeight} Z`
    : "";
  const yTicks = Array.from({ length: 5 }, (_, index) => {
    const value = Math.round((maxValue / 4) * (4 - index));
    const y = margin.top + (chartHeight / 4) * index;
    return { value, y };
  });
  const showEvery = Math.max(1, Math.ceil(points.length / 7));

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-[280px] w-full overflow-visible">
        <defs>
          <linearGradient id="analytics-area-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
          </linearGradient>
        </defs>

        {yTicks.map((tick) => (
          <g key={tick.y}>
            <line
              x1={margin.left}
              x2={width - margin.right}
              y1={tick.y}
              y2={tick.y}
              className="stroke-slate-100"
              strokeDasharray="4 4"
            />
            <text x={margin.left - 8} y={tick.y + 4} textAnchor="end" className="fill-slate-400 text-[11px]">
              {tick.value}
            </text>
          </g>
        ))}

        {areaPath ? <path d={areaPath} fill="url(#analytics-area-fill)" /> : null}
        {linePath ? (
          <path
            d={linePath}
            fill="none"
            stroke="#3B82F6"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : null}

        {pointsWithCoordinates.map((point, index) => (
          <g key={`${point.label}-${index}`}>
            {point.value > 0 ? (
              <>
                <line
                  x1={point.x}
                  x2={point.x}
                  y1={baselineY}
                  y2={point.y}
                  stroke="#BFDBFE"
                  strokeWidth="2"
                />
                {points.length <= 12 ? (
                  <text
                    x={point.x}
                    y={Math.max(margin.top + 10, point.y - 10)}
                    textAnchor="middle"
                    className="fill-slate-600 text-[11px] font-medium"
                  >
                    {point.value}
                  </text>
                ) : null}
              </>
            ) : null}
            {index % showEvery === 0 || index === pointsWithCoordinates.length - 1 ? (
              <text
                x={point.x}
                y={height - 6}
                textAnchor="middle"
                className="fill-slate-400 text-[11px]"
              >
                {point.label}
              </text>
            ) : null}
            <circle cx={point.x} cy={point.y} r="4" fill="white" stroke="#3B82F6" strokeWidth="2">
              <title>{point.sublabel}</title>
            </circle>
          </g>
        ))}
      </svg>

      <div className="mt-3 flex items-center gap-6 text-[13px] text-slate-600">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-blue-500" />
          <span>Conversations</span>
        </div>
      </div>
    </div>
  );
}

export function ResponseTimeChart({
  points,
  averageSeconds,
  replyAverageSeconds,
  resolutionAverageSeconds
}: {
  points: ChartPoint[];
  averageSeconds: number | null;
  replyAverageSeconds: number | null;
  resolutionAverageSeconds: number | null;
}) {
  const maxValue = Math.max(120, ...points.map((point) => point.value), 1);
  const targetOffset = 100 - (120 / maxValue) * 100;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-medium text-slate-900">Response time</h3>
        </div>
        <span className="rounded-md bg-green-50 px-2.5 py-1 text-[13px] font-medium text-green-700">
          Avg: {formatDurationShort(averageSeconds)}
        </span>
      </div>

      <div className="relative h-[200px] overflow-x-auto">
        <div
          className="absolute left-0 right-0 border-t border-dashed border-green-500"
          style={{ top: `${targetOffset}%` }}
        />
        <span
          className="absolute right-0 -translate-y-1/2 bg-white px-2 text-[11px] text-green-600"
          style={{ top: `${targetOffset}%` }}
        >
          Target: 2m
        </span>

        <div className="flex h-full min-w-[320px] items-end gap-2 pt-6">
          {points.map((point) => (
            <div key={point.label} className="flex flex-1 flex-col items-center justify-end gap-2">
              <div className="relative flex h-[150px] w-full items-end justify-center">
                <div
                  className="w-full max-w-8 rounded-t-md bg-blue-500 transition hover:bg-blue-600"
                  style={{ height: `${(point.value / maxValue) * 100}%` }}
                >
                  <title>{point.sublabel}</title>
                </div>
              </div>
              <span className="text-[11px] text-slate-400">{point.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 border-t border-slate-200 pt-4">
        <div className="flex items-center justify-between py-2 text-[13px]">
          <span className="text-slate-600">First response</span>
          <span className="font-medium text-slate-900">{formatDurationShort(averageSeconds)}</span>
        </div>
        <div className="flex items-center justify-between py-2 text-[13px]">
          <span className="text-slate-600">Avg reply time</span>
          <span className="font-medium text-slate-900">{formatDurationShort(replyAverageSeconds)}</span>
        </div>
        <div className="flex items-center justify-between py-2 text-[13px]">
          <span className="text-slate-600">Resolution time</span>
          <span className="font-medium text-slate-900">{formatDurationShort(resolutionAverageSeconds)}</span>
        </div>
      </div>
    </div>
  );
}

export function HeatMap({ rows }: { rows: HeatMapCell[][] }) {
  const levelClassName: Record<HeatMapCell["level"], string> = {
    0: "bg-slate-100",
    1: "bg-blue-100",
    2: "bg-blue-200",
    3: "bg-blue-400",
    4: "bg-blue-600"
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <h3 className="mb-5 text-base font-medium text-slate-900">Busiest hours</h3>
      <div className="overflow-x-auto">
        <div className="grid min-w-[520px] gap-2" style={{ gridTemplateColumns: "40px repeat(24, minmax(0, 1fr))" }}>
          <div />
          {Array.from({ length: 24 }, (_, hour) => (
            <div key={hour} className="text-center text-[10px] text-slate-400">
              {hour % 3 === 0 ? `${hour}` : ""}
            </div>
          ))}

          {rows.map((row, index) => (
            <div key={row[0]?.dayLabel ?? index} className="contents">
              <div key={`label-${index}`} className="pt-0.5 text-[11px] text-slate-500">
                {row[0]?.dayLabel}
              </div>
              {row.map((cell, hourIndex) => (
                <div
                  key={`${cell.dayLabel}-${hourIndex}`}
                  className={classNames("h-4 w-full rounded-sm", levelClassName[cell.level])}
                >
                  <title>{`${cell.dayLabel} ${cell.hourLabel}: ${cell.value} conversations`}</title>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-end gap-2 text-[11px] text-slate-400">
        <span>Less</span>
        {[0, 1, 2, 3, 4].map((level) => (
          <span
            key={level}
            className={classNames("h-3 w-3 rounded-sm", levelClassName[level as HeatMapCell["level"]])}
          />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
