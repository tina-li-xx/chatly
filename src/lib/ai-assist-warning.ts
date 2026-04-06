import type { BillingPlanKey } from "@/lib/billing-plans";
import type { BillingAccountRow } from "@/lib/repositories/billing-repository";

export type DashboardAiAssistWarningState = "warning" | "limited";
export type DashboardAiAssistWarningEmailKey =
  | "approaching_limit"
  | "limit_reached";

export type DashboardAiAssistWarningBanner = {
  ownerUserId: string;
  planKey: BillingPlanKey;
  state: DashboardAiAssistWarningState;
  used: number;
  limit: number;
  remaining: number;
  percentUsed: number;
  resetsAt: string;
};

export type AiAssistUsageWindow = {
  start: Date;
  next: Date;
  previousStart: Date;
  label: string;
};

function monthBounds(now: Date) {
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const next = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  const previous = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1)
  );
  return { start, next, previous };
}

function isValidDate(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date : null;
}

function daysInUtcMonth(year: number, month: number) {
  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
}

function addUtcMonthsClamped(anchor: Date, months: number) {
  const absoluteMonth = anchor.getUTCMonth() + months;
  const year = anchor.getUTCFullYear() + Math.floor(absoluteMonth / 12);
  const month = ((absoluteMonth % 12) + 12) % 12;
  const day = Math.min(anchor.getUTCDate(), daysInUtcMonth(year, month));
  return new Date(
    Date.UTC(
      year,
      month,
      day,
      anchor.getUTCHours(),
      anchor.getUTCMinutes(),
      anchor.getUTCSeconds(),
      anchor.getUTCMilliseconds()
    )
  );
}

function formatUsageWindowLabel(start: Date, next: Date) {
  const short = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short"
  });
  const full = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });

  return `${short.format(start)} - ${full.format(next)}`;
}

function formatFallbackMonthLabel(start: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric"
  }).format(start);
}

export function resolveAiAssistUsageWindow(
  account: Pick<BillingAccountRow, "created_at" | "trial_started_at" | "trial_ends_at">,
  now = new Date()
): AiAssistUsageWindow {
  const trialStart = isValidDate(account.trial_started_at);
  const trialEnd = isValidDate(account.trial_ends_at);
  if (trialStart && trialEnd && trialStart <= now && now < trialEnd) {
    const previousStart = new Date(
      trialStart.getTime() - (trialEnd.getTime() - trialStart.getTime())
    );
    return {
      start: trialStart,
      next: trialEnd,
      previousStart,
      label: formatUsageWindowLabel(trialStart, trialEnd)
    };
  }

  const anchor = trialStart ?? isValidDate(account.created_at);
  if (!anchor) {
    const { start, next, previous } = monthBounds(now);
    return {
      start,
      next,
      previousStart: previous,
      label: formatFallbackMonthLabel(start)
    };
  }

  let months = (now.getUTCFullYear() - anchor.getUTCFullYear()) * 12 +
    (now.getUTCMonth() - anchor.getUTCMonth());
  let start = addUtcMonthsClamped(anchor, months);

  while (start > now) {
    months -= 1;
    start = addUtcMonthsClamped(anchor, months);
  }

  let next = addUtcMonthsClamped(anchor, months + 1);
  while (next <= now) {
    months += 1;
    start = next;
    next = addUtcMonthsClamped(anchor, months + 1);
  }

  return {
    start,
    next,
    previousStart: addUtcMonthsClamped(anchor, months - 1),
    label: formatUsageWindowLabel(start, next)
  };
}

export function resolveAiAssistWarningState(
  used: number,
  limit: number | null
): DashboardAiAssistWarningState | null {
  if (limit == null || limit <= 0) {
    return null;
  }
  if (used >= limit) {
    return "limited";
  }
  return used / limit >= 0.8 ? "warning" : null;
}

export function warningEmailKeyForState(
  state: DashboardAiAssistWarningState | null
): DashboardAiAssistWarningEmailKey | null {
  if (state === "limited") {
    return "limit_reached";
  }
  return state === "warning" ? "approaching_limit" : null;
}

export function buildDashboardAiAssistWarningBanner(input: {
  ownerUserId: string;
  planKey: BillingPlanKey;
  used: number;
  limit: number | null;
  resetsAt: string;
}): DashboardAiAssistWarningBanner | null {
  const state = resolveAiAssistWarningState(input.used, input.limit);
  if (state == null || input.limit == null) {
    return null;
  }

  return {
    ownerUserId: input.ownerUserId,
    planKey: input.planKey,
    state,
    used: input.used,
    limit: input.limit,
    remaining: Math.max(0, input.limit - input.used),
    percentUsed: Math.min(100, Math.round((input.used / input.limit) * 100)),
    resetsAt: input.resetsAt
  };
}
