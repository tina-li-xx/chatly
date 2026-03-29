import type { BlogPost } from "@/lib/blog-types";
import { wordpressLiveChatSetupPrimarySections } from "@/lib/blog-post-wordpress-live-chat-setup-primary-sections";
import { wordpressLiveChatSetupSecondarySections } from "@/lib/blog-post-wordpress-live-chat-setup-secondary-sections";

export const wordpressLiveChatSetupPost: BlogPost = {
  slug: "wordpress-live-chat-setup",
  title: "Add live chat to WordPress in 5 minutes",
  excerpt: "Add live chat to WordPress in 5 minutes. No plugin required. Works with any theme. Step-by-step guide with screenshots.",
  subtitle: "No bloated plugin. No PHP editing. Just paste one line of code and start chatting with visitors.",
  seoTitle: "How to Add Live Chat to WordPress (The Easy Way)",
  publishedAt: "2026-02-22T09:00:00.000Z",
  updatedAt: "2026-02-22T09:00:00.000Z",
  readingTime: 9,
  authorSlug: "tina",
  categorySlug: "how-to-guides",
  image: { src: "/blog/wordpress-live-chat-setup.svg", alt: "WordPress dashboard-themed artwork with a live chat installation snippet." },
  relatedSlugs: ["add-live-chat-to-shopify", "reduce-response-time-under-2-minutes", "live-chat-vs-contact-forms"],
  sections: [...wordpressLiveChatSetupPrimarySections, ...wordpressLiveChatSetupSecondarySections]
};
