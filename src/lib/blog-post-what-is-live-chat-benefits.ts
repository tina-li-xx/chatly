import type { BlogPost } from "@/lib/blog-types";
import { whatIsLiveChatBenefitsPrimarySections } from "@/lib/blog-post-what-is-live-chat-benefits-primary-sections";
import { whatIsLiveChatBenefitsSecondarySections } from "@/lib/blog-post-what-is-live-chat-benefits-secondary-sections";

export const whatIsLiveChatBenefitsPost: BlogPost = {
  slug: "what-is-live-chat-benefits",
  title: "What is live chat? 12 real benefits for small businesses",
  excerpt:
    "Live chat is no longer just a support tool. Here is what live chat is, why it matters, and why Chatting is such a strong fit for small businesses in 2026.",
  subtitle:
    "Live chat now sits closer to conversion, customer experience, and team efficiency than many small businesses realize. The right setup helps you answer faster without buying an oversized support stack.",
  seoTitle: "What Is Live Chat? 12 Real Benefits for Small Businesses",
  publicationStatus: "scheduled",
  publishedAt: "2026-05-15T09:00:00.000Z",
  updatedAt: "2026-05-15T09:00:00.000Z",
  readingTime: 9,
  authorSlug: "tina",
  categorySlug: "live-chat-tips",
  image: {
    src: "/blog/what-is-live-chat-benefits.svg",
    alt: "Illustration of a website chat widget connected to support, sales, and analytics benefits for a small business."
  },
  aliases: ["what-is-live-chat", "benefits-of-live-chat-for-small-business"],
  relatedSlugs: ["live-chat-worth-it-small-business", "best-live-chat-tools-small-business", "live-chat-software-small-teams"],
  sections: [...whatIsLiveChatBenefitsPrimarySections, ...whatIsLiveChatBenefitsSecondarySections]
};
