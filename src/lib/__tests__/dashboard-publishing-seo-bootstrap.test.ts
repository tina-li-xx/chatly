const mocks = vi.hoisted(() => ({
  getChattingSeoGeneratedPlan: vi.fn(),
  withPostgresAdvisoryLock: vi.fn(),
  listSeoPlanItemRows: vi.fn(),
  replaceSeoPlanItemRows: vi.fn(),
  insertSeoPlanRunRow: vi.fn(),
  listSeoPlanRunRows: vi.fn(),
  updateSeoPlanRunStatus: vi.fn()
}));

vi.mock("@/lib/chatting-seo-plan", () => ({
  getChattingSeoGeneratedPlan: mocks.getChattingSeoGeneratedPlan
}));
vi.mock("@/lib/postgres-advisory-lock", () => ({
  withPostgresAdvisoryLock: mocks.withPostgresAdvisoryLock
}));
vi.mock("@/lib/repositories/seo-plan-items-repository", () => ({
  listSeoPlanItemRows: mocks.listSeoPlanItemRows,
  replaceSeoPlanItemRows: mocks.replaceSeoPlanItemRows
}));
vi.mock("@/lib/repositories/seo-plan-runs-repository", () => ({
  insertSeoPlanRunRow: mocks.insertSeoPlanRunRow,
  listSeoPlanRunRows: mocks.listSeoPlanRunRows,
  updateSeoPlanRunStatus: mocks.updateSeoPlanRunStatus
}));

import { ensureDashboardPublishingSeoBootstrap } from "@/lib/data/dashboard-publishing-seo-bootstrap";

describe("dashboard publishing seo bootstrap", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.withPostgresAdvisoryLock.mockImplementation(async (_key, task) => ({ acquired: true, value: await task() }));
    mocks.getChattingSeoGeneratedPlan.mockResolvedValue({
      source: "fallback",
      generatedAt: "2026-04-13T09:00:00.000Z",
      summary: "Plan summary",
      analysis: { source: "ai", researchSource: "live" },
      items: Array.from({ length: 30 }, (_, index) => ({
        id: `item_${index + 1}`,
        position: index + 1,
        title: `Item ${index + 1}`,
        targetKeyword: `keyword ${index + 1}`
      }))
    });
    mocks.insertSeoPlanRunRow.mockResolvedValue({ id: "run_upcoming" });
    mocks.updateSeoPlanRunStatus.mockResolvedValue({ id: "run_upcoming", status: "ready", summary_json: {} });
  });

  it("creates an upcoming run when the current run drops below the threshold", async () => {
    mocks.listSeoPlanRunRows.mockResolvedValue([{ id: "run_current", summary_json: { planEngineVersion: "keyword-corpus-v2", runRole: "current" }, status: "ready" }]);
    mocks.listSeoPlanItemRows.mockResolvedValue(Array.from({ length: 9 }, (_, index) => ({
      id: `item_${index + 1}`,
      status: "planned",
      target_publish_at: `2026-04-${index + 13}T09:00:00.000Z`
    })));

    await ensureDashboardPublishingSeoBootstrap({ ownerUserId: "owner_1", actorUserId: "user_1" });

    expect(mocks.insertSeoPlanRunRow).toHaveBeenCalledWith(expect.objectContaining({
      sourceProfileSlug: "chatting-external-keyword-corpus-upcoming",
      summaryJson: expect.objectContaining({ runRole: "upcoming" })
    }));
  });
});
