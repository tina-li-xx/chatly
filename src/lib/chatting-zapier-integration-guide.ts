import type { GuideArticle } from "@/lib/guide-article";
import { chattingZapierIntegrationGuideSections } from "@/lib/chatting-zapier-integration-guide-sections";

export const chattingZapierIntegrationGuide: GuideArticle = {
  slug: "chatting-zapier-integration",
  title: "Chatting Zapier integration guide: build triggers and actions that actually help",
  excerpt:
    "Use Chatting with Zapier to trigger Slack, Sheets, and CRM automations when conversations, contacts, and tags change, or send actions back into Chatting.",
  subtitle:
    "A setup guide for teams who want fast no-code automations around Chatting without losing sight of what data should move where.",
  seoTitle: "Chatting Zapier Integration Guide",
  publishedAt: "2026-04-08T15:10:00.000Z",
  updatedAt: "2026-04-08T15:10:00.000Z",
  readingTime: 5,
  image: {
    src: "/blog/chatting-zapier-integration-guide.svg",
    alt: "Chatting Zapier guide artwork with trigger cards, action cards, and linked workflow lines."
  },
  sections: chattingZapierIntegrationGuideSections
};
