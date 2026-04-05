const DEFAULT_SEND_HOUR = 9;
const DEFAULT_SEND_MINUTE = 0;

export function clampWeeklyReportSendHour(value: number | null | undefined) {
  if (!Number.isFinite(value)) {
    return DEFAULT_SEND_HOUR;
  }

  return Math.min(23, Math.max(0, Math.round(Number(value))));
}

export function clampWeeklyReportSendMinute(value: number | null | undefined) {
  if (!Number.isFinite(value)) {
    return DEFAULT_SEND_MINUTE;
  }

  return Math.min(59, Math.max(0, Math.round(Number(value))));
}

export function formatWeeklyReportSendTime(hour: number | null | undefined, minute: number | null | undefined) {
  return `${String(clampWeeklyReportSendHour(hour)).padStart(2, "0")}:${String(clampWeeklyReportSendMinute(minute)).padStart(2, "0")}`;
}

export function parseWeeklyReportSendTime(value: string | null | undefined) {
  const match = typeof value === "string" ? value.trim().match(/^(\d{2}):(\d{2})$/) : null;
  if (!match) {
    return {
      hour: DEFAULT_SEND_HOUR,
      minute: DEFAULT_SEND_MINUTE
    };
  }

  return {
    hour: clampWeeklyReportSendHour(Number(match[1])),
    minute: clampWeeklyReportSendMinute(Number(match[2]))
  };
}
