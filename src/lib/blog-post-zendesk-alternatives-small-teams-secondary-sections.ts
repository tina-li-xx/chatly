import { cta, faq, list, paragraph, section } from "@/lib/blog-block-factories";
import type { BlogSection } from "@/lib/blog-types";

export const zendeskAlternativesSmallTeamsSecondarySections: BlogSection[] = [
  section("freshdesk-lower-entry-helpdesk", "4. Freshdesk — Best if you still think in tickets", [
    paragraph("Price: Growth from $19/agent/month billed annually, Pro from $55/agent/month, Enterprise from $89/agent/month."),
    paragraph("Best for: Teams that still want a classic help desk, just at a lower entry point than Zendesk."),
    paragraph("Freshdesk is worth a look if your team still wants ticketing, reports, routing, and portal basics, but Zendesk feels too expensive or too heavy for the stage you are at."),
    paragraph("Where it loses to Chatting: if your real Zendesk frustration is the weight of ticket-first support software itself, Freshdesk can feel like a smaller version of the same category rather than a true simplification.")
  ]),
  section("gorgias-ecommerce-ops", "5. Gorgias — Best for ecommerce support operations", [
    paragraph("Price: Starter from $10/month for 50 tickets, Basic from $50/month for 300 tickets, Pro from $300/month for 2,000 tickets."),
    paragraph("Best for: Ecommerce teams that want a support platform tied to store operations."),
    paragraph("Gorgias belongs in a Zendesk-alternatives conversation because it is a more ecommerce-native support tool. If your support work is tightly tied to order context, store workflows, and higher ticket volume, it makes more sense than forcing Zendesk to fit."),
    paragraph("Where it loses to Chatting: if your store mainly needs faster conversations, after-hours capture, and a lighter chat-first workflow, Gorgias is still more platform than many small teams need.")
  ]),
  section("our-take", "Our take", [
    paragraph("If you are a small team looking for a Zendesk alternative, the biggest mistake is replacing one oversized system with another."),
    list([
      "Choose Chatting when the real job is website conversations, shared inbox visibility, and faster replies.",
      "Choose Help Scout if you want a calmer support desk and help-center workflow.",
      "Choose Crisp if you want broader inbox coverage and workspace pricing.",
      "Choose Freshdesk if you still want a classic help desk at a lower entry point.",
      "Choose Gorgias if support is becoming a real ecommerce operation."
    ]),
    paragraph("For most small teams who are really trying to get out of helpdesk bloat and back to faster conversations, Chatting is the best fit."),
    cta("Try Chatting free", "Get the shared inbox, visitor context, and live chat workflow you actually need without the enterprise support overhead.", "Try Chatting free", "/login")
  ]),
  section("faq", "FAQ", [
    faq([
      {
        question: "What is the best Zendesk alternative for small teams?",
        answer:
          "For most small teams, Chatting is the best fit if the main need is live chat, a shared inbox, faster replies, and less support-software overhead."
      },
      {
        question: "What if I still need a real help desk?",
        answer:
          "Help Scout and Freshdesk are stronger options if you still want a support-desk-first workflow without going all the way back to Zendesk."
      },
      {
        question: "Is Zendesk better than Chatting?",
        answer:
          "Zendesk is better for larger, ticket-heavy support operations. Chatting is better when the real job is live conversations for a lean team."
      },
      {
        question: "Which Zendesk alternative is best for ecommerce?",
        answer:
          "Gorgias is the strongest ecommerce-native support platform in this group. Chatting is better if you want a lighter chat-first setup for a smaller store."
      },
      {
        question: "Why do small teams leave Zendesk?",
        answer:
          "Usually because of complexity, pricing, and the fact that many smaller teams do not actually need enterprise-style service operations."
      }
    ])
  ])
];
