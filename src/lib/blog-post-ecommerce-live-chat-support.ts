import type { BlogPost } from "@/lib/blog-types";
import { ecommerceLiveChatSupportPrimarySections } from "@/lib/blog-post-ecommerce-live-chat-support-primary-sections";
import { ecommerceLiveChatSupportSecondarySections } from "@/lib/blog-post-ecommerce-live-chat-support-secondary-sections";

export const ecommerceLiveChatSupportPost: BlogPost = {
  slug: "ecommerce-live-chat-support",
  title: "E-commerce live chat without the 24/7 trap",
  excerpt:
    "Thinking about live chat for your online store? Here is how small e-commerce teams handle support, reduce cart abandonment, and stay personal without being online all day.",
  subtitle:
    "Live chat can lift conversions, but it can also become one more inbox you ignore. Here is how to make it useful without burning out your team.",
  seoTitle: "How to Handle Live Chat Support for Your E-Commerce Store (2026)",
  publishedAt: "2026-04-05T09:00:00.000Z",
  updatedAt: "2026-04-05T09:00:00.000Z",
  readingTime: 9,
  authorSlug: "tina",
  categorySlug: "small-teams",
  image: {
    src: "/blog/ecommerce-live-chat-support.svg",
    alt: "Illustrated e-commerce dashboard with live chat, orders, and shopper support cards."
  },
  aliases: ["how-to-handle-live-chat-support-for-your-ecommerce-store"],
  relatedSlugs: ["after-hours-live-chat-ecommerce-leads", "chatting-vs-gorgias", "shopify-live-chat"],
  sections: [...ecommerceLiveChatSupportPrimarySections, ...ecommerceLiveChatSupportSecondarySections]
};
