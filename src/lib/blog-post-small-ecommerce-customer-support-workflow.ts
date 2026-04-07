import type { BlogPost } from "@/lib/blog-types";
import { smallEcommerceCustomerSupportWorkflowPrimarySections } from "@/lib/blog-post-small-ecommerce-customer-support-workflow-primary-sections";
import { smallEcommerceCustomerSupportWorkflowSecondarySections } from "@/lib/blog-post-small-ecommerce-customer-support-workflow-secondary-sections";

export const smallEcommerceCustomerSupportWorkflowPost: BlogPost = {
  slug: "small-ecommerce-customer-support-workflow",
  title: "How small ecommerce stores actually handle customer support without a full team",
  excerpt:
    "Refunds, cancellations, and order questions can eat up a small store's day. Here is how lean ecommerce teams actually handle support, what gets automated, and where Chatting fits.",
  subtitle:
    "Small stores do not need fake autopilot. They need a support workflow that automates the repetitive layer, keeps risky actions under review, and does not create one more system to babysit.",
  seoTitle: "How Small Ecommerce Stores Actually Handle Customer Support Without a Full Team",
  publicationStatus: "scheduled",
  publishedAt: "2026-04-24T09:00:00.000Z",
  updatedAt: "2026-04-24T09:00:00.000Z",
  readingTime: 8,
  authorSlug: "tina",
  categorySlug: "small-teams",
  image: {
    src: "/blog/small-ecommerce-customer-support-workflow.svg",
    alt: "Illustration of a lean ecommerce support workflow with chat, refunds, cancellations, and order questions."
  },
  relatedSlugs: ["ecommerce-live-chat-support", "after-hours-live-chat-ecommerce-leads", "chatting-vs-gorgias"],
  sections: [...smallEcommerceCustomerSupportWorkflowPrimarySections, ...smallEcommerceCustomerSupportWorkflowSecondarySections]
};
