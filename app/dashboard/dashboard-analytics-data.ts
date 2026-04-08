"use client";

import type { AnalyticsConversationRecord, AnalyticsReplyEventRecord } from "@/lib/data/analytics";
import { displayNameFromEmail, initialsFromLabel } from "@/lib/user-display";
import { pageLabelFromUrl } from "./dashboard-ui";
import {
  addDays,
  average,
  buildConversationBucketDescription,
  buildConversationBucketLabel,
  formatDurationShort,
  averageRatingScore,
  startOfWeek,
  type ChartPoint
} from "./dashboard-analytics-core";
import type {
  AnalyticsGranularity,
  HeatMapCell,
  RatingBreakdown,
  ResolvedDateRange,
  TagBreakdown,
  TeamRow
} from "./dashboard-analytics-types";

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function alignToGranularity(date: Date, granularity: AnalyticsGranularity) {
  if (granularity === "weekly") {
    return startOfWeek(date);
  }

  if (granularity === "monthly") {
    return startOfMonth(date);
  }

  return startOfDay(date);
}

function addGranularity(date: Date, granularity: AnalyticsGranularity) {
  if (granularity === "weekly") {
    return addDays(date, 7);
  }

  if (granularity === "monthly") {
    return new Date(date.getFullYear(), date.getMonth() + 1, 1);
  }

  return addDays(date, 1);
}

export function buildConversationChartPoints(
  conversations: AnalyticsConversationRecord[],
  range: ResolvedDateRange,
  granularity: AnalyticsGranularity
) {
  const points: ChartPoint[] = [];
  let cursor = alignToGranularity(range.start, granularity);

  while (cursor < range.end) {
    const next = addGranularity(cursor, granularity);
    const bucketStart = cursor < range.start ? range.start : cursor;
    const bucketEnd = next > range.end ? range.end : next;
    const count = conversations.filter((conversation) => {
      const value = new Date(conversation.createdAt).getTime();
      return value >= bucketStart.getTime() && value < bucketEnd.getTime();
    }).length;

    points.push({
      label: buildConversationBucketLabel(bucketStart, granularity),
      sublabel: `${buildConversationBucketDescription(bucketStart, bucketEnd, granularity)} • ${count} conversations`,
      value: count
    });

    cursor = next;
  }

  return points;
}

export function buildResponseBuckets(
  conversations: AnalyticsConversationRecord[],
  range: ResolvedDateRange,
  granularity: AnalyticsGranularity
) {
  const buckets: ChartPoint[] = [];
  let cursor = alignToGranularity(range.start, granularity);

  while (cursor < range.end) {
    const next = addGranularity(cursor, granularity);
    const bucketStart = cursor < range.start ? range.start : cursor;
    const bucketEnd = next > range.end ? range.end : next;
    const values = conversations
      .filter((conversation) => {
        const createdAt = new Date(conversation.createdAt).getTime();
        return createdAt >= bucketStart.getTime() && createdAt < bucketEnd.getTime();
      })
      .map((conversation) => conversation.firstResponseSeconds)
      .filter((value): value is number => value != null);

    buckets.push({
      label: buildConversationBucketLabel(bucketStart, granularity),
      sublabel: `${buildConversationBucketDescription(bucketStart, bucketEnd, granularity)} • ${
        values.length ? formatDurationShort(average(values)) : "—"
      }`,
      value: average(values) ?? 0
    });

    cursor = next;
  }

  return buckets;
}

export function buildHeatMap(conversations: AnalyticsConversationRecord[]) {
  const counts = Array.from({ length: 7 }, () => Array.from({ length: 24 }, () => 0));

  conversations.forEach((conversation) => {
    const date = new Date(conversation.createdAt);
    const jsDay = date.getDay();
    const dayIndex = jsDay === 0 ? 6 : jsDay - 1;
    counts[dayIndex][date.getHours()] += 1;
  });

  const maxCount = Math.max(0, ...counts.flat());

  return counts.map((row, dayIndex) =>
    row.map((value, hourIndex) => {
      let level: 0 | 1 | 2 | 3 | 4 = 0;

      if (value > 0 && maxCount > 0) {
        const ratio = value / maxCount;
        if (ratio >= 0.8) {
          level = 4;
        } else if (ratio >= 0.55) {
          level = 3;
        } else if (ratio >= 0.3) {
          level = 2;
        } else {
          level = 1;
        }
      }

      return {
        dayLabel: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][dayIndex],
        hourLabel: `${hourIndex}:00 - ${hourIndex + 1}:00`,
        value,
        level
      } satisfies HeatMapCell;
    })
  );
}

