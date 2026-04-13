import type { Route } from "next";
import type { PublishingSection } from "./dashboard-publishing-types";
import type { SwitchboardCustomerFilter } from "./dashboard-switchboard-customers-filter";

export type SwitchboardSection =
  | "overview"
  | "attention"
  | "activity"
  | "customers"
  | "publishing-overview"
  | "publishing-strategy"
  | "publishing-plans"
  | "publishing-drafts"
  | "publishing-queue";

const PUBLISHING_SWITCHBOARD_SECTIONS = {
  "publishing-overview": "overview",
  "publishing-strategy": "strategy",
  "publishing-plans": "plans",
  "publishing-drafts": "drafts",
  "publishing-queue": "queue"
} as const satisfies Record<string, PublishingSection>;

const VALID_SWITCHBOARD_SECTIONS = new Set<SwitchboardSection>([
  "overview",
  "attention",
  "activity",
  "customers",
  "publishing-overview",
  "publishing-strategy",
  "publishing-plans",
  "publishing-drafts",
  "publishing-queue"
]);

export function resolveSwitchboardSection(value: string | null | undefined): SwitchboardSection {
  const section = String(value ?? "").trim();
  return VALID_SWITCHBOARD_SECTIONS.has(section as SwitchboardSection)
    ? (section as SwitchboardSection)
    : "overview";
}

export function getPublishingSectionForSwitchboard(section: SwitchboardSection): PublishingSection | null {
  return PUBLISHING_SWITCHBOARD_SECTIONS[section as keyof typeof PUBLISHING_SWITCHBOARD_SECTIONS] ?? null;
}

export function getSwitchboardSectionForPublishing(section: PublishingSection): SwitchboardSection {
  return (`publishing-${section}`) as SwitchboardSection;
}

export function buildSwitchboardSectionHref(
  section: SwitchboardSection,
  customerFilter: SwitchboardCustomerFilter = "all"
): Route {
  const params = new URLSearchParams({ section });
  if (section === "customers" && customerFilter !== "all") {
    params.set("customerFilter", customerFilter);
  }
  return `/dashboard/switchboard?${params.toString()}` as Route;
}
