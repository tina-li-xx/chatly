import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";

const mocks = vi.hoisted(() => ({
  getPublicBlogAuthors: vi.fn(),
  getPublicBlogAuthorBySlug: vi.fn(),
  getPublicBlogPostsByAuthor: vi.fn(),
  notFound: vi.fn()
}));

vi.mock("next/navigation", () => ({
  notFound: mocks.notFound
}));

vi.mock("@/lib/public-blog-data", () => ({
  getPublicBlogAuthors: mocks.getPublicBlogAuthors,
  getPublicBlogAuthorBySlug: mocks.getPublicBlogAuthorBySlug,
  getPublicBlogPostsByAuthor: mocks.getPublicBlogPostsByAuthor
}));

vi.mock("@/lib/env", () => ({
  getPublicAppUrl: () => "http://localhost:3983"
}));

import BlogAuthorRoute, {
  dynamicParams,
  generateMetadata,
  generateStaticParams,
  revalidate
} from "./page";

describe("blog author route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("builds static params from every blog author with posts", async () => {
    mocks.getPublicBlogAuthors.mockResolvedValue([{ slug: "tina" }]);

    await expect(generateStaticParams()).resolves.toEqual([{ slug: "tina" }]);
  });

  it("returns author metadata when the slug exists", async () => {
    mocks.getPublicBlogAuthorBySlug.mockResolvedValue({
      slug: "tina",
      name: "Tina",
      bio: "Growth and operations at Chatting."
    });

    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: "tina" })
    });

    expect(metadata.title).toBe("Tina | Chatting Blog");
    expect(String(metadata.alternates?.canonical)).toContain("/blog/authors/tina");
    expect(metadata.openGraph?.images).toEqual([
      {
        url: "http://localhost:3983/api/og?template=a&v=2026-04-09",
        width: 1200,
        height: 630,
        alt: "Chatting — Live chat for small teams. $20/month. No per-seat pricing."
      }
    ]);
    expect(metadata.twitter?.images).toEqual(["http://localhost:3983/api/og?template=a&v=2026-04-09"]);
  });

  it("renders the author page and delegates missing authors to notFound", async () => {
    mocks.getPublicBlogAuthorBySlug
      .mockResolvedValueOnce({
        slug: "tina",
        name: "Tina",
        role: "Growth & Operations at Chatting",
        bio: "Growth and operations at Chatting.",
        initials: "T",
        links: []
      })
      .mockResolvedValueOnce(null);
    mocks.getPublicBlogPostsByAuthor.mockResolvedValue([
      {
        slug: "shopify-live-chat",
        title: "Shopify live chat",
        excerpt: "Guide",
        publishedAt: "2026-04-02T00:00:00.000Z",
        updatedAt: "2026-04-02T00:00:00.000Z",
        readingTime: 11,
        image: { src: "/og.png", alt: "OG" },
        author: { slug: "tina", name: "Tina", initials: "T" },
        category: { label: "How-To Guides", badgeClassName: "bg-violet-50 text-violet-700" }
      }
    ]);

    const html = renderToStaticMarkup(
      (await BlogAuthorRoute({
        params: Promise.resolve({ slug: "tina" })
      })) as ReactNode
    );

    expect(html).toContain("Posts by Tina");
    expect(html).toContain("shopify-live-chat");

    await BlogAuthorRoute({
      params: Promise.resolve({ slug: "missing" })
    });
    expect(mocks.notFound).toHaveBeenCalled();
  });

  it("allows on-demand author pages with a short revalidation window", () => {
    expect(dynamicParams).toBe(true);
    expect(revalidate).toBe(60);
  });
});
