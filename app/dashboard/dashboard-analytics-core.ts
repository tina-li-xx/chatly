"use client";

import type {
  AnalyticsConversationRecord,
  AnalyticsReplyEventRecord
} from "@/lib/data/analytics";
import type {
  AnalyticsDatePreset,
  AnalyticsGranularity,
  ChartPoint,
  ResolvedDateRange,
  StatBadge
} from "./dashboard-analytics-types";

const DAY_FORMATTER = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric"
});

const AXIS_DAY_FORMATTER = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short"
});

const MONTH_FORMATTER = new Intl.DateTimeFormat("en-GB", {
  month: "short",
  year: "numeric"
});

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function startOfWeek(date: Date) {
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const next = startOfDay(date);
  next.setDate(next.getDate() + diff);
  return next;
}

export function addDays(date: Date, value: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + value);
  return next;
}

function addMonths(date: Date, value: number) {
  return new Date(date.getFullYear(), date.getMonth() + value, date.getDate());
}

export function average(values: number[]) {
  if (!values.length) {
    return null;
  }

  return values.reduce((total, value) => total + value, 0) / values.length;
}

export function formatCompactNumber(value: number | null) {
  if (value == null) {
    return "—";
  }

  return new Intl.NumberFormat("en-GB", {
    notation: value >= 1000 ? "compact" : "standard",
    maximumFractionDigits: value >= 1000 ? 1 : 0
  }).format(value);
}

export function formatPercent(value: number | null, digits = 0) {
  if (value == null) {
    return "—";
  }

  return `${value.toFixed(digits)}%`;
}

export function formatScore(value: number | null) {
  if (value == null) {
    return "—";
  }

  return `${value.toFixed(1)}/5`;
}

export function formatDurationShort(seconds: number | null) {
  if (seconds == null || Number.isNaN(seconds)) {
    return "—";
  }

  if (seconds < 60) {
    return `${Math.round(seconds)}s`;
  }

  if (seconds < 60 * 60) {
    const minutes = seconds / 60;
    return `${minutes < 10 ? minutes.toFixed(1) : Math.round(minutes)}m`;
  }

  const hours = seconds / (60 * 60);
  return `${hours < 10 ? hours.toFixed(1) : Math.round(hours)}h`;
}

