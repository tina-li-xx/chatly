const mocks = vi.hoisted(() => ({
  getAllBlogPosts: vi.fn(),
  getAnyBlogAuthorBySlug: vi.fn(),
  getBlogCategoryBySlug: vi.fn(),
  getChattingPublishingWorkspace: vi.fn(),
  listSeoGeneratedDraftRows: vi.fn(),
  isPublishedGeneratedDraftRow: vi.fn(),
  toGeneratedBlogPost: vi.fn()
}));

vi.mock("@/lib/blog-data", () => ({
  getAllBlogPosts: mocks.getAllBlogPosts,
  getAnyBlogAuthorBySlug: mocks.getAnyBlogAuthorBySlug,
  getBlogCategoryBySlug: mocks.getBlogCategoryBySlug
}));
vi.mock("@/lib/chatting-publishing-workspace", () => ({
  getChattingPublishingWorkspace: mocks.getChattingPublishingWorkspace
}));
vi.mock("@/lib/repositories/seo-generated-drafts-repository", () => ({
  listSeoGeneratedDraftRows: mocks.listSeoGeneratedDraftRows
}));
vi.mock("@/lib/seo-generated-blog-posts", () => ({
  isPublishedGeneratedDraftRow: mocks.isPublishedGeneratedDraftRow,
  toGeneratedBlogPost: mocks.toGeneratedBlogPost
}));

import {
  getPublicBlogAuthorBySlug,
  getPublicBlogPostBySlug,
  getPublicBlogPosts
} from "@/lib/public-blog-data";

const ORIGINAL_NEXT_PHASE = process.env.NEXT_PHASE;

describe("public blog data", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.NEXT_PHASE;
    mocks.getAllBlogPosts.mockReturnValue([
      {
        slug: "static-post",
        title: "Static post",
        publishedAt: "2026-04-10T09:00:00.000Z",
        author: { slug: "tina", name: "Tina" },
        category: { slug: "comparisons", label: "Comparisons" }
      }
    ]);
    mocks.getAnyBlogAuthorBySlug.mockImplementation((slug) => (slug === "tina" ? { slug, name: "Tina" } : null));
    mocks.getBlogCategoryBySlug.mockReturnValue({ slug: "comparisons", label: "Comparisons" });
    mocks.getChattingPublishingWorkspace.mockResolvedValue({ ownerUserId: "owner_123", actorUserId: "user_123" });
    mocks.listSeoGeneratedDraftRows.mockResolvedValue([{ id: "draft_1" }]);
    mocks.isPublishedGeneratedDraftRow.mockReturnValue(true);
    mocks.toGeneratedBlogPost.mockReturnValue({
      slug: "generated-post",
      title: "Generated post",
      relatedSlugs: [],
      author: { slug: "tina", name: "Tina" },
      category: { slug: "comparisons", label: "Comparisons" },
      publishedAt: "2026-04-12T09:00:00.000Z"
    });
  });

  afterAll(() => {
    if (ORIGINAL_NEXT_PHASE === undefined) {
      delete process.env.NEXT_PHASE;
    } else {
      process.env.NEXT_PHASE = ORIGINAL_NEXT_PHASE;
    }
  });

  it("merges generated published posts into the public blog list", async () => {
    const posts = await getPublicBlogPosts();

    expect(posts.map((post) => post.slug)).toEqual(["generated-post", "static-post"]);
  });

  it("skips generated draft lookups during the next production build phase", async () => {
    process.env.NEXT_PHASE = "phase-production-build";

    await expect(getPublicBlogPosts()).resolves.toMatchObject([
      expect.objectContaining({ slug: "static-post" })
    ]);
    expect(mocks.getChattingPublishingWorkspace).not.toHaveBeenCalled();
    expect(mocks.listSeoGeneratedDraftRows).not.toHaveBeenCalled();
  });

  it("resolves generated slugs and authors from the merged public blog view", async () => {
    await expect(getPublicBlogPostBySlug("generated-post")).resolves.toMatchObject({ slug: "generated-post" });
    await expect(getPublicBlogAuthorBySlug("tina")).resolves.toMatchObject({ slug: "tina" });
  });

  it("prefers generated posts when a published override uses the same slug as a static post", async () => {
    mocks.getAllBlogPosts.mockReturnValue([
      {
        slug: "static-post",
        title: "Static post",
        publishedAt: "2026-04-10T09:00:00.000Z",
        author: { slug: "tina", name: "Tina" },
        category: { slug: "comparisons", label: "Comparisons" }
      }
    ]);
    mocks.toGeneratedBlogPost.mockReturnValue({
      slug: "static-post",
      title: "Overridden post",
      relatedSlugs: [],
      author: { slug: "tina", name: "Tina" },
      category: { slug: "comparisons", label: "Comparisons" },
      publishedAt: "2026-04-12T09:00:00.000Z"
    });

    await expect(getPublicBlogPostBySlug("static-post")).resolves.toMatchObject({
      title: "Overridden post",
      publishedAt: "2026-04-12T09:00:00.000Z"
    });
  });
});
