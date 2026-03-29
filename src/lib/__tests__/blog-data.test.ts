import { getBlogPostBySlug, getFeaturedBlogPost, getRelatedBlogPosts } from "@/lib/blog-data";

describe("blog data", () => {
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
      "best-intercom-alternatives-small-teams",
      "reduce-response-time-under-2-minutes"
    ]);
  });
});
