const mocks = vi.hoisted(() => ({
  getQueuedBlogPosts: vi.fn(),
  withPostgresAdvisoryLock: vi.fn(),
  listSeoGeneratedDraftRows: vi.fn(),
  insertSeoGeneratedDraftRow: vi.fn()
}));

vi.mock("@/lib/blog-data", () => ({
  getQueuedBlogPosts: mocks.getQueuedBlogPosts
}));
vi.mock("@/lib/postgres-advisory-lock", () => ({
  withPostgresAdvisoryLock: mocks.withPostgresAdvisoryLock
}));
vi.mock("@/lib/repositories/seo-generated-drafts-repository", () => ({
  listSeoGeneratedDraftRows: mocks.listSeoGeneratedDraftRows,
  insertSeoGeneratedDraftRow: mocks.insertSeoGeneratedDraftRow
}));

import { ensureDashboardPublishingStaticDraftMirror } from "@/lib/data/dashboard-publishing-static-drafts-bootstrap";

describe("dashboard publishing static drafts bootstrap", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.withPostgresAdvisoryLock.mockImplementation(async (_key, task) => ({ acquired: true, value: await task() }));
    mocks.listSeoGeneratedDraftRows.mockResolvedValue([{ slug: "existing-draft" }]);
    mocks.insertSeoGeneratedDraftRow.mockResolvedValue({ id: "draft_1" });
    mocks.getQueuedBlogPosts.mockReturnValue([
      {
        slug: "existing-draft",
        title: "Existing draft",
        excerpt: "Excerpt",
        subtitle: "Subtitle",
        publicationStatus: "draft",
        publishedAt: "2026-04-20T09:00:00.000Z",
        updatedAt: "2026-04-20T09:00:00.000Z",
        readingTime: 8,
        authorSlug: "tina",
        categorySlug: "small-teams",
        image: { src: "/blog/test.svg", alt: "Test" },
        relatedSlugs: [],
        sections: [],
        author: { slug: "tina", name: "Tina" },
        category: { slug: "small-teams", label: "Small Teams" }
      },
      {
        slug: "static-draft",
        title: "Static draft",
        excerpt: "Excerpt",
        subtitle: "Subtitle",
        publicationStatus: "draft",
        publishedAt: "2026-04-21T09:00:00.000Z",
        updatedAt: "2026-04-21T09:00:00.000Z",
        readingTime: 8,
        authorSlug: "tina",
        categorySlug: "product",
        image: { src: "/blog/test.svg", alt: "Test" },
        relatedSlugs: [],
        sections: [],
        author: { slug: "tina", name: "Tina" },
        category: { slug: "product", label: "Product" }
      }
    ]);
  });

  it("mirrors missing static queued posts into the draft table", async () => {
    await ensureDashboardPublishingStaticDraftMirror({ ownerUserId: "owner_123", actorUserId: "user_123" });

    expect(mocks.insertSeoGeneratedDraftRow).toHaveBeenCalledTimes(1);
    expect(mocks.insertSeoGeneratedDraftRow).toHaveBeenCalledWith(expect.objectContaining({
      ownerUserId: "owner_123",
      actorUserId: "user_123",
      slug: "static-draft",
      status: "draft",
      publicationStatus: "draft",
      metadataJson: expect.objectContaining({
        mirroredStaticQueuedPost: true,
        source: "repo-static"
      })
    }));
  });
});
