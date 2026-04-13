import type { SeoPlanItemRow, SeoPlanRunRow } from "@/lib/repositories/seo-pipeline-repository-shared";

export const DASHBOARD_PUBLISHING_PLAN_ENGINE_VERSION = "keyword-corpus-v2";
export const DASHBOARD_PUBLISHING_NEXT_RUN_THRESHOLD = 10;

export type DashboardPublishingPlanRunRole = "current" | "upcoming" | "historical";

function summaryRecord(summary: unknown) {
  return summary && typeof summary === "object" ? summary as Record<string, unknown> : {};
}

export function isDashboardPublishingPlanRun(summary: unknown) {
  return summaryRecord(summary).planEngineVersion === DASHBOARD_PUBLISHING_PLAN_ENGINE_VERSION;
}

export function readDashboardPublishingPlanRunRole(summary: unknown): DashboardPublishingPlanRunRole | null {
  if (!isDashboardPublishingPlanRun(summary)) return null;
  const role = summaryRecord(summary).runRole;
  return role === "upcoming" || role === "historical" ? role : "current";
}

export function withDashboardPublishingPlanRunRole(
  summary: unknown,
  role: DashboardPublishingPlanRunRole,
  extra: Record<string, unknown> = {}
) {
  return {
    ...summaryRecord(summary),
    ...extra,
    planEngineVersion: DASHBOARD_PUBLISHING_PLAN_ENGINE_VERSION,
    runRole: role
  };
}

export function countRemainingPlannedItems(items: SeoPlanItemRow[]) {
  return items.filter((item) => item.status === "planned").length;
}

export function latestPlanTargetPublishAt(items: SeoPlanItemRow[]) {
  return items
    .map((item) => item.target_publish_at)
    .filter((value): value is string => typeof value === "string" && Number.isFinite(Date.parse(value)))
    .sort((left, right) => Date.parse(right) - Date.parse(left))[0] ?? null;
}

export function currentAndUpcomingRuns(input: Array<{ run: SeoPlanRunRow; items: SeoPlanItemRow[] }>) {
  const compatible = input
    .map(({ run, items }) => ({ run, items, role: readDashboardPublishingPlanRunRole(run.summary_json) }))
    .filter((entry): entry is { run: SeoPlanRunRow; items: SeoPlanItemRow[]; role: DashboardPublishingPlanRunRole } => entry.role !== null);

  return {
    compatible,
    current: compatible.find((entry) => entry.role === "current") ?? null,
    upcoming: compatible.find((entry) => entry.role === "upcoming") ?? null
  };
}
