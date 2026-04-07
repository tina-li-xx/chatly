import type { BlogPost } from "@/lib/blog-types";
import { liveChatSoftwareSmallTeamsPrimarySections } from "@/lib/blog-post-live-chat-software-small-teams-primary-sections";
import { liveChatSoftwareSmallTeamsSecondarySections } from "@/lib/blog-post-live-chat-software-small-teams-secondary-sections";

export const liveChatSoftwareSmallTeamsPost: BlogPost = {
  slug: "live-chat-software-small-teams",
  title: "Live chat software for small teams: what actually matters",
  excerpt:
    "Small team? You don't need enterprise chat software. Here's what to look for — and what to ignore — when choosing live chat for teams of 2-20 people.",
  subtitle:
    "Enterprise tools want enterprise budgets and a dedicated admin. You want to answer customer questions. Let's find the middle ground.",
  seoTitle: "Live Chat Software for Small Teams: What Actually Matters (2026)",
  publishedAt: "2026-03-30T09:00:00.000Z",
  updatedAt: "2026-03-30T09:00:00.000Z",
  readingTime: 10,
  authorSlug: "tina",
  categorySlug: "small-teams",
  image: {
    src: "/blog/live-chat-software-small-teams.svg",
    alt: "Illustrated team inbox and chat widget representing live chat software for small teams."
  },
  relatedSlugs: ["best-live-chat-software-customer-support", "ecommerce-live-chat-support", "live-chat-vs-contact-forms"],
  sections: [...liveChatSoftwareSmallTeamsPrimarySections, ...liveChatSoftwareSmallTeamsSecondarySections]
};
