import type { BlogPost } from "@/lib/blog-types";
import { bestIntercomAlternativesPrimarySections } from "@/lib/blog-post-best-intercom-alternatives-primary-sections";
import { bestIntercomAlternativesSecondarySections } from "@/lib/blog-post-best-intercom-alternatives-secondary-sections";

export const bestIntercomAlternativesSmallTeamsPost: BlogPost = {
  slug: "best-intercom-alternatives-small-teams",
  title: "7 Intercom alternatives that won't break your budget",
  excerpt: "Intercom too expensive? Here are 7 affordable alternatives built for small teams — with honest pros, cons, and pricing.",
  subtitle: "Intercom is great — if you can afford $500/month. Here's what small teams are using instead.",
  seoTitle: "7 Best Intercom Alternatives for Small Teams (2024)",
  publishedAt: "2026-02-15T09:00:00.000Z",
  updatedAt: "2026-02-15T09:00:00.000Z",
  readingTime: 9,
  authorSlug: "tina",
  categorySlug: "comparisons",
  image: { src: "/blog/best-intercom-alternatives-small-teams.svg", alt: "Stacked cards representing affordable live chat alternatives for small teams." },
  relatedSlugs: ["chatting-vs-intercom", "chatting-vs-zendesk", "add-live-chat-to-shopify"],
  sections: [...bestIntercomAlternativesPrimarySections, ...bestIntercomAlternativesSecondarySections]
};
