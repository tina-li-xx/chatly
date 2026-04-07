import type { BlogPost } from "@/lib/blog-types";
import { chattingVsGorgiasPrimarySections } from "@/lib/blog-post-chatting-vs-gorgias-primary-sections";
import { chattingVsGorgiasSecondarySections } from "@/lib/blog-post-chatting-vs-gorgias-secondary-sections";

export const chattingVsGorgiasPost: BlogPost = {
  slug: "chatting-vs-gorgias",
  title: "Chatting vs Gorgias: which is better for small ecommerce teams?",
  excerpt:
    "Comparing Chatting and Gorgias for ecommerce live chat, after-hours support, pricing, and team fit. Here is which one makes more sense for a small store.",
  subtitle:
    "Gorgias is a real ecommerce support platform. Chatting is the lighter chat-first option. The right choice depends on whether you need live conversations or a broader helpdesk.",
  seoTitle: "Chatting vs Gorgias: Which Is Better for Small Ecommerce Teams?",
  publicationStatus: "scheduled",
  publishedAt: "2026-04-08T09:00:00.000Z",
  updatedAt: "2026-04-08T09:00:00.000Z",
  readingTime: 8,
  authorSlug: "tina",
  categorySlug: "comparisons",
  image: {
    src: "/blog/chatting-vs-gorgias.svg",
    alt: "Split-panel illustration comparing a chat-first inbox with a broader ecommerce support dashboard."
  },
  aliases: ["chatly-vs-gorgias"],
  relatedSlugs: ["ecommerce-live-chat-support", "after-hours-live-chat-ecommerce-leads", "shopify-live-chat"],
  sections: [...chattingVsGorgiasPrimarySections, ...chattingVsGorgiasSecondarySections]
};
