import type { DashboardAutomationRuleCondition } from "@/lib/data/settings-types";
import { optionalText } from "@/lib/utils";
import type { VisitorRoutingProfile } from "@/lib/visitor-routing-profile";

type RoutingMatchContext = {
  content: string;
  metadata: {
    pageUrl?: string | null;
    referrer?: string | null;
    country?: string | null;
  };
  visitorProfile: VisitorRoutingProfile;
};

function normalizeLower(value: string | null | undefined) {
  return optionalText(value)?.toLowerCase() ?? "";
}

function splitRuleTerms(value: string) {
  return value
    .split(",")
    .map((entry) => normalizeLower(entry))
    .filter(Boolean);
}

function matchesContains(value: string | null | undefined, ruleValue: string) {
  const haystack = normalizeLower(value);
  return splitRuleTerms(ruleValue).some((needle) => haystack.includes(needle));
}

function matchesExact(value: string | null | undefined, ruleValue: string) {
  const haystack = normalizeLower(value);
  return splitRuleTerms(ruleValue).some((needle) => haystack === needle);
}

function matchesStartsWith(value: string | null | undefined, ruleValue: string) {
  const haystack = normalizeLower(value);
  return splitRuleTerms(ruleValue).some((needle) => haystack.startsWith(needle));
}

function matchesVisitorTag(ruleValue: string, visitorProfile: VisitorRoutingProfile) {
  const tags = visitorProfile.tags.map((tag) => normalizeLower(tag));
  return splitRuleTerms(ruleValue).some((needle) => tags.includes(needle));
}

function matchesCustomField(ruleValue: string, visitorProfile: VisitorRoutingProfile) {
  return ruleValue
    .split(",")
    .map((entry) => entry.trim())
    .some((entry) => {
      const separatorIndex = entry.indexOf("=");
      if (separatorIndex < 1) {
        return false;
      }

      const field = normalizeLower(entry.slice(0, separatorIndex));
      const value = normalizeLower(entry.slice(separatorIndex + 1));
      return Boolean(field && value && normalizeLower(visitorProfile.customFields[field]) === value);
    });
}

export function needsVisitorRoutingProfile(condition: DashboardAutomationRuleCondition) {
  return condition === "visitor_tag" || condition === "custom_field_equals";
}

export function matchesRoutingCondition(
  condition: DashboardAutomationRuleCondition,
  ruleValue: string,
  context: RoutingMatchContext
) {
  if (!optionalText(ruleValue)) {
    return false;
  }

  switch (condition) {
    case "page_url_contains":
      return matchesContains(context.metadata.pageUrl, ruleValue);
    case "page_url_exact":
      return matchesExact(context.metadata.pageUrl, ruleValue);
    case "page_url_starts_with":
      return matchesStartsWith(context.metadata.pageUrl, ruleValue);
    case "first_message_contains":
      return matchesContains(context.content, ruleValue);
    case "referrer_contains":
      return matchesContains(context.metadata.referrer, ruleValue);
    case "visitor_location":
      return matchesExact(context.metadata.country, ruleValue);
    case "visitor_tag":
      return matchesVisitorTag(ruleValue, context.visitorProfile);
    case "custom_field_equals":
      return matchesCustomField(ruleValue, context.visitorProfile);
    default:
      return false;
  }
}
