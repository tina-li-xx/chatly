import type { BlogPost } from "@/lib/blog-types";
import { chatlyVsZendeskSections } from "@/lib/blog-post-chatly-vs-zendesk-sections";

export const chatlyVsZendeskPost: BlogPost = {
  slug: "chatting-vs-zendesk",
  title: "Chatting vs Zendesk: Conversations vs tickets",
  excerpt: "Zendesk is built for tickets. Chatting is built for conversations. See which live chat tool is right for your small team.",
  subtitle: "Zendesk turns every chat into a ticket. Chatting keeps it a conversation. Here's why that matters for small teams.",
  seoTitle: "Chatting vs Zendesk: Live Chat Without the Help Desk",
  publishedAt: "2026-03-08T09:00:00.000Z",
  updatedAt: "2026-03-08T09:00:00.000Z",
  readingTime: 7,
  authorSlug: "tina",
  categorySlug: "comparisons",
  image: { src: "/blog/chatting-vs-zendesk.svg", alt: "Abstract comparison card showing chat conversations versus ticket queues." },
  aliases: ["chatly-vs-zendesk"],
  relatedSlugs: ["chatting-vs-intercom", "best-intercom-alternatives-small-teams", "reduce-response-time-under-2-minutes"],
  sections: chatlyVsZendeskSections
};
