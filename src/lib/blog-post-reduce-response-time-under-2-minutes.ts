import type { BlogPost } from "@/lib/blog-types";
import { reduceResponseTimePrimarySections } from "@/lib/blog-post-reduce-response-time-primary-sections";
import { reduceResponseTimeSecondarySections } from "@/lib/blog-post-reduce-response-time-secondary-sections";

export const reduceResponseTimeUnderTwoMinutesPost: BlogPost = {
  slug: "reduce-response-time-under-2-minutes",
  title: "The 2-minute rule: How fast response times win customers",
  excerpt: "Fast response times win customers. Here's how to consistently reply in under 2 minutes — even with a small team.",
  subtitle: "Respond in under 2 minutes and you're 21x more likely to convert. Here's exactly how to hit that number consistently.",
  seoTitle: "How to Get Your Response Time Under 2 Minutes (Without Burning Out)",
  publishedAt: "2026-03-01T09:00:00.000Z",
  updatedAt: "2026-03-01T09:00:00.000Z",
  readingTime: 8,
  authorSlug: "tina",
  categorySlug: "live-chat-tips",
  image: { src: "/blog/reduce-response-time-under-2-minutes.svg", alt: "Speed-focused dashboard artwork with response timers and chat snippets." },
  relatedSlugs: ["live-chat-vs-contact-forms", "add-live-chat-to-shopify", "chatting-vs-zendesk"],
  sections: [...reduceResponseTimePrimarySections, ...reduceResponseTimeSecondarySections]
};
