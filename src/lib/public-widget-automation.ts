import type { DashboardAutomationSettings } from "@/lib/data/settings-types";
import type { Site } from "@/lib/types";
import { matchAutomationFaqs } from "@/lib/automation-faq-matching";
export {
  getWidgetProactivePrompt,
  matchesWidgetProactivePagePath,
  type WidgetProactivePrompt
} from "@/lib/widget-proactive-prompts";

export type WidgetFaqSuggestions = {
  items: Array<{
    id: string;
    question: string;
    answer: string;
    link: string;
  }>;
  fallbackMessage: string;
};

const ONLINE_GRACE_PERIOD_MS = 5 * 60 * 1000;

const WEEKDAY_TO_KEY = {
  Monday: "monday",
  Tuesday: "tuesday",
  Wednesday: "wednesday",
  Thursday: "thursday",
  Friday: "friday",
  Saturday: "saturday",
  Sunday: "sunday"
} as const;

function parseClockMinutes(value: string) {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) {
    return null;
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) {
    return null;
  }

  return (hours * 60) + minutes;
}

function getLocalScheduleParts(timeZone: string, now: Date) {
  try {
    const formatter = new Intl.DateTimeFormat("en-GB", {
      timeZone,
      weekday: "long",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23"
    });
    const parts = formatter.formatToParts(now);
    const weekday = parts.find((part) => part.type === "weekday")?.value ?? "Monday";
    const hour = Number(parts.find((part) => part.type === "hour")?.value ?? "0");
    const minute = Number(parts.find((part) => part.type === "minute")?.value ?? "0");

    return {
      weekday: WEEKDAY_TO_KEY[weekday as keyof typeof WEEKDAY_TO_KEY] ?? "monday",
      minutes: (hour * 60) + minute
    };
  } catch {
    return {
      weekday: "monday" as const,
      minutes: 0
    };
  }
}

export function isWidgetTeamOnline(lastSeenAt: string | null, now = new Date()) {
  if (!lastSeenAt) {
    return false;
  }

  return now.getTime() - new Date(lastSeenAt).getTime() <= ONLINE_GRACE_PERIOD_MS;
}

export function isOutsideWidgetOperatingHours(
  site: Pick<Site, "operatingHoursEnabled" | "operatingHoursTimezone" | "operatingHours">,
  now = new Date()
) {
  if (!site.operatingHoursEnabled) {
    return false;
  }

  const schedule = site.operatingHours;
  const { weekday, minutes } = getLocalScheduleParts(site.operatingHoursTimezone || "UTC", now);
  const hours = schedule[weekday];
  if (!hours?.enabled) {
    return true;
  }

  const fromMinutes = parseClockMinutes(hours.from);
  const toMinutes = parseClockMinutes(hours.to);
  if (fromMinutes === null || toMinutes === null) {
    return true;
  }

  return minutes < fromMinutes || minutes >= toMinutes;
}

export function shouldSendWidgetAutoReply(input: {
  site: Pick<Site, "operatingHoursEnabled" | "operatingHoursTimezone" | "operatingHours">;
  automation: DashboardAutomationSettings;
  isNewConversation: boolean;
  lastSeenAt: string | null;
  now?: Date;
}) {
  if (!input.isNewConversation || !input.automation.offline.autoReplyEnabled) {
    return false;
  }

  const now = input.now ?? new Date();
  const teamOffline = !isWidgetTeamOnline(input.lastSeenAt, now);
  const outsideOfficeHours = isOutsideWidgetOperatingHours(input.site, now);

  switch (input.automation.offline.autoReplyWhen) {
    case "outside_office_hours":
      return outsideOfficeHours;
    case "either":
      return teamOffline || outsideOfficeHours;
    default:
      return teamOffline;
  }
}

export function getWidgetFaqSuggestions(input: {
  automation: DashboardAutomationSettings;
  content: string;
  isNewConversation: boolean;
}): WidgetFaqSuggestions | null {
  if (!input.isNewConversation || !input.automation.speed.faqSuggestionsEnabled || input.automation.speed.faqSource !== "manual") {
    return null;
  }

  const matches = matchAutomationFaqs(input.automation.speed.manualFaqs, input.content, { limit: 3 }).map(
    ({ id, question, answer, link }) => ({
      id,
      question,
      answer,
      link
    })
  );

  if (!matches.length) {
    return null;
  }

  return {
    items: matches,
    fallbackMessage: input.automation.speed.faqFallbackMessage
  };
}
