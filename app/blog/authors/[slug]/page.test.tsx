import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";

const mocks = vi.hoisted(() => ({
  getAllBlogAuthors: vi.fn(),
  getBlogAuthorBySlug: vi.fn(),
  getBlogPostsByAuthor: vi.fn(),
  notFound: vi.fn()
}));

vi.mock("next/navigation", () => ({
  notFound: mocks.notFound
}));

vi.mock("@/lib/blog-data", () => ({
  getAllBlogAuthors: mocks.getAllBlogAuthors,
  getBlogAuthorBySlug: mocks.getBlogAuthorBySlug,
  getBlogPostsByAuthor: mocks.getBlogPostsByAuthor
}));

vi.mock("@/lib/env", () => ({
  getPublicAppUrl: () => "http://localhost:3983"
}));

import BlogAuthorRoute, {
  generateMetadata,
  generateStaticParams
} from "./page";

describe("blog author route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("builds static params from every blog author with posts", async () => {
    mocks.getAllBlogAuthors.mockReturnValue([{ slug: "tina" }]);

    await expect(generateStaticParams()).resolves.toEqual([{ slug: "tina" }]);
  });

  it("returns author metadata when the slug exists", async () => {
    mocks.getBlogAuthorBySlug.mockReturnValue({
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
        url: "http://localhost:3983/api/og?template=a",
        width: 1200,
        height: 630,
        alt: "Chatting — Live chat for small teams who care."
      }
    ]);
    expect(metadata.twitter?.images).toEqual(["http://localhost:3983/api/og?template=a"]);
  });

  it("renders the author page and delegates missing authors to notFound", async () => {
    mocks.getBlogAuthorBySlug
      .mockReturnValueOnce({
        slug: "tina",
        name: "Tina",
        role: "Growth & Operations at Chatting",
        bio: "Growth and operations at Chatting.",
        initials: "T",
        links: []
      })
      .mockReturnValueOnce(null);
    mocks.getBlogPostsByAuthor.mockReturnValue([
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
});
