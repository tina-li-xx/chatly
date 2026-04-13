import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";

const mocks = vi.hoisted(() => ({
  getPublicBlogPostsByCategory: vi.fn(),
  getPublicFeaturedBlogPost: vi.fn()
}));

vi.mock("@/lib/blog-data", () => ({
  isBlogCategorySlug: (value: string) => value === "sales" || value === "all"
}));
vi.mock("@/lib/public-blog-data", () => ({
  getPublicBlogPostsByCategory: mocks.getPublicBlogPostsByCategory,
  getPublicFeaturedBlogPost: mocks.getPublicFeaturedBlogPost
}));

vi.mock("./blog-home-page", () => ({
  BlogHomePage: ({
    featuredPost,
    posts,
    selectedCategory
  }: {
    featuredPost: { slug: string };
    posts: { slug: string }[];
    selectedCategory: string;
  }) => (
    <div>
      <span>{selectedCategory}</span>
      <span>{featuredPost.slug}</span>
      <span>{posts.map((post) => post.slug).join(",")}</span>
    </div>
  )
}));

import BlogIndexPage, { metadata, revalidate } from "./page";

describe("blog index page route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses the selected category posts and swaps the featured story when needed", async () => {
    mocks.getPublicFeaturedBlogPost.mockResolvedValue({
      slug: "featured",
      category: { slug: "support" }
    });
    mocks.getPublicBlogPostsByCategory.mockImplementation(async (category: string) =>
      category === "sales" ? [{ slug: "sales-post" }] : [{ slug: "all-post" }]
    );

    const html = renderToStaticMarkup(
      (await BlogIndexPage({
        searchParams: Promise.resolve({ category: "sales" })
      })) as ReactNode
    );

    expect(html).toContain("sales");
    expect(html).toContain("sales-post");
    expect(mocks.getPublicBlogPostsByCategory).toHaveBeenCalledWith("sales");
  });

  it("falls back to all posts for invalid categories and keeps the featured post", async () => {
    mocks.getPublicFeaturedBlogPost.mockResolvedValue({
      slug: "featured",
      category: { slug: "all" }
    });
    mocks.getPublicBlogPostsByCategory.mockImplementation(async (category: string) =>
      category === "all" ? [{ slug: "all-post" }] : []
    );

    const html = renderToStaticMarkup(
      (await BlogIndexPage({
        searchParams: Promise.resolve({ category: "nope" })
      })) as ReactNode
    );

    expect(html).toContain("all");
    expect(html).toContain("featured");
    expect(html).toContain("all-post");
  });

  it("exposes the canonical blog metadata", () => {
    expect(metadata.title).toBe("Chatting Blog");
    expect(String(metadata.alternates?.canonical)).toContain("/blog");
  });

  it("revalidates on a short interval so scheduled posts can appear without a redeploy", () => {
    expect(revalidate).toBe(60);
  });
});
