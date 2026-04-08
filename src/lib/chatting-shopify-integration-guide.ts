import type { GuideArticle } from "@/lib/guide-article";
import { chattingShopifyIntegrationGuideSections } from "@/lib/chatting-shopify-integration-guide-sections";

export const chattingShopifyIntegrationGuide: GuideArticle = {
  slug: "chatting-shopify-integration",
  title: "Chatting Shopify integration guide: bring order context into the inbox",
  excerpt:
    "Connect Shopify to Chatting so your team can see customer and order context directly inside the inbox before replying.",
  subtitle:
    "A simple setup guide for ecommerce teams who want fewer tab switches and more useful context when shoppers ask for help.",
  seoTitle: "Chatting Shopify Integration Guide",
  publishedAt: "2026-04-08T15:20:00.000Z",
  updatedAt: "2026-04-08T15:20:00.000Z",
  readingTime: 4,
  image: {
    src: "/blog/chatting-shopify-integration-guide.svg",
    alt: "Chatting Shopify guide artwork with customer cards, order summaries, and a storefront panel."
  },
  sections: chattingShopifyIntegrationGuideSections
};
