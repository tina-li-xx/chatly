import { dateKeyInTimeZone, localHour, resolveReportTimeZone } from "@/lib/report-time";

export const WEEKLY_HEATMAP_DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
export const WEEKLY_HEATMAP_HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
export const WEEKLY_HEATMAP_HOUR_LABELS = ["8am", "9", "10", "11", "12", "1pm", "2", "3", "4", "5", "6", "7"];

export function average(values: Array<number | null | undefined>) {
  const numbers = values.filter((value): value is number => typeof value === "number");
  return numbers.length ? numbers.reduce((sum, value) => sum + value, 0) / numbers.length : null;
}

export function percent(value: number | null) {
  return value == null ? "—" : `${Math.round(value)}%`;
}

export function formatDuration(seconds: number | null) {
  if (seconds == null) {
    return "—";
  }

  if (seconds < 60) {
    return `${Math.round(seconds)}s`;
  }

  if (seconds < 3600) {
    return `${(seconds / 60).toFixed(seconds < 600 ? 1 : 0)} min`;
  }

  return `${(seconds / 3600).toFixed(1)} hr`;
}

export function formatSatisfaction(score: number | null) {
  return score == null ? "—" : `${score.toFixed(1)} / 5`;
}

export function pageLabelFromUrl(value: string | null) {
  if (!value) {
    return "/ (homepage)";
  }

  try {
    const path = new URL(value).pathname || "/";
    return path === "/" ? "/ (homepage)" : path;
  } catch {
    return value;
  }
}

export function truncateLabel(value: string, limit = 40) {
  return value.length <= limit ? value : `${value.slice(0, limit - 3)}...`;
}

export function weeklyLocalDayIndex(createdAt: string, timeZone: string) {
  const dateKey = dateKeyInTimeZone(new Date(createdAt), resolveReportTimeZone(timeZone));
  const date = new Date(`${dateKey}T12:00:00.000Z`);
  return (date.getUTCDay() + 6) % 7;
}

export function weeklyLocalHour(createdAt: string, timeZone: string) {
  return localHour(new Date(createdAt), resolveReportTimeZone(timeZone));
}

export function heatmapIntensity(count: number, thresholds: {
  low: number;
  medium: number;
  high: number;
  peak: number;
}) {
  if (count <= 0) {
    return "empty" as const;
  }
  if (count <= thresholds.low) {
    return "low" as const;
  }
  if (count <= thresholds.medium) {
    return "medium" as const;
  }
  if (count <= thresholds.high) {
    return "high" as const;
  }
  return "peak" as const;
}

export function percentileThreshold(values: number[], percentile: number) {
  if (!values.length) {
    return 0;
  }

  const sorted = [...values].sort((left, right) => left - right);
  const index = Math.min(sorted.length - 1, Math.floor((sorted.length - 1) * percentile));
  return sorted[index] ?? 0;
}

export function peakTimeRange(hour: number) {
  const label = (value: number) => {
    const suffix = value >= 12 ? "pm" : "am";
    const hour12 = value % 12 || 12;
    return `${hour12}${suffix}`;
  };

  return `${label(hour)}-${label((hour + 1) % 24)}`;
}
