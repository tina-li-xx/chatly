import type { BlogPost } from "@/lib/blog-types";
import { shopifyLiveChatGrowthUsesPrimarySections } from "@/lib/blog-post-shopify-live-chat-growth-uses-primary-sections";
import { shopifyLiveChatGrowthUsesSecondarySections } from "@/lib/blog-post-shopify-live-chat-growth-uses-secondary-sections";

export const shopifyLiveChatGrowthUsesPost: BlogPost = {
  slug: "shopify-live-chat-growth-uses",
  title: "7 ways Shopify stores use live chat for growth, not just support",
  excerpt:
    "Most Shopify stores use live chat for support. The better ones use it for product advice, checkout rescue, lead capture, and conversion growth.",
  subtitle:
    "Live chat should do more than absorb where-is-my-order questions. The best stores use it earlier in the buying journey to reduce hesitation and recover intent.",
  seoTitle: "7 Ways Shopify Stores Use Live Chat for Growth, Not Just Support",
  publicationStatus: "scheduled",
  publishedAt: "2026-05-01T09:00:00.000Z",
  updatedAt: "2026-05-01T09:00:00.000Z",
  readingTime: 9,
  authorSlug: "tina",
  categorySlug: "conversion",
  image: {
    src: "/blog/shopify-live-chat-growth-uses.svg",
    alt: "Illustration showing a Shopify storefront using live chat for product advice, checkout rescue, and lead capture."
  },
  relatedSlugs: ["add-live-chat-to-shopify", "after-hours-live-chat-ecommerce-leads", "traffic-low-conversion"],
  sections: [...shopifyLiveChatGrowthUsesPrimarySections, ...shopifyLiveChatGrowthUsesSecondarySections]
};
