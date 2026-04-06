"use client";

import type { ReactNode } from "react";
import { Input } from "../components/ui/Input";
import {
  AI_ACTIVITY_DATE_OPTIONS,
  AI_ACTIVITY_TYPE_OPTIONS,
  type AiAssistActivityDateFilter,
  type AiAssistActivityTypeFilter,
  type AnalyticsAiAssistActivityFilters
} from "@/lib/data/analytics-ai-assist-activity-filters";
import type { AnalyticsAiAssistActivityMember } from "@/lib/data/analytics";
import { ChevronDownIcon } from "./dashboard-ui";

function SelectField({
  value,
  onChange,
  children
}: {
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <label className="relative">
      <select
        value={value}
        onChange={(event) => onChange(event.currentTarget.value)}
        className="h-10 min-w-[150px] appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-9 text-sm text-slate-700 outline-none transition focus:border-blue-300"
      >
        {children}
      </select>
      <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </label>
  );
}

export function DashboardAnalyticsAiAssistActivityFilters({
  filters,
  members,
  onTypeChange,
  onMemberChange,
  onDateChange,
  onCustomStartChange,
  onCustomEndChange
}: {
  filters: AnalyticsAiAssistActivityFilters;
  members: AnalyticsAiAssistActivityMember[];
  onTypeChange: (value: AiAssistActivityTypeFilter) => void;
  onMemberChange: (value: string) => void;
  onDateChange: (value: AiAssistActivityDateFilter) => void;
  onCustomStartChange: (value: string) => void;
  onCustomEndChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 md:flex-row md:flex-wrap">
      <SelectField value={filters.type} onChange={(value) => onTypeChange(value as AiAssistActivityTypeFilter)}>
        {AI_ACTIVITY_TYPE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </SelectField>
      <SelectField value={filters.memberId} onChange={onMemberChange}>
        <option value="all">All members</option>
        {members.map((member) => <option key={member.id} value={member.id}>{member.label}</option>)}
      </SelectField>
      <SelectField value={filters.date} onChange={(value) => onDateChange(value as AiAssistActivityDateFilter)}>
        {AI_ACTIVITY_DATE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </SelectField>
      {filters.date === "custom" ? (
        <>
          <Input
            type="date"
            value={filters.customStart}
            onChange={(event) => onCustomStartChange(event.currentTarget.value)}
            className="h-10 w-auto min-w-[150px] text-slate-700"
          />
          <Input
            type="date"
            value={filters.customEnd}
            onChange={(event) => onCustomEndChange(event.currentTarget.value)}
            className="h-10 w-auto min-w-[150px] text-slate-700"
          />
        </>
      ) : null}
    </div>
  );
}
