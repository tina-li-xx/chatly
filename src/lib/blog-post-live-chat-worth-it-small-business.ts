import type { BlogPost } from "@/lib/blog-types";
import { liveChatWorthItSmallBusinessPrimarySections } from "@/lib/blog-post-live-chat-worth-it-small-business-primary-sections";
import { liveChatWorthItSmallBusinessSecondarySections } from "@/lib/blog-post-live-chat-worth-it-small-business-secondary-sections";

export const liveChatWorthItSmallBusinessPost: BlogPost = {
  slug: "live-chat-worth-it-small-business",
  title: "Is live chat actually worth it for a small business? How to decide without adding another thing to manage",
  excerpt:
    "Thinking about adding live chat to your site? Here is how small businesses decide whether it is actually worth it, and how to make it manageable without 24/7 staffing.",
  subtitle:
    "Live chat can help conversions, speed up support, and uncover buyer questions. It can also become another neglected inbox if the setup is wrong.",
  seoTitle: "Is Live Chat Actually Worth It for a Small Business? How to Decide Without Adding Another Thing to Manage",
  publicationStatus: "draft",
  publishedAt: "2026-05-08T09:00:00.000Z",
  updatedAt: "2026-05-08T09:00:00.000Z",
  readingTime: 8,
  authorSlug: "tina",
  categorySlug: "small-teams",
  image: {
    src: "/blog/live-chat-worth-it-small-business.svg",
    alt: "Illustration of a small-business website balancing live chat value against team workload and response speed."
  },
  aliases: ["is-live-chat-worth-it-small-business"],
  relatedSlugs: ["live-chat-software-small-teams", "best-live-chat-tools-small-business", "ecommerce-live-chat-support"],
  sections: [...liveChatWorthItSmallBusinessPrimarySections, ...liveChatWorthItSmallBusinessSecondarySections]
};
