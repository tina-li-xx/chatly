import { CHATLY_GROWTH_MONTHLY_PRICE, getChatlyPaidStartingPriceCopy } from "@/lib/chatly-pricing-copy";
import { comparison, cta, list, paragraph, section } from "@/lib/blog-block-factories";
import type { BlogSection } from "@/lib/blog-types";

export const bestIntercomAlternativesSecondarySections: BlogSection[] = [
  section("drift-best-for-b2b-sales", "5. Drift — Best for B2B sales", [
    paragraph("Price: Custom ($$$$)"),
    paragraph("Best for: B2B companies focused on lead generation"),
    paragraph("Drift positions itself as a \"revenue acceleration platform.\" It's powerful for B2B sales teams but priced accordingly."),
    paragraph("Pros:"), list(["Excellent for lead routing", "Strong ABM features", "Good Salesforce integration"]),
    paragraph("Cons:"), list(["Enterprise pricing", "Complex to set up", "Overkill for most small teams"]),
    paragraph("Pricing: Contact sales (typically $400+/month)")
  ]),
  section("hubspot-best-for-hubspot-users", "6. HubSpot Live Chat — Best for HubSpot users", [
    paragraph("Price: Free – included in HubSpot plans"),
    paragraph("Best for: Teams already using HubSpot CRM"),
    paragraph("If you're on HubSpot, their built-in chat is a no-brainer. It's free and integrates seamlessly with your CRM."),
    paragraph("Pros:"), list(["Free with HubSpot", "Deep CRM integration", "Chatbot builder included"]),
    paragraph("Cons:"), list(["Requires HubSpot ecosystem", "Limited as standalone chat", "Free version has HubSpot branding"]),
    paragraph("Pricing: Free with HubSpot CRM (or included in paid plans)")
  ]),
  section("olark-runner-up", "7. Olark — Best for simplicity (runner-up)", [
    paragraph("Price: $29/seat/month"),
    paragraph("Best for: Small teams wanting straightforward chat"),
    paragraph("Olark is another simple live chat tool. Similar to Chatting but with per-seat pricing."),
    paragraph("Pros:"), list(["Clean interface", "Good automation rules", "Solid reporting"]),
    paragraph("Cons:"), list(["Per-seat pricing", "Fewer features than modern alternatives", "Dated design"]),
    paragraph("Pricing: $29/seat/month (or $23/seat annually)")
  ]),
  section("quick-comparison-table", "Quick comparison table", [
    comparison(["Tool", "Starting Price", "Best For", "Free Plan"], [
      { label: "Chatting", values: [CHATLY_GROWTH_MONTHLY_PRICE.replace("/month", ""), "Simplicity", "✓"] },
      { label: "Crisp", values: ["$25/mo (4 users)", "Free option", "✓"] },
      { label: "Tidio", values: ["$19/operator", "E-commerce", "✓"] },
      { label: "LiveChat", values: ["$20/agent", "Established teams", "✗"] },
      { label: "Drift", values: ["$400+/mo", "B2B sales", "✗"] },
      { label: "HubSpot", values: ["Free (with CRM)", "HubSpot users", "✓"] },
      { label: "Olark", values: ["$29/seat", "Simple chat", "✗"] }
    ], 0)
  ]),
  section("our-recommendation", "Our recommendation", [
    paragraph("If you're a small team (under 20 people) who wants live chat without the complexity:"),
    paragraph(`Start with Chatting. It's free to try, takes 5 minutes to set up, and starts at ${getChatlyPaidStartingPriceCopy().replace("Free – from ", "")} when you're ready to upgrade. You keep the pricing simple and skip the enterprise bloat.`),
    cta("Try Chatting free", "", "Try Chatting free", "/login")
  ])
];