export function buildTopPages(conversations: AnalyticsConversationRecord[]) {
  const counts = new Map<string, number>();

  conversations.forEach((conversation) => {
    const page = pageLabelFromUrl(conversation.pageUrl);
    counts.set(page, (counts.get(page) ?? 0) + 1);
  });

  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, 6)
    .map(([page, count]) => ({ page, count }));
}

export function buildRatingBreakdown(conversations: AnalyticsConversationRecord[]): RatingBreakdown[] {
  const ratings = conversations
    .map((conversation) => conversation.rating)
    .filter((value): value is 1 | 2 | 3 | 4 | 5 => value != null);

  const total = ratings.length;

  return [5, 4, 3, 2, 1].map((rating) => {
    const count = ratings.filter((value) => value === rating).length;
    return {
      rating,
      count,
      percent: total ? (count / total) * 100 : 0
    };
  });
}

function tagColorClass(tag: string) {
  const normalized = tag.toLowerCase();

  if (normalized.includes("pricing")) {
    return "bg-blue-500";
  }
  if (normalized.includes("support")) {
    return "bg-green-500";
  }
  if (normalized.includes("feature")) {
    return "bg-violet-500";
  }
  if (normalized.includes("bug")) {
    return "bg-red-500";
  }
  if (normalized.includes("sales")) {
    return "bg-amber-500";
  }

  return "bg-slate-400";
}

function tagStrokeColor(tag: string) {
  const normalized = tag.toLowerCase();

  if (normalized.includes("pricing")) {
    return "#3B82F6";
  }
  if (normalized.includes("support")) {
    return "#10B981";
  }
  if (normalized.includes("feature")) {
    return "#8B5CF6";
  }
  if (normalized.includes("bug")) {
    return "#EF4444";
  }
  if (normalized.includes("sales")) {
    return "#F59E0B";
  }

  return "#94A3B8";
}

export function buildTagBreakdown(conversations: AnalyticsConversationRecord[]): TagBreakdown[] {
  const counts = new Map<string, number>();

  conversations.forEach((conversation) => {
    conversation.tags.forEach((tag) => {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    });
  });

  const total = [...counts.values()].reduce((sum, value) => sum + value, 0);

  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, 6)
    .map(([label, count]) => ({
      label,
      count,
      share: total ? count / total : 0,
      colorClass: tagColorClass(label),
      strokeColor: tagStrokeColor(label)
    }));
}

export function buildTeamRows(conversations: AnalyticsConversationRecord[], userEmail: string): TeamRow[] {
  const displayName = displayNameFromEmail(userEmail);
  const avgResponse = average(
    conversations
      .map((conversation) => conversation.firstResponseSeconds)
      .filter((value): value is number => value != null)
  );

  const satisfaction = averageRatingScore(conversations);
  const resolutionRate = conversations.length
    ? (conversations.filter((conversation) => conversation.status === "resolved").length / conversations.length) * 100
    : null;

  return [
    {
      name: displayName,
      initials: initialsFromLabel(displayName),
      conversations: conversations.length,
      avgResponseSeconds: avgResponse,
      resolutionRate,
      satisfactionScore: satisfaction
    }
  ];
}

export function exportAnalytics(conversations: AnalyticsConversationRecord[], rangeLabel: string) {
  const header = [
    "Conversation ID",
    "Created at",
    "Status",
    "Page",
    "Referrer",
    "First response (seconds)",
    "Resolution (seconds)",
    "Rating",
    "Tags"
  ];

  const rows = conversations.map((conversation) => [
    conversation.id,
    conversation.createdAt,
    conversation.status,
    pageLabelFromUrl(conversation.pageUrl),
    conversation.referrer || "",
    conversation.firstResponseSeconds ?? "",
    conversation.resolutionSeconds ?? "",
    conversation.rating ?? "",
    conversation.tags.join(", ")
  ]);

  const csv = [header, ...rows]
    .map((row) => row.map((value) => `"${String(value).replace(/"/g, "\"\"")}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `chatting-analytics-${rangeLabel.replace(/\s+/g, "-").toLowerCase()}.csv`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
