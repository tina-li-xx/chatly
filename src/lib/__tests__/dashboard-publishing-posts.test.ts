const mocks = vi.hoisted(() => ({
  getQueuedBlogPosts: vi.fn(),
  getRelatedBlogPosts: vi.fn(),
  hydrateBlogPost: vi.fn((post) => ({
    ...post,
    author: { name: "Tina" },
    category: { slug: post.categorySlug, label: "Comparisons" }
  })),
  listSeoGeneratedDraftRows: vi.fn(),
  findSeoGeneratedDraftRowBySlug: vi.fn()
}));

vi.mock("@/lib/blog-data", () => ({
  getQueuedBlogPosts: mocks.getQueuedBlogPosts,
  getRelatedBlogPosts: mocks.getRelatedBlogPosts,
  hydrateBlogPost: mocks.hydrateBlogPost
}));
vi.mock("@/lib/repositories/seo-generated-drafts-repository", () => ({
  listSeoGeneratedDraftRows: mocks.listSeoGeneratedDraftRows,
  findSeoGeneratedDraftRowBySlug: mocks.findSeoGeneratedDraftRowBySlug
}));

import { getDashboardPublishingQueuedPostBySlug, getDashboardPublishingQueuedPosts } from "@/lib/dashboard-publishing-posts";

const generatedRow = {
  title: "Generated draft",
  slug: "generated-draft",
  excerpt: "Excerpt",
  subtitle: "Subtitle",
  author_slug: "tina",
  category_slug: "comparisons",
  publication_status: "draft",
  reading_time: 8,
  updated_at: "2026-04-19T09:00:00.000Z",
  draft_payload_json: {
    post: {
      slug: "generated-draft",
      title: "Generated draft",
      excerpt: "Excerpt",
      subtitle: "Subtitle",
      publishedAt: "2026-04-19T09:00:00.000Z",
      updatedAt: "2026-04-19T09:00:00.000Z",
      readingTime: 8,
      authorSlug: "tina",
      categorySlug: "comparisons",
      image: { src: "/blog/chatting-vs-intercom.svg", alt: "Alt" },
      relatedSlugs: [],
      sections: [],
      publicationStatus: "draft"
    }
  }
};

describe("dashboard publishing posts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getQueuedBlogPosts.mockReturnValue([{ slug: "static-queued", publishedAt: "2026-04-20T09:00:00.000Z" }]);
    mocks.getRelatedBlogPosts.mockReturnValue([]);
    mocks.listSeoGeneratedDraftRows.mockResolvedValue([generatedRow]);
    mocks.findSeoGeneratedDraftRowBySlug.mockResolvedValue(null);
  });

  it("merges generated drafts into the dashboard queue", async () => {
    const posts = await getDashboardPublishingQueuedPosts("owner_123");
    expect(posts.map((post) => post.slug)).toContain("generated-draft");
  });

  it("prefers mirrored generated rows when a static queued post has the same slug", async () => {
    mocks.getQueuedBlogPosts.mockReturnValue([{ slug: "generated-draft", publishedAt: "2026-04-20T09:00:00.000Z" }]);

    const posts = await getDashboardPublishingQueuedPosts("owner_123");

    expect(posts.filter((post) => post.slug === "generated-draft")).toHaveLength(1);
  });

  it("resolves generated drafts by slug before falling back to static queued posts", async () => {
    mocks.findSeoGeneratedDraftRowBySlug.mockResolvedValueOnce(generatedRow);
    const post = await getDashboardPublishingQueuedPostBySlug("owner_123", "generated-draft");
    expect(post?.slug).toBe("generated-draft");
  });
});
