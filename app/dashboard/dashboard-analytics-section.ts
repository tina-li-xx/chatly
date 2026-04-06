export type AnalyticsSection = "overview" | "conversations" | "teamPerformance" | "aiAssist";
const VALID_ANALYTICS_SECTIONS = new Set<AnalyticsSection>([
  "overview",
  "conversations",
  "teamPerformance",
  "aiAssist"
]);

export function resolveAnalyticsSection(value: string | null | undefined): AnalyticsSection {
  const section = String(value ?? "").trim();
  return VALID_ANALYTICS_SECTIONS.has(section as AnalyticsSection)
    ? (section as AnalyticsSection)
    : "overview";
}

export function buildAnalyticsSectionHref(section: AnalyticsSection) {
  return `/dashboard/analytics?section=${section}`;
}
