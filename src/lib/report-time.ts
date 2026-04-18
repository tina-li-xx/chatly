import { REPORT_SEND_TIME } from "@/lib/job-schedules";
import { DEFAULT_TIME_ZONE, normalizeTimeZone } from "@/lib/timezones";
import {
  clampWeeklyReportSendHour,
  clampWeeklyReportSendMinute
} from "@/lib/weekly-report-send-time";

function getPartValue(
  value: Date,
  timeZone: string,
  partType: "year" | "month" | "day" | "hour" | "minute"
) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  })
    .formatToParts(value)
    .find((part) => part.type === partType)?.value;
}

function dateKeyFromDate(value: Date) {
  return value.toISOString().slice(0, 10);
}

function dateFromKey(value: string) {
  return new Date(`${value}T12:00:00.000Z`);
}

export function resolveReportTimeZone(value: string | null | undefined) {
  return normalizeTimeZone(value, DEFAULT_TIME_ZONE);
}

export function dateKeyInTimeZone(value: Date, timeZone: string) {
  const year = getPartValue(value, timeZone, "year");
  const month = getPartValue(value, timeZone, "month");
  const day = getPartValue(value, timeZone, "day");
  return year && month && day ? `${year}-${month}-${day}` : dateKeyFromDate(value);
}

export function localHour(value: Date, timeZone: string) {
  const hour = getPartValue(value, timeZone, "hour");
  return hour ? Number(hour) : value.getUTCHours();
}

export function localMinute(value: Date, timeZone: string) {
  const minute = getPartValue(value, timeZone, "minute");
  return minute ? Number(minute) : value.getUTCMinutes();
}

function hasReachedLocalSendTime(
  now: Date,
  timeZone: string,
  sendHour: number | null | undefined,
  sendMinute: number | null | undefined
) {
  const hour = localHour(now, timeZone);
  const minute = localMinute(now, timeZone);
  const targetHour = clampWeeklyReportSendHour(sendHour ?? REPORT_SEND_TIME.hour);
  const targetMinute = clampWeeklyReportSendMinute(sendMinute ?? REPORT_SEND_TIME.minute);

  return hour > targetHour || (hour === targetHour && minute >= targetMinute);
}

export function shiftDateKey(value: string, days: number) {
  const next = dateFromKey(value);
  next.setUTCDate(next.getUTCDate() + days);
  return dateKeyFromDate(next);
}

export function formatDateKeyLabel(value: string, month: "long" | "short" = "long") {
  return new Intl.DateTimeFormat("en-US", {
    month,
    day: "numeric",
    ...(month === "long" ? { year: "numeric" as const } : {}),
    timeZone: "UTC"
  }).format(dateFromKey(value));
}

export function shouldRunDailyReport(
  now = new Date(),
  timeZone: string | null | undefined = DEFAULT_TIME_ZONE,
  sendHour: number = REPORT_SEND_TIME.hour,
  sendMinute: number = REPORT_SEND_TIME.minute
) {
  return hasReachedLocalSendTime(now, resolveReportTimeZone(timeZone), sendHour, sendMinute);
}

export function dailyDeliveryDateKey(
  now = new Date(),
  timeZone: string | null | undefined = DEFAULT_TIME_ZONE
) {
  return shiftDateKey(dateKeyInTimeZone(now, resolveReportTimeZone(timeZone)), -1);
}

export function isConversationOnDateKey(
  createdAt: string,
  targetDateKey: string,
  timeZone: string | null | undefined = DEFAULT_TIME_ZONE
) {
  return dateKeyInTimeZone(new Date(createdAt), resolveReportTimeZone(timeZone)) === targetDateKey;
}

export function weekStartDateKey(value: string) {
  const date = dateFromKey(value);
  return shiftDateKey(value, date.getUTCDay() === 0 ? -6 : 1 - date.getUTCDay());
}

export function shouldRunWeeklyReport(
  now = new Date(),
  timeZone: string | null | undefined = DEFAULT_TIME_ZONE,
  sendHour: number = REPORT_SEND_TIME.hour,
  sendMinute: number = REPORT_SEND_TIME.minute
) {
  const resolvedTimeZone = resolveReportTimeZone(timeZone);
  const localDateKey = dateKeyInTimeZone(now, resolvedTimeZone);
  return (
    localDateKey !== weekStartDateKey(localDateKey) ||
    hasReachedLocalSendTime(now, resolvedTimeZone, sendHour, sendMinute)
  );
}

export function previousLocalWeekStartDateKey(
  now = new Date(),
  timeZone: string | null | undefined = DEFAULT_TIME_ZONE
) {
  return shiftDateKey(weekStartDateKey(dateKeyInTimeZone(now, resolveReportTimeZone(timeZone))), -7);
}

export function isConversationInLocalWeek(
  createdAt: string,
  weekStart: string,
  timeZone: string | null | undefined = DEFAULT_TIME_ZONE
) {
  const localDateKey = dateKeyInTimeZone(new Date(createdAt), resolveReportTimeZone(timeZone));
  return localDateKey >= weekStart && localDateKey < shiftDateKey(weekStart, 7);
}
