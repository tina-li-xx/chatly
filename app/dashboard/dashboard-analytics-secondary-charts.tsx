"use client";

import { classNames } from "@/lib/utils";
import { formatDurationShort, formatPercent } from "./dashboard-analytics-core";
import type { RatingBreakdown, TagBreakdown, TeamRow } from "./dashboard-analytics-types";
import { StarIcon } from "./dashboard-ui";

function Sparkline({ points, tone }: { points: number[]; tone: "positive" | "negative" }) {
  const width = 48;
  const height = 24;
  const maxValue = Math.max(1, ...points);
  const xStep = points.length > 1 ? width / (points.length - 1) : 0;
  const path = points
    .map((value, index) => {
      const x = index * xStep;
      const y = height - (value / maxValue) * (height - 2) - 1;
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-5 w-10">
      <path
        d={path}
        fill="none"
        stroke={tone === "positive" ? "#10B981" : "#EF4444"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function TeamPerformanceTable({
  rows,
  trendPoints
}: {
  rows: TeamRow[];
  trendPoints: number[];
}) {
  const maxResolution = Math.max(1, ...rows.map((row) => row.resolutionRate ?? 0));
  const trendTone = (trendPoints.at(-1) ?? 0) >= (trendPoints[0] ?? 0) ? "positive" : "negative";

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-5 py-4">
        <h3 className="text-base font-medium text-slate-900">Team performance</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-slate-50">
            <tr>
              {["Team member", "Conversations", "Avg response", "Resolution rate", "Satisfaction", "Trend"].map(
                (label) => (
                  <th
                    key={label}
                    className="px-4 py-3 text-left text-xs font-medium uppercase tracking-[0.08em] text-slate-500"
                  >
                    {label}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.name} className="border-t border-slate-100 text-sm text-slate-700">
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-[13px] font-medium text-blue-700">
                      {row.initials}
                    </span>
                    <span className="font-medium text-slate-900">{row.name}</span>
                  </div>
                </td>
                <td className="px-4 py-4 text-center font-medium text-slate-900">{row.conversations}</td>
                <td
                  className={classNames(
                    "px-4 py-4 text-center",
                    row.avgResponseSeconds != null && row.avgResponseSeconds <= 120 ? "text-green-600" : "text-slate-700"
                  )}
                >
                  {formatDurationShort(row.avgResponseSeconds)}
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-1 w-16 rounded-full bg-slate-100">
                      <div
                        className="h-1 rounded-full bg-green-500"
                        style={{ width: `${((row.resolutionRate ?? 0) / maxResolution) * 100}%` }}
                      />
                    </div>
                    <span className="text-[13px] text-slate-700">{formatPercent(row.resolutionRate, 0)}</span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center justify-center gap-1.5">
                    <StarIcon className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span>{row.satisfactionScore?.toFixed(1) ?? "—"}</span>
                  </div>
                </td>
                <td className="px-4 py-4 text-center">
                  <Sparkline points={trendPoints} tone={trendTone} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function TopPagesCard({ pages }: { pages: Array<{ page: string; count: number }> }) {
  const maxCount = Math.max(1, ...pages.map((page) => page.count));

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-5 py-4">
        <h3 className="text-base font-medium text-slate-900">Top pages</h3>
        <p className="mt-0.5 text-[13px] text-slate-500">Where conversations start</p>
      </div>
      <div className="divide-y divide-slate-100">
        {pages.length ? (
          pages.map((page, index) => (
            <div key={page.page} className="px-5 py-4">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="w-5 text-[13px] text-slate-400">{index + 1}.</span>
                    <span className="truncate font-mono text-sm text-blue-600">{page.page}</span>
                  </div>
                </div>
                <span className="text-sm font-medium text-slate-900">{page.count}</span>
              </div>
              <div className="mt-2 h-1 rounded-full bg-slate-100">
                <div
                  className="h-1 rounded-full bg-blue-500"
                  style={{ width: `${(page.count / maxCount) * 100}%` }}
                />
              </div>
            </div>
          ))
        ) : (
          <div className="px-5 py-10 text-sm text-slate-500">No page data in this range yet.</div>
        )}
      </div>
    </div>
  );
}

export function SatisfactionBreakdown({
  score,
  rows
}: {
  score: number | null;
  rows: RatingBreakdown[];
}) {
  const fillClass: Record<number, string> = {
    5: "bg-green-500",
    4: "bg-green-400",
    3: "bg-amber-400",
    2: "bg-orange-400",
    1: "bg-red-400"
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <h3 className="text-base font-medium text-slate-900">Satisfaction breakdown</h3>
        <div className="flex items-center gap-1.5">
          <StarIcon className="h-4.5 w-4.5 fill-amber-400 text-amber-400" />
          <span className="text-lg font-semibold text-slate-900">{score?.toFixed(1) ?? "—"}</span>
          <span className="text-sm text-slate-400">/5</span>
        </div>
      </div>
      <div className="space-y-3">
        {rows.map((row) => (
          <div key={row.rating} className="flex items-center gap-3">
            <div className="flex w-10 items-center gap-1 text-[13px] text-slate-600">
              <span>{row.rating}</span>
              <StarIcon className="h-3 w-3 fill-amber-400 text-amber-400" />
            </div>
            <div className="h-2 flex-1 rounded-full bg-slate-100">
              <div
                className={classNames("h-2 rounded-full", fillClass[row.rating])}
                style={{ width: `${row.percent}%` }}
              />
            </div>
            <div className="w-12 text-right text-[13px] text-slate-600">{Math.round(row.percent)}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DonutChart({ tags }: { tags: TagBreakdown[] }) {
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <h3 className="mb-5 text-base font-medium text-slate-900">Conversation tags</h3>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
        <div className="relative flex h-[180px] w-[180px] items-center justify-center self-center">
          <svg viewBox="0 0 100 100" className="h-[180px] w-[180px] -rotate-90">
            <circle cx="50" cy="50" r={radius} className="fill-none stroke-slate-100" strokeWidth="16" />
            {tags.map((tag) => {
              const length = circumference * tag.share;
              const strokeDasharray = `${length} ${circumference - length}`;
              const strokeDashoffset = -offset;
              offset += length;

              return (
                <circle
                  key={tag.label}
                  cx="50"
                  cy="50"
                  r={radius}
                  className="fill-none"
                  stroke={tag.strokeColor}
                  strokeWidth="16"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                />
              );
            })}
          </svg>
          <div className="absolute text-center">
            <div className="text-2xl font-semibold text-slate-900">
              {tags.reduce((sum, tag) => sum + tag.count, 0)}
            </div>
            <div className="text-xs text-slate-500">total</div>
          </div>
        </div>

        <div className="flex-1 space-y-3">
          {tags.length ? (
            tags.map((tag) => (
              <div key={tag.label} className="flex items-center justify-between gap-3 text-sm">
                <div className="flex min-w-0 items-center gap-3">
                  <span className={classNames("h-2.5 w-2.5 rounded-full", tag.colorClass)} />
                  <span className="truncate text-slate-700">{tag.label}</span>
                </div>
                <div className="shrink-0 text-right">
                  <div className="font-medium text-slate-900">{tag.count}</div>
                  <div className="text-xs text-slate-400">{Math.round(tag.share * 100)}%</div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">No conversation tags in this date range yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
