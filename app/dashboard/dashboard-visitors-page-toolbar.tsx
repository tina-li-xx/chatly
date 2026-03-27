"use client";

import { classNames } from "@/lib/utils";
import {
  ChevronDownIcon,
  FilterIcon,
  SearchIcon,
  XIcon
} from "./dashboard-ui";
import type {
  VisitorFilterState,
  VisitorsPrimaryFilter,
  VisitorsSourceFilter,
  VisitorsTimeRange
} from "./visitors-data";

const PRIMARY_FILTER_OPTIONS: Array<{ value: VisitorsPrimaryFilter; label: string }> = [
  { value: "all", label: "All visitors" },
  { value: "online", label: "Currently online" },
  { value: "returned", label: "Returned visitors" },
  { value: "new", label: "New visitors" }
];

const TIME_RANGE_OPTIONS: Array<{ value: VisitorsTimeRange; label: string }> = [
  { value: "24h", label: "Last 24 hours" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "all", label: "All time" }
];

function SelectField({
  value,
  onChange,
  children
}: {
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="relative">
      <select
        value={value}
        onChange={(event) => onChange(event.currentTarget.value)}
        className="h-10 appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-9 text-sm text-slate-700 outline-none transition focus:border-blue-300"
      >
        {children}
      </select>
      <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </label>
  );
}

function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      {children}
    </div>
  );
}

export function VisitorsToolbar({
  searchQuery,
  primaryFilter,
  timeRange,
  setSearchQuery,
  setPrimaryFilter,
  setTimeRange,
  onToggleFilters
}: {
  searchQuery: string;
  primaryFilter: VisitorsPrimaryFilter;
  timeRange: VisitorsTimeRange;
  setSearchQuery: (value: string) => void;
  setPrimaryFilter: (value: VisitorsPrimaryFilter) => void;
  setTimeRange: (value: VisitorsTimeRange) => void;
  onToggleFilters: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-end">
      <div className="mr-auto hidden text-xs font-medium uppercase tracking-[0.2em] text-slate-400 lg:block">
        Live visitor activity
      </div>
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <label className="relative block">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.currentTarget.value)}
            placeholder="Search visitors..."
            className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-300 md:w-[240px]"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 inline-flex h-4 w-4 -translate-y-1/2 items-center justify-center text-slate-400 transition hover:text-slate-600"
              aria-label="Clear search"
            >
              <XIcon className="h-4 w-4" />
            </button>
          ) : null}
        </label>

        <SelectField value={primaryFilter} onChange={(value) => setPrimaryFilter(value as VisitorsPrimaryFilter)}>
          {PRIMARY_FILTER_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </SelectField>

        <SelectField value={timeRange} onChange={(value) => setTimeRange(value as VisitorsTimeRange)}>
          {TIME_RANGE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </SelectField>

        <button
          type="button"
          onClick={onToggleFilters}
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 transition hover:bg-slate-50"
        >
          <FilterIcon className="h-4 w-4 text-slate-400" />
          More filters
        </button>
      </div>
    </div>
  );
}

export function VisitorsFiltersPanel({
  visible,
  draftFilters,
  setDraftFilters,
  clearFilters,
  applyFilters
}: {
  visible: boolean;
  draftFilters: VisitorFilterState;
  setDraftFilters: React.Dispatch<React.SetStateAction<VisitorFilterState>>;
  clearFilters: () => void;
  applyFilters: () => void;
}) {
  if (!visible) {
    return null;
  }

  return (
    <section className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 xl:grid-cols-4">
      <FilterField label="Status">
        <select
          value={draftFilters.status}
          onChange={(event) =>
            setDraftFilters((current) => ({ ...current, status: event.currentTarget.value as VisitorFilterState["status"] }))
          }
          className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-300"
        >
          <option value="all">All</option>
          <option value="online">Online</option>
          <option value="offline">Offline</option>
        </select>
      </FilterField>

      <FilterField label="Location">
        <input
          value={draftFilters.locationQuery}
          onChange={(event) => setDraftFilters((current) => ({ ...current, locationQuery: event.currentTarget.value }))}
          placeholder="Country, city search"
          className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-300"
        />
      </FilterField>

      <FilterField label="Source">
        <select
          value={draftFilters.source}
          onChange={(event) =>
            setDraftFilters((current) => ({ ...current, source: event.currentTarget.value as VisitorsSourceFilter }))
          }
          className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-300"
        >
          <option value="all">All</option>
          <option value="direct">Direct</option>
          <option value="google">Google</option>
          <option value="social">Social</option>
          <option value="email">Email</option>
          <option value="other">Other</option>
        </select>
      </FilterField>

      <FilterField label="Page contains">
        <input
          value={draftFilters.pageQuery}
          onChange={(event) => setDraftFilters((current) => ({ ...current, pageQuery: event.currentTarget.value }))}
          placeholder="URL contains"
          className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-300"
        />
      </FilterField>

      <FilterField label="Visit count">
        <select
          value={draftFilters.visitCount}
          onChange={(event) =>
            setDraftFilters((current) => ({ ...current, visitCount: event.currentTarget.value as VisitorFilterState["visitCount"] }))
          }
          className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-300"
        >
          <option value="all">All</option>
          <option value="first">First visit</option>
          <option value="2-5">2-5 visits</option>
          <option value="5+">5+ visits</option>
        </select>
      </FilterField>

      <FilterField label="Time on site">
        <select
          value={draftFilters.timeOnSite}
          onChange={(event) =>
            setDraftFilters((current) => ({ ...current, timeOnSite: event.currentTarget.value as VisitorFilterState["timeOnSite"] }))
          }
          className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-300"
        >
          <option value="all">All</option>
          <option value="<1">&lt;1 min</option>
          <option value="1-5">1-5 min</option>
          <option value="5+">5+ min</option>
        </select>
      </FilterField>

      <FilterField label="Has email">
        <select
          value={draftFilters.hasEmail}
          onChange={(event) =>
            setDraftFilters((current) => ({ ...current, hasEmail: event.currentTarget.value as VisitorFilterState["hasEmail"] }))
          }
          className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-300"
        >
          <option value="all">All</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
      </FilterField>

      <FilterField label="Has conversation">
        <select
          value={draftFilters.hasConversation}
          onChange={(event) =>
            setDraftFilters((current) => ({ ...current, hasConversation: event.currentTarget.value as VisitorFilterState["hasConversation"] }))
          }
          className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-300"
        >
          <option value="all">All</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
      </FilterField>

      <div className="flex items-center justify-end gap-3 pt-2 xl:col-span-4">
        <button
          type="button"
          onClick={clearFilters}
          className="inline-flex h-10 items-center rounded-lg px-3 text-sm text-slate-600 transition hover:bg-slate-100"
        >
          Clear all
        </button>
        <button
          type="button"
          onClick={applyFilters}
          className="inline-flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          Apply filters
        </button>
      </div>
    </section>
  );
}
