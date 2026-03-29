import type { BlogPost } from "@/lib/blog-types";
import { liveChatVsContactFormsSections } from "@/lib/blog-post-live-chat-vs-contact-forms-sections";

export const liveChatVsContactFormsPost: BlogPost = {
  slug: "live-chat-vs-contact-forms",
  title: "Contact forms are where leads go to die",
  excerpt: "Contact forms have a 2% conversion rate. Live chat converts at 6%+. Here's why — and how to make the switch.",
  subtitle: "The average contact form converts at 2%. Live chat converts at 6-10%. Here's why that gap exists — and what to do about it.",
  seoTitle: "Why Live Chat Converts 3x Better Than Contact Forms",
  publishedAt: "2026-03-22T09:00:00.000Z",
  updatedAt: "2026-03-22T09:00:00.000Z",
  readingTime: 8,
  authorSlug: "tina",
  categorySlug: "conversion",
  image: { src: "/blog/live-chat-vs-contact-forms.svg", alt: "Comparison artwork showing a stiff contact form versus an active live chat conversation." },
  relatedSlugs: ["reduce-response-time-under-2-minutes", "add-live-chat-to-shopify", "chatting-vs-intercom"],
  sections: liveChatVsContactFormsSections
};
