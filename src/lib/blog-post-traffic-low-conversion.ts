import type { BlogPost } from "@/lib/blog-types";
import { trafficLowConversionPrimarySections } from "@/lib/blog-post-traffic-low-conversion-primary-sections";
import { trafficLowConversionSecondarySections } from "@/lib/blog-post-traffic-low-conversion-secondary-sections";

export const trafficLowConversionPost: BlogPost = {
  slug: "traffic-low-conversion",
  title: "Getting traffic but not enough sales or leads? How to find what is blocking conversions",
  excerpt:
    "Getting traffic but not enough sales or leads usually means something in the journey is creating friction, confusion, or doubt. Here is how to find it.",
  subtitle:
    "A low-converting site usually has unresolved questions, weak trust, or too much friction. The goal is to uncover the blockers before paying for more traffic.",
  seoTitle: "Getting Traffic But Not Enough Sales or Leads? How to Find What’s Blocking Conversions",
  publicationStatus: "scheduled",
  publishedAt: "2026-04-17T09:00:00.000Z",
  updatedAt: "2026-04-17T09:00:00.000Z",
  readingTime: 8,
  authorSlug: "tina",
  categorySlug: "conversion",
  image: {
    src: "/blog/traffic-low-conversion.svg",
    alt: "Illustration of website traffic flowing into a funnel with buyer questions highlighted before conversion."
  },
  relatedSlugs: ["after-hours-live-chat-ecommerce-leads", "live-chat-software-small-teams", "reduce-response-time-under-2-minutes"],
  sections: [...trafficLowConversionPrimarySections, ...trafficLowConversionSecondarySections]
};
