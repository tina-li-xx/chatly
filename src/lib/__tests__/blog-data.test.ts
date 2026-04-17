import {
  getAllBlogAuthors,
  getBlogAuthorBySlug,
  getBlogPostBySlug,
  getBlogPostsByAuthor,
  getFeaturedBlogPost,
  getQueuedBlogPostBySlug,
  getQueuedBlogPosts,
  getRelatedBlogPosts
} from "@/lib/blog-data";

describe("blog data", () => {
  const queuedBacklogNow = new Date("2026-04-09T08:00:00.000Z");

  it("returns the featured post with hydrated author and category data", () => {
    const post = getFeaturedBlogPost();

    expect(post.slug).toBe("chatting-vs-intercom");
    expect(post.author.name).toBe("Tina");
    expect(post.category.label).toBe("Comparisons");
  });

  it("returns related posts without duplicates", () => {
    const post = getBlogPostBySlug("chatting-vs-zendesk");

    expect(post).not.toBeNull();
    expect(post && getRelatedBlogPosts(post).map((entry) => entry.slug)).toEqual([
      "chatting-vs-intercom",
      "intercom-alternatives-small-business",
      "reduce-response-time-under-2-minutes"
    ]);
  });

  it("resolves the old Intercom alternatives slug as an alias", () => {
    const post = getBlogPostBySlug("best-intercom-alternatives-small-teams");

    expect(post?.slug).toBe("intercom-alternatives-small-business");
  });

  it("resolves the new Intercom retarget slug as an alias", () => {
    const post = getBlogPostBySlug("intercom-alternative-for-small-teams");

    expect(post?.slug).toBe("intercom-alternatives-small-business");
  });

  it("returns blog authors that have published posts and resolves their post collections", () => {
    expect(getAllBlogAuthors().map((author) => author.slug)).toEqual(["tina"]);
    expect(getBlogAuthorBySlug("tina")?.name).toBe("Tina");
    expect(getBlogPostsByAuthor("tina").every((post) => post.author.slug === "tina")).toBe(true);
  });

  it("resolves the old WordPress guide slug as an alias", () => {
    const post = getBlogPostBySlug("wordpress-live-chat-setup");

    expect(post?.slug).toBe("wordpress-live-chat");
  });

  it("resolves the Zendesk retarget slug and the new startups article", () => {
    expect(getBlogPostBySlug("zendesk-vs-simple-live-chat")?.slug).toBe("chatting-vs-zendesk");
    expect(getBlogPostBySlug("best-live-chat-for-startups")?.slug).toBe("best-live-chat-for-startups");
  });

  it("keeps draft backlog posts out of public blog lookups", () => {
    vi.useFakeTimers();
    vi.setSystemTime(queuedBacklogNow);

    try {
      expect(getBlogPostBySlug("best-live-chat-software-customer-support")).toBeNull();
      expect(getBlogPostBySlug("zendesk-alternatives-small-teams")).toBeNull();
      expect(getBlogPostBySlug("traffic-low-conversion")).toBeNull();
      expect(getBlogPostBySlug("small-ecommerce-customer-support-workflow")).toBeNull();
      expect(getBlogPostBySlug("shopify-live-chat-growth-uses")).toBeNull();
      expect(getBlogPostBySlug("live-chat-worth-it-small-business")).toBeNull();
      expect(getBlogPostBySlug("what-is-live-chat-benefits")).toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });

  it("returns queued posts with hydrated author and category details", () => {
    vi.useFakeTimers();
    vi.setSystemTime(queuedBacklogNow);

    try {
      expect(getQueuedBlogPosts().map((post) => post.slug)).toEqual([
        "best-live-chat-software-customer-support",
        "zendesk-alternatives-small-teams",
        "traffic-low-conversion",
        "small-ecommerce-customer-support-workflow",
        "shopify-live-chat-growth-uses",
        "live-chat-worth-it-small-business",
        "what-is-live-chat-benefits"
      ]);
      expect(getQueuedBlogPosts().every((post) => post.author.name && post.category.label)).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });

  it("resolves queued posts by slug and alias", () => {
    vi.useFakeTimers();
    vi.setSystemTime(queuedBacklogNow);

    try {
      expect(getQueuedBlogPostBySlug("zendesk-alternatives-small-teams")?.slug).toBe("zendesk-alternatives-small-teams");
      expect(getQueuedBlogPostBySlug("zendesk-alternative-for-small-teams")?.slug).toBe("zendesk-alternatives-small-teams");
    } finally {
      vi.useRealTimers();
    }
  });
});
