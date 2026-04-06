"use client";

import { startTransition } from "react";
import { Button } from "../components/ui/Button";
import { CalendarIcon, ChevronDownIcon, DownloadIcon } from "./dashboard-ui";
import {
  DATE_PRESET_OPTIONS,
  type AnalyticsDatePreset
} from "./dashboard-analytics-types";

export function DashboardAnalyticsToolbar(props: {
  label: string;
  datePreset: AnalyticsDatePreset;
  customStart: string;
  customEnd: string;
  onDatePresetChange: (value: AnalyticsDatePreset) => void;
  onCustomStartChange: (value: string) => void;
  onCustomEndChange: (value: string) => void;
  onExport: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="text-sm text-slate-500">Showing {props.label}</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-end">
        <div className="relative">
          <CalendarIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <select
            value={props.datePreset}
            onChange={(event) => {
              startTransition(() => props.onDatePresetChange(event.target.value as AnalyticsDatePreset));
            }}
            className="h-10 appearance-none rounded-lg border border-slate-200 bg-white pl-10 pr-10 text-sm text-slate-700"
          >
            {DATE_PRESET_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        </div>

        {props.datePreset === "custom" ? (
          <>
            <input
              type="date"
              value={props.customStart}
              onChange={(event) => startTransition(() => props.onCustomStartChange(event.target.value))}
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700"
            />
            <input
              type="date"
              value={props.customEnd}
              onChange={(event) => startTransition(() => props.onCustomEndChange(event.target.value))}
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700"
            />
          </>
        ) : null}

        <Button
          type="button"
          size="md"
          variant="secondary"
          onClick={props.onExport}
          className="h-10 gap-2 border-slate-200 bg-white text-sm text-slate-700 hover:bg-slate-50"
        >
          <DownloadIcon className="h-4 w-4" />
          <span>Export</span>
        </Button>
      </div>
    </div>
  );
}
