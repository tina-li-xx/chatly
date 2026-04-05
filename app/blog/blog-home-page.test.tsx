import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { getAllBlogPosts, getFeaturedBlogPost } from "@/lib/blog-data";
import { BlogHomePage } from "./blog-home-page";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: ReactNode;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  )
}));

describe("blog home page", () => {
  it("renders the featured story, category filters, and newsletter section", () => {
    const html = renderToStaticMarkup(
      <BlogHomePage
        featuredPost={getFeaturedBlogPost()}
        posts={getAllBlogPosts()}
        selectedCategory="all"
      />
    );

    expect(html).toContain("Chatting Blog");
    expect(html).toContain("Advice for warmer conversations and faster support.");
    expect(html).toContain("How-To Guides");
    expect(html).toContain("Get chat tips that actually work");
    expect(html).toContain("Live chat for small teams.");
    expect(html).toContain("/blog/chatting-vs-zendesk");
  });
});
