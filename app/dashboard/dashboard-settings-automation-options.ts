import type {
  DashboardAutomationAwayWhen,
  DashboardAutomationPromptDelaySeconds,
  DashboardAutomationRuleCondition
} from "@/lib/data/settings-types";
import type { WidgetResponseTimeMode } from "@/lib/types";

export const AWAY_TRIGGER_OPTIONS: Array<{ value: DashboardAutomationAwayWhen; label: string }> = [
  { value: "team_offline", label: "When no team members are online" },
  { value: "outside_office_hours", label: "Outside office hours" },
  { value: "either", label: "Both" }
];

export const EXPECTED_REPLY_TIME_OPTIONS: Array<{ value: WidgetResponseTimeMode; label: string }> = [
  { value: "minutes", label: "Usually replies in minutes" },
  { value: "hours", label: "Usually replies in a few hours" },
  { value: "day", label: "Usually replies within a day" },
  { value: "hidden", label: "Don't show" }
];

export const RESPONSE_MINUTE_OPTIONS = [1, 2, 3, 5, 10] as const;
export const PROMPT_DELAY_OPTIONS: Array<{ value: DashboardAutomationPromptDelaySeconds; label: string }> = [
  { value: 0, label: "Immediately" },
  { value: 10, label: "10 seconds" },
  { value: 30, label: "30 seconds" },
  { value: 60, label: "1 minute" },
  { value: 120, label: "2 minutes" },
  { value: 300, label: "5 minutes" }
];

export const ROUTING_CONDITION_OPTIONS: Array<{ value: DashboardAutomationRuleCondition; label: string }> = [
  { value: "page_url_contains", label: "Page URL contains" },
  { value: "page_url_exact", label: "Page URL is exactly" },
  { value: "page_url_starts_with", label: "Page URL starts with" },
  { value: "first_message_contains", label: "First message contains" },
  { value: "referrer_contains", label: "Referrer contains" },
  { value: "visitor_location", label: "Visitor location is" },
  { value: "visitor_tag", label: "Visitor tag is" },
  { value: "custom_field_equals", label: "Custom field equals" }
];

export function replyTimePreview(value: WidgetResponseTimeMode) {
  return EXPECTED_REPLY_TIME_OPTIONS.find((option) => option.value === value)?.label ?? "";
}

export function promptDelayLabel(value: DashboardAutomationPromptDelaySeconds) {
  const label = PROMPT_DELAY_OPTIONS.find((option) => option.value === value)?.label ?? "30 seconds";
  return value === 0 ? label : `After ${label}`;
}

export function createAutomationId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}
