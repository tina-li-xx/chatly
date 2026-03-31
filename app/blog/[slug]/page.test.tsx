import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";

const mocks = vi.hoisted(() => ({
  getAllBlogPosts: vi.fn(),
  getBlogPostBySlug: vi.fn(),
  getRelatedBlogPosts: vi.fn(),
  notFound: vi.fn()
}));

vi.mock("next/navigation", () => ({
  notFound: mocks.notFound
}));

vi.mock("@/lib/blog-data", () => ({
  getAllBlogPosts: mocks.getAllBlogPosts,
  getBlogPostBySlug: mocks.getBlogPostBySlug,
  getRelatedBlogPosts: mocks.getRelatedBlogPosts
}));

vi.mock("../blog-article-page", () => ({
  BlogArticlePage: ({
    post,
    relatedPosts
  }: {
    post: { slug: string };
    relatedPosts: { slug: string }[];
  }) => (
    <div>
      <span>{post.slug}</span>
      <span>{relatedPosts.map((item) => item.slug).join(",")}</span>
    </div>
  )
}));

import BlogArticleRoute, {
  generateMetadata,
  generateStaticParams
} from "./page";

describe("blog article route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("builds static params from every blog post", async () => {
    mocks.getAllBlogPosts.mockReturnValue([{ slug: "one" }, { slug: "two" }]);

    await expect(generateStaticParams()).resolves.toEqual([{ slug: "one" }, { slug: "two" }]);
  });

  it("returns article metadata when the slug exists", async () => {
    mocks.getBlogPostBySlug.mockReturnValue({
      slug: "chatting-vs-zendesk",
      title: "Chatting vs Zendesk",
      seoTitle: "Compare chat tools",
      excerpt: "A practical comparison.",
      publishedAt: "2026-03-01T00:00:00.000Z",
      updatedAt: "2026-03-05T00:00:00.000Z",
      author: { name: "Tina" },
      category: { label: "Comparisons" },
      image: { src: "/og.png", alt: "OG" }
    });

    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: "chatting-vs-zendesk" })
    });

    expect(metadata.title).toBe("Compare chat tools | Chatting Blog");
    expect(String(metadata.alternates?.canonical)).toContain("/blog/chatting-vs-zendesk");
  });

  it("renders the article page with related posts and delegates missing slugs to notFound", async () => {
    mocks.getBlogPostBySlug
      .mockReturnValueOnce({
        slug: "article",
        title: "Article"
      })
      .mockReturnValueOnce(null);
    mocks.getRelatedBlogPosts.mockReturnValue([{ slug: "related" }]);

    const html = renderToStaticMarkup(
      (await BlogArticleRoute({
        params: Promise.resolve({ slug: "article" })
      })) as ReactNode
    );

    expect(html).toContain("article");
    expect(html).toContain("related");

    await BlogArticleRoute({
      params: Promise.resolve({ slug: "missing" })
    });
    expect(mocks.notFound).toHaveBeenCalled();
  });
});
