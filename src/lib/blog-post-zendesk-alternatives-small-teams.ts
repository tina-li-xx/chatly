import type { BlogPost } from "@/lib/blog-types";
import { zendeskAlternativesSmallTeamsPrimarySections } from "@/lib/blog-post-zendesk-alternatives-small-teams-primary-sections";
import { zendeskAlternativesSmallTeamsSecondarySections } from "@/lib/blog-post-zendesk-alternatives-small-teams-secondary-sections";

export const zendeskAlternativesSmallTeamsPost: BlogPost = {
  slug: "zendesk-alternatives-small-teams",
  title: "Zendesk alternatives for small teams: 5 better fits if you do not need enterprise support ops",
  excerpt:
    "Looking for a Zendesk alternative? Here are 5 options worth considering for small teams, plus why Chatting is the best fit if you want live chat without helpdesk bloat.",
  subtitle:
    "Zendesk is not bad software. It is just very easy for a small team to overbuy. The real question is what actually fits a lean team better.",
  seoTitle: "Zendesk Alternatives for Small Teams: 5 Better Fits If You Don’t Need Enterprise Support Ops",
  publicationStatus: "scheduled",
  publishedAt: "2026-04-14T09:00:00.000Z",
  updatedAt: "2026-04-14T09:00:00.000Z",
  readingTime: 10,
  authorSlug: "tina",
  categorySlug: "comparisons",
  image: {
    src: "/blog/zendesk-alternatives-small-teams.svg",
    alt: "Comparison artwork showing a heavy helpdesk stack beside lighter live chat and inbox alternatives for small teams."
  },
  aliases: [
    "best-zendesk-alternatives-small-teams",
    "zendesk-alternative-small-teams",
    "zendesk-alternative-for-small-teams"
  ],
  relatedSlugs: ["chatting-vs-zendesk", "intercom-alternatives-small-business", "best-live-chat-software-customer-support"],
  sections: [...zendeskAlternativesSmallTeamsPrimarySections, ...zendeskAlternativesSmallTeamsSecondarySections]
};
