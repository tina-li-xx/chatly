import type { Route } from "next";
import type { PublishingSection } from "./dashboard-publishing-types";

const VALID_PUBLISHING_SECTIONS = new Set<PublishingSection>(["overview", "strategy", "plans", "drafts", "queue"]);

export function resolvePublishingSection(value: string | null | undefined): PublishingSection {
  const section = String(value ?? "").trim();
  return VALID_PUBLISHING_SECTIONS.has(section as PublishingSection) ? (section as PublishingSection) : "overview";
}

export function buildPublishingSectionHref(section: PublishingSection) {
  return `/dashboard/publishing?section=${section}` as Route;
}
