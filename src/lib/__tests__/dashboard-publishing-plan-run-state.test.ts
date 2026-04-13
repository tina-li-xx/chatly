import {
  countRemainingPlannedItems,
  currentAndUpcomingRuns,
  latestPlanTargetPublishAt,
  readDashboardPublishingPlanRunRole
} from "@/lib/dashboard-publishing-plan-run-state";

describe("dashboard publishing plan run state", () => {
  it("treats versioned runs without an explicit role as current", () => {
    expect(readDashboardPublishingPlanRunRole({ planEngineVersion: "keyword-corpus-v2" })).toBe("current");
  });

  it("extracts current and upcoming runs from compatible entries", () => {
    const result = currentAndUpcomingRuns([
      {
        run: { summary_json: { planEngineVersion: "keyword-corpus-v2", runRole: "upcoming" } } as never,
        items: []
      },
      {
        run: { summary_json: { planEngineVersion: "keyword-corpus-v2", runRole: "current" } } as never,
        items: [{ status: "planned", target_publish_at: "2026-04-20T09:00:00.000Z" }] as never
      }
    ]);

    expect(result.current?.role).toBe("current");
    expect(result.upcoming?.role).toBe("upcoming");
    expect(countRemainingPlannedItems(result.current?.items ?? [])).toBe(1);
    expect(latestPlanTargetPublishAt(result.current?.items ?? [])).toBe("2026-04-20T09:00:00.000Z");
  });
});