export function formatDurationLong(seconds: number | null) {
  if (seconds == null || Number.isNaN(seconds)) {
    return "—";
  }

  if (seconds < 60) {
    return `${Math.round(seconds)}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);

  if (minutes < 60) {
    return `${minutes}m ${remainingSeconds}s`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}

function formatDateRangeLabel(start: Date, end: Date) {
  const inclusiveEnd = addDays(end, -1);
  return `${DAY_FORMATTER.format(start)} - ${DAY_FORMATTER.format(inclusiveEnd)}`;
}

export function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateInput(value: string) {
  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) {
    return null;
  }

  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function resolveDateRange(
  preset: AnalyticsDatePreset,
  customStart: string,
  customEnd: string
): ResolvedDateRange {
  const now = new Date();
  const today = startOfDay(now);
  let start = addDays(today, -6);
  let end = addDays(today, 1);

  switch (preset) {
    case "today":
      start = today;
      end = addDays(today, 1);
      break;
    case "yesterday":
      start = addDays(today, -1);
      end = today;
      break;
    case "30d":
      start = addDays(today, -29);
      end = addDays(today, 1);
      break;
    case "90d":
      start = addDays(today, -89);
      end = addDays(today, 1);
      break;
    case "thisMonth":
      start = startOfMonth(today);
      end = addDays(today, 1);
      break;
    case "lastMonth":
      start = startOfMonth(addMonths(today, -1));
      end = startOfMonth(today);
      break;
    case "custom": {
      const parsedStart = parseDateInput(customStart);
      const parsedEnd = parseDateInput(customEnd);

      if (parsedStart && parsedEnd) {
        start = startOfDay(parsedStart);
        end = addDays(startOfDay(parsedEnd), 1);
      }
      break;
    }
    case "7d":
    default:
      start = addDays(today, -6);
      end = addDays(today, 1);
      break;
  }

  if (end <= start) {
    end = addDays(start, 1);
  }

  const duration = end.getTime() - start.getTime();
  const previousEnd = new Date(start);
  const previousStart = new Date(start.getTime() - duration);

  return {
    start,
    end,
    previousStart,
    previousEnd,
    label: formatDateRangeLabel(start, end)
  };
}

export function filterConversations(
  conversations: AnalyticsConversationRecord[],
  start: Date,
  end: Date
) {
  return conversations.filter((conversation) => {
    const createdAt = new Date(conversation.createdAt).getTime();
    return createdAt >= start.getTime() && createdAt < end.getTime();
  });
}

export function filterReplyEvents(replyEvents: AnalyticsReplyEventRecord[], start: Date, end: Date) {
  return replyEvents.filter((event) => {
    const createdAt = new Date(event.createdAt).getTime();
    return createdAt >= start.getTime() && createdAt < end.getTime();
  });
}

function percentageChange(current: number | null, previous: number | null) {
  if (current == null || previous == null || previous === 0) {
    return null;
  }

  return ((current - previous) / Math.abs(previous)) * 100;
}

function pointsChange(current: number | null, previous: number | null) {
  if (current == null || previous == null) {
    return null;
  }

  return current - previous;
}

function buildPercentBadge(
  delta: number | null,
  positiveWhen: "up" | "down" = "up",
  digits = 0
): StatBadge | null {
  if (delta == null || Number.isNaN(delta)) {
    return null;
  }

  if (Math.abs(delta) < 0.05) {
    return { tone: "neutral", value: "—" };
  }

  const improved = positiveWhen === "up" ? delta > 0 : delta < 0;
  return {
    tone: improved ? "positive" : "negative",
    value: `${delta > 0 ? "+" : ""}${delta.toFixed(digits)}%`
  };
}

function buildPointsBadge(delta: number | null, digits = 0): StatBadge | null {
  if (delta == null || Number.isNaN(delta)) {
    return null;
  }

  if (Math.abs(delta) < 0.05) {
    return { tone: "neutral", value: "—" };
  }

  return {
    tone: delta > 0 ? "positive" : "negative",
    value: `${delta > 0 ? "+" : ""}${delta.toFixed(digits)}`
  };
}

export function helpfulScore(conversations: AnalyticsConversationRecord[]) {
  const feedback = conversations.filter((conversation) => conversation.helpful != null);
  if (!feedback.length) {
    return null;
  }

  const positive = feedback.filter((conversation) => conversation.helpful).length;
  const rate = positive / feedback.length;
  return 1 + rate * 4;
}

export function buildStatSummary(
  currentConversations: AnalyticsConversationRecord[],
  previousConversations: AnalyticsConversationRecord[]
) {
  const currentTotal = currentConversations.length;
  const previousTotal = previousConversations.length;

  const currentAvgResponse = average(
    currentConversations
      .map((conversation) => conversation.firstResponseSeconds)
      .filter((value): value is number => value != null)
  );

  const previousAvgResponse = average(
    previousConversations
      .map((conversation) => conversation.firstResponseSeconds)
      .filter((value): value is number => value != null)
  );

  const currentResolutionRate = currentTotal
    ? (currentConversations.filter((conversation) => conversation.status === "resolved").length / currentTotal) * 100
    : null;

  const previousResolutionRate = previousTotal
    ? (previousConversations.filter((conversation) => conversation.status === "resolved").length / previousTotal) * 100
    : null;

  const currentSatisfaction = helpfulScore(currentConversations);
  const previousSatisfaction = helpfulScore(previousConversations);

  return {
    total: {
      label: "Total conversations",
      value: formatCompactNumber(currentTotal),
      badge: buildPercentBadge(percentageChange(currentTotal, previousTotal), "up", 0),
      previousLabel: `vs ${formatCompactNumber(previousTotal)} last period`,
      currentValue: currentTotal,
      previousValue: previousTotal
    },
    responseTime: {
      label: "Avg response time",
      value: formatDurationShort(currentAvgResponse),
      badge:
        currentAvgResponse != null && previousAvgResponse != null && previousAvgResponse > 0
          ? buildPercentBadge(
              ((previousAvgResponse - currentAvgResponse) / previousAvgResponse) * 100,
              "up",
              0
            )
          : null,
      previousLabel: `vs ${formatDurationShort(previousAvgResponse)} last period`,
      currentValue: currentAvgResponse,
      previousValue: previousAvgResponse
    },
    resolutionRate: {
      label: "Resolution rate",
      value: formatPercent(currentResolutionRate, 0),
      badge: buildPointsBadge(pointsChange(currentResolutionRate, previousResolutionRate), 0),
      previousLabel: `vs ${formatPercent(previousResolutionRate, 0)} last period`,
      currentValue: currentResolutionRate,
      previousValue: previousResolutionRate
    },
    satisfaction: {
      label: "Satisfaction score",
      value: formatScore(currentSatisfaction),
      badge: buildPointsBadge(pointsChange(currentSatisfaction, previousSatisfaction), 1),
      previousLabel: `vs ${formatScore(previousSatisfaction)} last period`,
      currentValue: currentSatisfaction,
      previousValue: previousSatisfaction
    }
  };
}

export function buildConversationBucketLabel(date: Date, granularity: AnalyticsGranularity) {
  if (granularity === "monthly") {
    return new Intl.DateTimeFormat("en-GB", {
      month: "short"
    }).format(date);
  }

  return AXIS_DAY_FORMATTER.format(date);
}

export function buildConversationBucketDescription(start: Date, end: Date, granularity: AnalyticsGranularity) {
  const inclusiveEnd = addDays(end, -1);

  if (granularity === "monthly") {
    return MONTH_FORMATTER.format(start);
  }

  if (granularity === "weekly") {
    return `${AXIS_DAY_FORMATTER.format(start)} - ${AXIS_DAY_FORMATTER.format(inclusiveEnd)}`;
  }

  return DAY_FORMATTER.format(start);
}

export type { ChartPoint };
