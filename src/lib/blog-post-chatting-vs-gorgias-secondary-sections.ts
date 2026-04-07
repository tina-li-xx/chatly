import { CHATTING_GROWTH_MONTHLY_PRICE } from "@/lib/pricing";
import { comparison, cta, faq, list, paragraph, section } from "@/lib/blog-block-factories";
import type { BlogSection } from "@/lib/blog-types";

export const chattingVsGorgiasSecondarySections: BlogSection[] = [
  section("pricing-comparison", "Pricing feels similar at the bottom, then diverges fast", [
    paragraph("This is one of the biggest differences between the two tools."),
    paragraph(`Chatting starts free, with ${CHATTING_GROWTH_MONTHLY_PRICE} for 1-3 members on Growth. Gorgias starts at $10/month for 50 tickets, then $50/month for 300 tickets, $300/month for 2,000 tickets, and $750/month for 5,000 tickets on annual billing.`),
    paragraph("That does not make Gorgias automatically overpriced. It just means it is built around ticket volume and broader support operations instead of a simple small-team live chat workflow."),
    paragraph("For a support-heavy ecommerce brand, that can be perfectly rational. For a small team still trying to prove that live chat helps capture more buyers and reduce missed conversations, it is a different kind of purchase."),
    comparison(["Chatting", "Gorgias"], [
      { label: "Free plan", values: ["Yes", "No"] },
      { label: "Starter entry point", values: ["50 conversations/month", "50 tickets/month for $10/mo"] },
      { label: "Main paid model", values: ["Monthly team pricing", "Ticket-based pricing"] },
      { label: "Best pricing fit", values: ["Lean teams with modest support volume", "Teams already running a real ecommerce support queue"] }
    ], 0)
  ]),
  section("real-question", "The real question is what problem you are solving", [
    paragraph("If your store is saying: we miss buyers after hours, people ask simple pre-sales questions and leave, and we need a better widget plus a shared inbox, the better answer is probably Chatting."),
    paragraph("If your store is saying: we need one place for support across channels, our ecommerce support operation is getting complex, and we need deeper helpdesk workflows tied to Shopify operations, Gorgias is more believable."),
    list([
      "Choose Chatting if the pain is missed conversations, slow replies, and lightweight lead capture on the storefront.",
      "Choose Gorgias if the pain is scaling a real ecommerce support operation across more channels and higher ticket volume."
    ]),
    paragraph("That is why these tools overlap but are not really the same purchase.")
  ]),
  section("our-take", "Our take", [
    paragraph("For most small ecommerce teams, Chatting is the better fit."),
    list([
      "It is lighter, simpler, and much closer to the storefront conversation itself.",
      "It gives you after-hours capture, visitor context, saved replies, FAQ suggestions, and a shared inbox without helpdesk drag.",
      "It is easier to buy for the team you are now, not the support org you might build later."
    ]),
    paragraph("Gorgias is worth evaluating if you already have a real support function with meaningful volume, omnichannel requirements, and Shopify-heavy support workflows. But most smaller stores should not overbuy just because the product is ecommerce-specific."),
    cta("Try Chatting free", "Get live on your store, capture more after-hours leads, and keep the stack lightweight.", "Try Chatting free", "/login")
  ]),
  section("faq", "FAQ", [
    faq([
      {
        question: "Is Gorgias really a direct Chatting competitor?",
        answer:
          "Sometimes. They overlap on storefront live chat, after-hours handling, and ecommerce support use cases. But Gorgias is really a broader ecommerce helpdesk, while Chatting is a lighter chat-first product for small teams. That means they can be compared, but they are not solving exactly the same-sized problem."
      },
      {
        question: "Which is better for a small ecommerce store that mainly wants more pre-sales conversations?",
        answer:
          "Chatting is usually the better fit. If the job is answering buying questions, reducing hesitation, and capturing more after-hours leads from your storefront, Chatting stays much closer to that workflow without dragging you into a larger support stack."
      },
      {
        question: "When does Gorgias start making more sense than Chatting?",
        answer:
          "When support has become a real operation. If you need omnichannel support, larger ticket volume, Shopify-heavy support workflows, and deeper helpdesk structure, Gorgias becomes more believable. It is stronger when the problem is broader than storefront chat."
      },
      {
        question: "Is Chatting a better fit for after-hours lead capture?",
        answer:
          "Yes, for most small teams. Chatting is a better fit when you want a simple widget, offline capture, visitor context, saved replies, and a shared inbox that helps you follow up without turning every missed conversation into a ticket-management problem."
      },
      {
        question: "How should a small team think about the pricing difference?",
        answer:
          "Chatting uses a simpler small-team pricing model. Gorgias prices around ticket volume and broader support usage. If your store is still proving the value of live chat and after-hours capture, Chatting is usually the easier first buy. If your support queue is already meaningful, Gorgias pricing can make more sense in context."
      },
      {
        question: "What is the biggest difference between Chatting and Gorgias?",
        answer:
          "Chatting is chat-first and storefront-focused. Gorgias is helpdesk-first and built for broader ecommerce support operations. Chatting helps small teams talk to visitors before they bounce. Gorgias helps larger ecommerce support teams manage a wider service workflow."
      }
    ])
  ])
];
