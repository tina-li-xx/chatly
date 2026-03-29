import type { BlogPost } from "@/lib/blog-types";
import { addLiveChatToShopifyPrimarySections } from "@/lib/blog-post-add-live-chat-to-shopify-primary-sections";
import { addLiveChatToShopifySecondarySections } from "@/lib/blog-post-add-live-chat-to-shopify-secondary-sections";

export const addLiveChatToShopifyPost: BlogPost = {
  slug: "add-live-chat-to-shopify",
  title: "Add live chat to your Shopify store in 5 minutes",
  excerpt: "Add live chat to your Shopify store in under 5 minutes. No coding required. Free plan available. Follow our step-by-step guide.",
  subtitle: "No developer needed. No app install required. Just copy one line of code and start talking to customers.",
  seoTitle: "How to Add Live Chat to Shopify in 5 Minutes (Step-by-Step)",
  publishedAt: "2026-03-15T09:00:00.000Z",
  updatedAt: "2026-03-15T09:00:00.000Z",
  readingTime: 9,
  authorSlug: "tina",
  categorySlug: "how-to-guides",
  image: { src: "/blog/add-live-chat-to-shopify.svg", alt: "Shopify-themed storefront artwork with a live chat widget installation panel." },
  relatedSlugs: ["wordpress-live-chat-setup", "live-chat-vs-contact-forms", "reduce-response-time-under-2-minutes"],
  sections: [...addLiveChatToShopifyPrimarySections, ...addLiveChatToShopifySecondarySections]
};
