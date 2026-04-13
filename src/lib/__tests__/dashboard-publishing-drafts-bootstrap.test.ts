const mocks = vi.hoisted(() => ({
  generateDashboardPublishingDraft: vi.fn(),
  withPostgresAdvisoryLock: vi.fn(),
  listSeoGeneratedDraftRows: vi.fn(),
  listSeoPlanItemRows: vi.fn(),
  listSeoPlanRunRows: vi.fn()
}));

vi.mock("@/lib/dashboard-publishing-draft-generation", () => ({
  generateDashboardPublishingDraft: mocks.generateDashboardPublishingDraft
}));
vi.mock("@/lib/postgres-advisory-lock", () => ({
  withPostgresAdvisoryLock: mocks.withPostgresAdvisoryLock
}));
vi.mock("@/lib/repositories/seo-generated-drafts-repository", () => ({
  listSeoGeneratedDraftRows: mocks.listSeoGeneratedDraftRows
}));
vi.mock("@/lib/repositories/seo-plan-items-repository", () => ({
  listSeoPlanItemRows: mocks.listSeoPlanItemRows
}));
vi.mock("@/lib/repositories/seo-plan-runs-repository", () => ({
  listSeoPlanRunRows: mocks.listSeoPlanRunRows
}));

import { ensureDashboardPublishingDraftAutopilot } from "@/lib/data/dashboard-publishing-drafts-bootstrap";

function queuedRow(slug: string) {
  return {
    slug,
    publication_status: "scheduled",
    reading_time: 8,
    updated_at: "2026-04-12T09:00:00.000Z",
    title: slug,
    excerpt: "Excerpt",
    subtitle: "Subtitle",
    author_slug: "tina",
    category_slug: "comparisons",
    draft_payload_json: {
      post: {
        slug,
        title: slug,
        excerpt: "Excerpt",
        subtitle: "Subtitle",
        publishedAt: "2026-04-20T09:00:00.000Z",
        updatedAt: "2026-04-12T09:00:00.000Z",
        readingTime: 8,
        authorSlug: "tina",
        categorySlug: "comparisons",
        image: { src: "/blog/chatting-vs-intercom.svg", alt: "Alt" },
        relatedSlugs: [],
        sections: [],
        publicationStatus: "scheduled"
      }
    }
  };
}

describe("dashboard publishing draft autopilot", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.listSeoPlanRunRows.mockResolvedValue([
      { id: "run_1", summary_json: { planEngineVersion: "keyword-corpus-v2", runRole: "current" } }
    ]);
    mocks.withPostgresAdvisoryLock.mockImplementation(async (_key, task) => ({ acquired: true, value: await task() }));
    mocks.generateDashboardPublishingDraft.mockResolvedValue({ created: true, draft: { id: "draft_1" } });
    mocks.listSeoPlanItemRows.mockResolvedValue([
      { id: "item_1", status: "planned", target_publish_at: "2026-04-20T09:00:00.000Z", title: "One", target_keyword: "one" },
      { id: "item_2", status: "planned", target_publish_at: "2026-04-21T09:00:00.000Z", title: "Two", target_keyword: "two" },
      { id: "item_3", status: "planned", target_publish_at: "2026-04-22T09:00:00.000Z", title: "Three", target_keyword: "three" }
    ]);
  });

  it("fills only the missing draft buffer slots", async () => {
    mocks.listSeoGeneratedDraftRows.mockResolvedValue([queuedRow("existing-1"), queuedRow("existing-2")]);

    await ensureDashboardPublishingDraftAutopilot({ ownerUserId: "owner_123", actorUserId: "user_123" });

    expect(mocks.generateDashboardPublishingDraft).toHaveBeenCalledTimes(1);
    expect(mocks.generateDashboardPublishingDraft).toHaveBeenCalledWith(expect.objectContaining({
      ownerUserId: "owner_123",
      actorUserId: "user_123",
      mode: "autopilot"
    }));
  });

  it("drafts from the current run even when a newer upcoming run exists", async () => {
    mocks.listSeoPlanRunRows.mockResolvedValue([
      { id: "run_upcoming", summary_json: { planEngineVersion: "keyword-corpus-v2", runRole: "upcoming" } },
      { id: "run_current", summary_json: { planEngineVersion: "keyword-corpus-v2", runRole: "current" } }
    ]);
    mocks.listSeoPlanItemRows.mockImplementation(async (_ownerUserId, runId) => runId === "run_current"
      ? [{ id: "item_current", status: "planned", title: "Current", target_keyword: "current" }]
      : [{ id: "item_upcoming", status: "planned", title: "Upcoming", target_keyword: "upcoming" }]);
    mocks.listSeoGeneratedDraftRows.mockResolvedValue([]);

    await ensureDashboardPublishingDraftAutopilot({ ownerUserId: "owner_123", actorUserId: "user_123" });

    expect(mocks.generateDashboardPublishingDraft).toHaveBeenCalledWith(expect.objectContaining({
      planItem: expect.objectContaining({ id: "item_current" })
    }));
  });
});
