import type { GuideArticle } from "@/lib/guide-article";
import { chattingApiReferenceGuideSections } from "@/lib/chatting-api-reference-guide-sections";

export const chattingApiReferenceGuide: GuideArticle = {
  slug: "chatting-api-reference",
  title: "Chatting API reference",
  excerpt:
    "Overview of Chatting's supported external API surface, including Zapier endpoints and the first-party browser and dashboard routes used by the product.",
  subtitle:
    "Use this page to understand which Chatting endpoints are partner-facing and which are first-party product routes.",
  seoTitle: "Chatting API Reference",
  publishedAt: "2026-04-16T18:00:00.000Z",
  updatedAt: "2026-04-16T18:00:00.000Z",
  readingTime: 4,
  image: {
    src: "/blog/chatting-zapier-api-reference.svg",
    alt: "Chatting API reference cover with endpoint and response panels."
  },
  sections: chattingApiReferenceGuideSections
};
