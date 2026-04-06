import type { DashboardAiAssistUsageActivity } from "@/lib/data/settings-ai-assist-usage";

export type AiAssistActivityTypeFilter =
  | "all"
  | DashboardAiAssistUsageActivity["feature"];
export type AiAssistActivityDateFilter = "7d" | "30d" | "90d" | "custom";

export type AnalyticsAiAssistActivityFilters = {
  type: AiAssistActivityTypeFilter;
  memberId: string;
  date: AiAssistActivityDateFilter;
  customStart: string;
  customEnd: string;
};

export const AI_ACTIVITY_PAGE_SIZE = 50;
export const AI_ACTIVITY_TYPE_OPTIONS: Array<{
  value: AiAssistActivityTypeFilter;
  label: string;
}> = [
  { value: "all", label: "All types" },
  { value: "reply", label: "Reply suggestions" },
  { value: "summary", label: "Summaries" },
  { value: "rewrite", label: "Rewrites" },
  { value: "tags", label: "Tag suggestions" }
];
export const AI_ACTIVITY_DATE_OPTIONS: Array<{
  value: AiAssistActivityDateFilter;
  label: string;
}> = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "custom", label: "Custom range" }
];

const VALID_TYPE_FILTERS = new Set(
  AI_ACTIVITY_TYPE_OPTIONS.map((option) => option.value)
);
const VALID_DATE_FILTERS = new Set(
  AI_ACTIVITY_DATE_OPTIONS.map((option) => option.value)
);

function startOfDay(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

export function addDays(value: Date, amount: number) {
  const next = new Date(value);
  next.setDate(next.getDate() + amount);
  return next;
}

export function toDateInputValue(value: Date) {
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, "0");
  const day = `${value.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateInput(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) {
    return null;
  }

  const next = new Date(year, month - 1, day);
  return Number.isNaN(next.getTime()) ? null : next;
}

export function defaultAiActivityFilters(): AnalyticsAiAssistActivityFilters {
  const today = startOfDay(new Date());

  return {
    type: "all",
    memberId: "all",
    date: "7d",
    customStart: toDateInputValue(addDays(today, -6)),
    customEnd: toDateInputValue(today)
  };
}

export function resolveAiAssistActivityFilters(input: {
  type?: string | null;
  member?: string | null;
  date?: string | null;
  start?: string | null;
  end?: string | null;
}): AnalyticsAiAssistActivityFilters {
  const defaults = defaultAiActivityFilters();

  return {
    type: VALID_TYPE_FILTERS.has(input.type as AiAssistActivityTypeFilter)
      ? (input.type as AiAssistActivityTypeFilter)
      : defaults.type,
    memberId: String(input.member ?? "").trim() || defaults.memberId,
    date: VALID_DATE_FILTERS.has(input.date as AiAssistActivityDateFilter)
      ? (input.date as AiAssistActivityDateFilter)
      : defaults.date,
    customStart:
      typeof input.start === "string" && input.start.trim()
        ? input.start.trim()
        : defaults.customStart,
    customEnd:
      typeof input.end === "string" && input.end.trim()
        ? input.end.trim()
        : defaults.customEnd
  };
}

export function buildAiAssistActivityRange(
  filters: AnalyticsAiAssistActivityFilters
) {
  const today = startOfDay(new Date());
  if (filters.date === "7d") {
    return { start: addDays(today, -6).toISOString(), end: addDays(today, 1).toISOString() };
  }
  if (filters.date === "30d") {
    return { start: addDays(today, -29).toISOString(), end: addDays(today, 1).toISOString() };
  }
  if (filters.date === "90d") {
    return { start: addDays(today, -89).toISOString(), end: addDays(today, 1).toISOString() };
  }

  const customStart = parseDateInput(filters.customStart);
  const customEnd = parseDateInput(filters.customEnd);
  if (!customStart || !customEnd) {
    return { start: addDays(today, -6).toISOString(), end: addDays(today, 1).toISOString() };
  }

  return {
    start: startOfDay(customStart).toISOString(),
    end: addDays(startOfDay(customEnd), 1).toISOString()
  };
}

export function buildAiAssistActivitySearchParams(
  filters: AnalyticsAiAssistActivityFilters
) {
  const params = new URLSearchParams();
  params.set("type", filters.type);
  params.set("member", filters.memberId);
  params.set("date", filters.date);
  if (filters.date === "custom") {
    params.set("start", filters.customStart);
    params.set("end", filters.customEnd);
  }
  return params;
}
