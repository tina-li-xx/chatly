import { cta, faq, list, paragraph, section } from "@/lib/blog-block-factories";
import type { BlogSection } from "@/lib/blog-types";

export const shopifyLiveChatGrowthUsesSecondarySections: BlogSection[] = [
  section("after-hours-lead-capture", "4. After-hours lead capture for buyers who are close", [
    paragraph("A lot of Shopify traffic comes in outside business hours. Without chat, those visitors leave with their question unanswered."),
    paragraph("With the right setup, they can get a fast answer to common questions, leave their details for follow-up, and stay in the conversation even if your team replies later."),
    paragraph("Many small stores do not need 24/7 support. They need a better after-hours handoff.")
  ]),
  section("lead-qualification", "5. Lead qualification for higher-consideration purchases", [
    paragraph("Not every Shopify store is selling a low-ticket impulse buy. Some sell customizable products, higher-ticket items, bulk orders, or products that need more explanation before purchase."),
    paragraph("In those cases, live chat can do more than answer questions. It can qualify intent and show you who needs follow-up, who is asking about custom work, and who is seriously evaluating the offer.")
  ]),
  section("objection-mining", "6. Objection mining for better pages and ads", [
    paragraph("Most stores guess at objections. Live chat shows them to you directly."),
    list([
      "People do not understand the difference between two products",
      "The shipping timeline is not clear enough",
      "The value at the current price is not obvious enough",
      "The sizing chart is not doing its job"
    ]),
    paragraph("Those questions help you improve product-page copy, FAQs, comparison tables, ads, and checkout reassurance.")
  ]),
  section("retention-value", "7. Higher-converting repeat customer support", [
    paragraph("Even the boring support questions can have growth value if handled well. Fast help and clean answers make the store feel safer and easier to buy from again."),
    paragraph("This is not the flashy growth-hack answer, but it matters. Stores that feel responsive tend to convert better over time.")
  ]),
  section("our-take", "Our take", [
    paragraph("If you only use live chat to answer support questions, you are probably underusing it."),
    list([
      "Use it before the wrong product gets chosen",
      "Use it before sizing doubt turns into bounce",
      "Use it before cart hesitation becomes abandonment",
      "Use it before after-hours traffic disappears for good"
    ]),
    paragraph("For small teams, Chatting is a strong fit because it helps you stay close to buyer questions without turning chat into another system to babysit."),
    cta("Try Chatting free", "Use live chat for product advice, after-hours capture, and cleaner conversion conversations without dragging in enterprise support overhead.", "Try Chatting free", "/login")
  ]),
  section("faq", "FAQ", [
    faq([
      {
        question: "Is live chat mainly for support on Shopify stores?",
        answer:
          "No. Support is the obvious use, but live chat can also help with product recommendations, sizing questions, checkout hesitation, and after-hours lead capture."
      },
      {
        question: "What is the best growth use of live chat?",
        answer:
          "For many stores, it is a mix of product selection help, sizing reassurance, and catching buyers who are hesitating right before checkout."
      },
      {
        question: "Should every Shopify store use proactive chat prompts?",
        answer:
          "No. They work best on high-intent pages and with a light touch. If they are too aggressive, they become annoying instead of helpful."
      },
      {
        question: "Can live chat really improve conversions?",
        answer:
          "Yes, especially when buyers have simple pre-purchase questions that are currently going unanswered."
      },
      {
        question: "Where does Chatting fit?",
        answer:
          "Chatting fits best for small teams that want live chat to help with both support and conversion without buying a heavier support platform."
      }
    ])
  ])
];
