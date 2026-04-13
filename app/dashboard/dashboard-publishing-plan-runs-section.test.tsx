import { renderToStaticMarkup } from "react-dom/server";
import { DashboardPublishingPlanRunsSection } from "./dashboard-publishing-plan-runs-section";

vi.mock("./dashboard-publishing-generate-draft-button", () => ({
  DashboardPublishingGenerateDraftButton: () => <button type="button">Generate draft</button>
}));

vi.mock("./dashboard-publishing-regenerate-button", () => ({
  DashboardPublishingRegenerateButton: () => <button type="button">Regenerate topic</button>
}));

describe("dashboard publishing plan runs section", () => {
  it("shows only plan items that are still waiting for drafts", () => {
    const html = renderToStaticMarkup(
      <DashboardPublishingPlanRunsSection
        snapshot={{
          profile: {} as never,
          database: { status: "ready", message: "ok" },
          analysis: null,
          drafts: [],
          planRuns: [
            {
              id: "run_1",
              role: "current",
              status: "ready",
              generatedAt: "2026-04-13T09:00:00.000Z",
              updatedAt: "2026-04-13T09:00:00.000Z",
              itemCount: 2,
              remainingItemCount: 1,
              summary: "Plan summary",
              analysisSource: "ai",
              researchSource: "live",
              items: [
                {
                  id: "item_1",
                  position: 1,
                  title: "Still planned",
                  targetKeyword: "still planned",
                  status: "planned",
                  searchIntent: "commercial",
                  categorySlug: "product",
                  ctaId: "start-free",
                  priorityScore: 100,
                  rationale: "Needs a draft",
                  targetPublishAt: null
                },
                {
                  id: "item_2",
                  position: 2,
                  title: "Already drafted",
                  targetKeyword: "already drafted",
                  status: "drafted",
                  searchIntent: "commercial",
                  categorySlug: "product",
                  ctaId: "start-free",
                  priorityScore: 99,
                  rationale: "Already generated",
                  targetPublishAt: null
                }
              ]
            }
          ]
        }}
      />
    );

    expect(html).toContain("Still planned");
    expect(html).not.toContain("Already drafted");
    expect(html).toContain("1 topics still waiting for drafts");
  });
});
