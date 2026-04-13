import "server-only";

import { generatedBlogPosts } from "@/lib/generated-blog-posts";
import type { BlogPost, BlogSection } from "@/lib/blog-types";

const CATEGORY_IMAGE_MAP: Record<string, { src: string; alt: string }> = {
  comparisons: {
    src: "/blog/chatting-vs-intercom.svg",
    alt: "Comparison-style blog artwork for a Chatting draft article."
  },
  conversion: {
    src: "/blog/traffic-low-conversion.svg",
    alt: "Conversion-focused blog artwork for a Chatting draft article."
  },
  "how-to-guides": {
    src: "/blog/wordpress-live-chat-setup.svg",
    alt: "Guide-style blog artwork for a Chatting draft article."
  },
  product: {
    src: "/blog/live-chat-software-small-teams.svg",
    alt: "Product-focused blog artwork for a Chatting draft article."
  },
  "small-teams": {
    src: "/blog/best-live-chat-for-startups.svg",
    alt: "Small-team blog artwork for a Chatting draft article."
  },
  "live-chat-tips": {
    src: "/blog/reduce-response-time-under-2-minutes.svg",
    alt: "Live chat tips artwork for a Chatting draft article."
  },
  "case-studies": {
    src: "/blog/shopify-live-chat-growth-uses.svg",
    alt: "Case-study style artwork for a Chatting draft article."
  }
};

export function slugifyBlogPost(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function uniqueBlogSlug(value: string) {
  const base = slugifyBlogPost(value);
  const existing = new Set(generatedBlogPosts.map((post) => post.slug));
  if (!existing.has(base)) {
    return base;
  }

  let attempt = `${base}-chatting`;
  let index = 2;
  while (existing.has(attempt)) {
    attempt = `${base}-chatting-${index}`;
    index += 1;
  }
  return attempt;
}

export function estimateBlogReadingTime(sections: BlogSection[]) {
  const words = sections
    .flatMap((section) => [section.title, ...section.blocks.flatMap((block) => {
      if (block.type === "paragraph" || block.type === "quote" || block.type === "callout") {
        return [block.type === "callout" ? `${block.title} ${block.text}` : block.text];
      }
      if (block.type === "list") return block.items;
      if (block.type === "faq") return block.items.flatMap((item) => [`${item.question} ${item.answer}`]);
      if (block.type === "cta") return [block.title, block.text, block.buttonLabel];
      if (block.type === "template") return [block.title, ...block.lines];
      if (block.type === "chat-example") return block.messages.map((message) => message.text);
      if (block.type === "comparison") return block.rows.flatMap((row) => [row.label, ...row.values]);
      return [block.code];
    })])
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;

  return Math.max(6, Math.round(words / 180));
}

export function defaultBlogImage(categorySlug: string) {
  return CATEGORY_IMAGE_MAP[categorySlug] ?? CATEGORY_IMAGE_MAP["product"];
}

export function relatedBlogSlugs(categorySlug: string, excludeSlug: string, limit = 3) {
  return generatedBlogPosts
    .filter((post) => post.slug !== excludeSlug && post.categorySlug === categorySlug)
    .slice(0, limit)
    .map((post) => post.slug);
}

export function toDraftPayloadPost(post: BlogPost): Record<string, unknown> {
  return { post };
}

export function readDraftPayloadPost(payload: unknown): BlogPost | null {
  if (!payload || typeof payload !== "object" || !("post" in payload)) {
    return null;
  }

  const post = (payload as { post?: unknown }).post;
  return post && typeof post === "object" ? (post as BlogPost) : null;
}
