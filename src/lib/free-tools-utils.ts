import { buildAbsoluteUrl } from "@/lib/blog-utils";
import type { FreeTool, FreeToolFaqItem } from "@/lib/free-tools-data";

export function buildFreeToolSchema(tool: FreeTool) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: tool.title,
    description: tool.description,
    url: buildAbsoluteUrl(tool.href),
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD"
    },
    provider: {
      "@type": "Organization",
      name: "Chatting",
      url: buildAbsoluteUrl("/")
    }
  };
}

export function buildFreeToolFaqSchema(items: FreeToolFaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer
      }
    }))
  };
}
