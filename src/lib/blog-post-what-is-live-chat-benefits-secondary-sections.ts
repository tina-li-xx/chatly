import { CHATTING_GROWTH_MONTHLY_PRICE, CHATTING_STARTER_PLAN_LINE } from "@/lib/pricing";
import { cta, faq, list, paragraph, section } from "@/lib/blog-block-factories";
import type { BlogSection } from "@/lib/blog-types";

export const whatIsLiveChatBenefitsSecondarySections: BlogSection[] = [
  section("growth-and-cost-benefits", "Benefits 7-12: revenue, insight, and scale", [
    list([
      "7. More revenue: many live chat conversations happen before the purchase, not after. That makes chat useful for product advice, objection handling, and cart recovery.",
      "8. Lower support costs: chat is often cheaper to manage than phone support, and automation helps reduce the time spent on repetitive questions.",
      "9. Better after-hours coverage: offline capture, business hours, and smart follow-up workflows help small teams stay useful without 24/7 staffing.",
      "10. Faster response times: a quick first answer is strongly tied to better experience and better conversion outcomes.",
      "11. Better insight into customer needs: chat transcripts reveal repeat questions, pain points, and trust gaps that improve copy, product decisions, and support quality.",
      "12. Easier scalability: as a business grows, live chat helps absorb more demand without requiring proportional hiring right away."
    ]),
    paragraph("That is why live chat is no longer just a support channel. It is a practical business system for learning faster, converting more intent, and keeping workload under control.")
  ]),
  section("why-chatting-fits", "Why Chatting fits this well", [
    paragraph("This is exactly where Chatting makes sense. Most small businesses do not need a huge enterprise support stack. They need a customizable widget, a shared inbox, visitor context, saved replies, after-hours capture, and useful automation without helpdesk bloat."),
    paragraph("That is the mistake a lot of teams make. They decide live chat matters, then buy software designed for larger support operations. The result is more admin, more complexity, and a slower team."),
    list([
      "Use Chatting to answer pre-sales and support questions faster from one shared inbox.",
      "Use Chatting to catch after-hours intent instead of letting it disappear.",
      "Use Chatting to keep useful visitor context close so replies feel faster and more relevant.",
      "Use Chatting to learn what customers keep asking so the site gets clearer over time."
    ]),
    paragraph(`Pricing also fits the stage most small businesses are actually in: ${CHATTING_STARTER_PLAN_LINE}. Growth starts at ${CHATTING_GROWTH_MONTHLY_PRICE} for 1-3 members.`),
    paragraph("That makes live chat more than a support feature. With Chatting, it becomes part of how a small business stays responsive, learns faster, and converts more intent without overbuilding operations.")
  ]),
  section("key-takeaway", "Key takeaway", [
    paragraph("Live chat is no longer just a support tool. It improves customer experience, increases team efficiency, drives revenue, and reduces the cost of handling the same questions badly."),
    paragraph("For most small businesses, the next conclusion is not just live chat matters. It is that a lighter chat-first product like Chatting makes more sense than dragging in a bigger support system too early."),
    paragraph("In 2026, live chat is getting much closer to a must-have than a nice-to-have for small businesses that want to answer while the moment still matters."),
    cta(
      "See what live chat looks like with Chatting",
      "Use Chatting to turn faster replies, better context, and after-hours capture into a manageable workflow for a small team without enterprise overhead.",
      "Start free with Chatting",
      "/login"
    )
  ]),
  section("faq", "FAQ", [
    faq([
      {
        question: "What is live chat in simple terms?",
        answer:
          "It is real-time messaging between a business and a visitor on the website. It gives people a faster way to ask questions than email and a lower-friction option than phone support."
      },
      {
        question: "Is live chat only for customer support?",
        answer:
          "No. It is also useful for sales questions, product recommendations, checkout hesitation, after-hours lead capture, and understanding what visitors still need before they convert."
      },
      {
        question: "Is live chat worth it for a small business?",
        answer:
          "Usually yes when faster answers can help save leads, sales, or customer satisfaction. The main risk is overbuying software or creating a workflow the team cannot maintain."
      },
      {
        question: "Do small businesses need 24/7 live chat?",
        answer:
          "No. Most need a better after-hours handoff, not round-the-clock staffing. Offline capture and clear reply expectations are usually enough."
      },
      {
        question: "Where does Chatting fit?",
        answer:
          "Chatting fits when a small business wants the real benefits of live chat without taking on enterprise-style support complexity. It is strongest for teams that want a widget, a shared inbox, visitor context, saved replies, and after-hours capture without helpdesk sprawl."
      },
      {
        question: "What if I want live chat benefits without buying a full support platform?",
        answer:
          `That is exactly the gap Chatting is built for. You can start with ${CHATTING_STARTER_PLAN_LINE.toLowerCase()} and move to Growth at ${CHATTING_GROWTH_MONTHLY_PRICE} for 1-3 members if you need more room, without stepping straight into heavier support software.`
      }
    ])
  ])
];
