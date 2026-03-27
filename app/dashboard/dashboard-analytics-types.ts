"use client";

export type AnalyticsDatePreset =
  | "today"
  | "yesterday"
  | "7d"
  | "30d"
  | "90d"
  | "thisMonth"
  | "lastMonth"
  | "custom";

export type AnalyticsGranularity = "daily" | "weekly" | "monthly";

export type ResolvedDateRange = {
  start: Date;
  end: Date;
  previousStart: Date;
  previousEnd: Date;
  label: string;
};

export type ChartPoint = {
  label: string;
  sublabel: string;
  value: number;
};

export type StatBadge = {
  tone: "positive" | "negative" | "neutral";
  value: string;
};

export type StatCardProps = {
  label: string;
  value: string;
  badge: StatBadge | null;
  previousLabel: string;
  previousValue: number | null;
  currentValue: number | null;
};

export type RatingBreakdown = {
  rating: number;
  count: number;
  percent: number;
};

export type TagBreakdown = {
  label: string;
  count: number;
  share: number;
  colorClass: string;
  strokeColor: string;
};

export type HeatMapCell = {
  dayLabel: string;
  hourLabel: string;
  value: number;
  level: 0 | 1 | 2 | 3 | 4;
};

export type TeamRow = {
  name: string;
  initials: string;
  conversations: number;
  avgResponseSeconds: number | null;
  resolutionRate: number | null;
  satisfactionScore: number | null;
};

export const DATE_PRESET_OPTIONS: Array<{ value: AnalyticsDatePreset; label: string }> = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "thisMonth", label: "This month" },
  { value: "lastMonth", label: "Last month" },
  { value: "custom", label: "Custom range" }
];

export const GRANULARITY_OPTIONS: Array<{ value: AnalyticsGranularity; label: string }> = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" }
];
