import type { GuideArticle } from "@/lib/guide-article";
import { chattingSlackIntegrationGuideSections } from "@/lib/chatting-slack-integration-guide-sections";

export const chattingSlackIntegrationGuide: GuideArticle = {
  slug: "chatting-slack-integration",
  title: "Chatting Slack integration guide: connect alerts and reply from Slack",
  excerpt:
    "Connect Slack to Chatting so your team sees new conversations quickly, controls which alerts land in-channel, and optionally replies from Slack threads.",
  subtitle:
    "A practical walkthrough for teams who want Chatting alerts in Slack without turning one channel into a firehose.",
  seoTitle: "Chatting Slack Integration Guide",
  publishedAt: "2026-04-08T15:00:00.000Z",
  updatedAt: "2026-04-08T15:00:00.000Z",
  readingTime: 4,
  image: {
    src: "/blog/chatting-slack-integration-guide.svg",
    alt: "Chatting Slack guide artwork with a Slack channel, conversation cards, and reply arrows."
  },
  sections: chattingSlackIntegrationGuideSections
};
