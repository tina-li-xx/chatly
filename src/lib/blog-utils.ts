import { getPublicAppUrl } from "@/lib/env";
import type { BlogPostWithDetails } from "@/lib/blog-types";

export function formatBlogDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}

export function formatReadingTime(minutes: number) {
  return `${minutes} min read`;
}

export function buildAbsoluteUrl(path: string) {
  const baseUrl = getPublicAppUrl().replace(/\/$/, "");
  return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export function buildBlogPostingSchema(post: BlogPostWithDetails) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: buildAbsoluteUrl(post.image.src),
    author: {
      "@type": "Person",
      name: post.author.name
    },
    publisher: {
      "@type": "Organization",
      name: "Chatting",
      logo: {
        "@type": "ImageObject",
        url: buildAbsoluteUrl("/blog/chatting-logo.svg")
      }
    },
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    mainEntityOfPage: buildAbsoluteUrl(`/blog/${post.slug}`)
  };
}
