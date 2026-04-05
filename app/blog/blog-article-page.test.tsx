import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { getBlogPostBySlug, getRelatedBlogPosts } from "@/lib/blog-data";
import { BlogArticlePage } from "./blog-article-page";

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

vi.mock("@/lib/env", () => ({
  getPublicAppUrl: () => "https://chatting.test"
}));

describe("blog article page", () => {
  it("renders the article body, inline CTA, and related posts", () => {
    const post = getBlogPostBySlug("live-chat-vs-contact-forms");

    expect(post).not.toBeNull();

    const html = renderToStaticMarkup(
      <BlogArticlePage post={post!} relatedPosts={getRelatedBlogPosts(post!)} />
    );

    expect(html).toContain("Contact forms are where leads go to die");
    expect(html).toContain("Add live chat to your site");
    expect(html).not.toContain("Ready to talk to your visitors?");
    expect(html).toContain("The uncomfortable truth about contact forms");
    expect(html).toContain("Related guides inside this topic");
    expect(html).toContain("You might also like");
    expect(html).toContain("Live chat for small teams.");
    expect(html).toContain("application/ld+json");
    expect(html).toContain("/blog/authors/tina");
  });

  it("renders the Intercom comparison using the SEO copy", () => {
    const post = getBlogPostBySlug("chatting-vs-intercom");

    expect(post).not.toBeNull();

    const html = renderToStaticMarkup(
      <BlogArticlePage post={post!} relatedPosts={getRelatedBlogPosts(post!)} />
    );

    expect(html).toContain("Chatting vs Intercom: The honest comparison");
    expect(html).toContain("Related guides inside this topic");
    expect(html).toContain("The short version");
    expect(html).toContain("Pricing: The elephant in the room");
    expect(html).toContain("Is Chatting really comparable to Intercom?");
    expect(html).toContain("Ready to switch?");
  });

  it("does not stack the shared inline CTA under an article CTA block", () => {
    const post = getBlogPostBySlug("intercom-alternatives-small-business");

    expect(post).not.toBeNull();

    const html = renderToStaticMarkup(
      <BlogArticlePage post={post!} relatedPosts={getRelatedBlogPosts(post!)} />
    );

    expect(html).toContain("1. Chatting — Best for simplicity");
    expect(html).toContain("Related guides inside this topic");
    expect(html).toContain("Try Chatting free");
    expect(html).not.toContain("Ready to talk to your visitors?");
  });
});
