import type { BlogPost } from "@/lib/blog-types";
import { afterHoursLiveChatEcommerceLeadsPrimarySections } from "@/lib/blog-post-after-hours-live-chat-ecommerce-leads-primary-sections";
import { afterHoursLiveChatEcommerceLeadsSecondarySections } from "@/lib/blog-post-after-hours-live-chat-ecommerce-leads-secondary-sections";

export const afterHoursLiveChatEcommerceLeadsPost: BlogPost = {
  slug: "after-hours-live-chat-ecommerce-leads",
  title: "After-hours live chat for e-commerce: how small stores capture better leads",
  excerpt:
    "Most small stores do not lose after-hours visitors because of traffic. They lose them because nobody answers in time. Here is how live chat helps capture better leads without a 24/7 team.",
  subtitle:
    "When shoppers land late with one or two buying questions, silence costs more than most stores realize. A lightweight chat setup keeps the conversation alive.",
  seoTitle: "After-Hours Live Chat for E-Commerce: How Small Stores Capture Better Leads",
  publishedAt: "2026-04-03T16:30:00.000Z",
  updatedAt: "2026-04-03T16:30:00.000Z",
  readingTime: 8,
  authorSlug: "tina",
  categorySlug: "case-studies",
  image: {
    src: "/blog/after-hours-live-chat-ecommerce-leads.svg",
    alt: "Illustrated night-time storefront dashboard with an active chat bubble capturing an after-hours lead."
  },
  aliases: ["after-hours-live-chat-for-e-commerce-how-small-stores-capture-better-leads"],
  relatedSlugs: ["ecommerce-live-chat-support", "chatting-vs-gorgias", "live-chat-vs-contact-forms"],
  sections: [...afterHoursLiveChatEcommerceLeadsPrimarySections, ...afterHoursLiveChatEcommerceLeadsSecondarySections]
};
