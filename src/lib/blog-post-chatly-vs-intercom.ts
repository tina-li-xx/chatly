import type { BlogPost } from "@/lib/blog-types";
import { chatlyVsIntercomPrimarySections } from "@/lib/blog-post-chatly-vs-intercom-primary-sections";
import { chatlyVsIntercomSecondarySections } from "@/lib/blog-post-chatly-vs-intercom-secondary-sections";

export const chatlyVsIntercomPost: BlogPost = {
  slug: "chatting-vs-intercom",
  title: "Chatting vs Intercom: The honest comparison",
  excerpt:
    "Comparing Chatting and Intercom for small teams. See pricing, features, and why 2,400+ teams chose Chatting over enterprise chat tools.",
  subtitle:
    "Intercom is powerful. It's also $500+/month and built for enterprises. Here's how Chatting compares for teams who don't need all that.",
  seoTitle: "Chatting vs Intercom: Which Live Chat Is Right for Small Teams?",
  publishedAt: "2026-03-29T09:00:00.000Z",
  updatedAt: "2026-03-29T09:00:00.000Z",
  readingTime: 8,
  authorSlug: "tina",
  categorySlug: "comparisons",
  image: {
    src: "/blog/chatting-vs-intercom.svg",
    alt: "Split-panel illustration showing a lightweight chat tool compared with a heavier support suite."
  },
  featured: true,
  showInlineCta: false,
  aliases: ["chatly-vs-intercom"],
  relatedSlugs: ["chatting-vs-zendesk", "best-intercom-alternatives-small-teams", "reduce-response-time-under-2-minutes"],
  sections: [...chatlyVsIntercomPrimarySections, ...chatlyVsIntercomSecondarySections]
};
