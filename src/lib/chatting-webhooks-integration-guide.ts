import type { GuideArticle } from "@/lib/guide-article";
import { chattingWebhooksIntegrationGuideSections } from "@/lib/chatting-webhooks-integration-guide-sections";

export const chattingWebhooksIntegrationGuide: GuideArticle = {
  slug: "chatting-webhooks-integration",
  title: "Chatting webhooks guide: send conversation events to your own endpoint",
  excerpt:
    "Use Chatting webhooks when you want raw conversation, contact, and tag events sent directly to your own backend or automation service.",
  subtitle:
    "A practical webhook guide for teams that want secure event delivery, signature verification, and direct control over how Chatting events are processed.",
  seoTitle: "Chatting Webhooks Guide",
  publishedAt: "2026-04-08T15:30:00.000Z",
  updatedAt: "2026-04-08T15:30:00.000Z",
  readingTime: 4,
  image: {
    src: "/blog/chatting-webhooks-integration-guide.svg",
    alt: "Chatting webhooks guide artwork with event payload cards flowing into a secure endpoint."
  },
  sections: chattingWebhooksIntegrationGuideSections
};
