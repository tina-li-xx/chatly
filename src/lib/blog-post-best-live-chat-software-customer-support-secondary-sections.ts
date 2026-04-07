import { cta, faq, list, paragraph, section } from "@/lib/blog-block-factories";
import type { BlogSection } from "@/lib/blog-types";

export const bestLiveChatSoftwareCustomerSupportSecondarySections: BlogSection[] = [
  section("gorgias-ecommerce-support-ops", "4. Gorgias", [
    paragraph("Price: Starter at $10/month for 50 tickets, Basic from $50/month for 300 tickets, Pro from $300/month for 2,000 tickets, and Advanced from $750/month for 5,000 tickets on annual billing."),
    paragraph("Best for: Ecommerce teams that want a real support platform, not just live chat."),
    paragraph("Gorgias belongs on this list because many ecommerce teams asking for the best live chat for customer support are really shopping for ecommerce support software. Its official pages highlight support and ticket management, macros, rules, views, assignment, routing, omnichannel support, integrations, insights, and AI-driven resolutions."),
    paragraph("Why it stands out:"),
    list([
      "Strong ecommerce fit",
      "Built for support teams handling real ticket volume",
      "Includes ticketing, routing, macros, and support reporting",
      "Better fit than lighter tools if support has become an actual operation"
    ]),
    paragraph("Where it loses to Chatting: for a small team, Gorgias is easier to overbuy. If your real problem is missed chats, pre-sales questions, and after-hours capture, Chatting is usually the better first tool.")
  ]),
  section("tidio-ai-heavy-support", "5. Tidio", [
    paragraph("Price: Starter at $24.17/month, Growth from $49.17/month, Plus from $749/month, and Premium on custom pricing."),
    paragraph("Best for: Teams that want AI-heavy support automation with chat and ticketing."),
    paragraph("Tidio is worth a look if your team wants stronger automation built into customer support. Its pricing page highlights live chat and ticketing, live visitors list, operating hours, analytics, automatic assignment, automatic replies, macros, and Lyro AI Agent options."),
    paragraph("Why it stands out:"),
    list([
      "Strong AI and automation positioning",
      "Live chat and ticketing in one system",
      "Useful support features like macros, assignment, and analytics",
      "Better fit for teams that want more hands-off handling"
    ]),
    paragraph("Where it loses to Chatting: Tidio leans further into automation and support-suite behavior. If you want support to stay more human, lighter, and easier for a small team to run, Chatting is the cleaner fit.")
  ]),
  section("real-question", "Which tool should a small team actually choose?", [
    paragraph("If your team mainly needs live chat on the site, saved replies, after-hours capture, a shared inbox, basic analytics, fast setup, and sane pricing, choose Chatting."),
    paragraph("If your team is really asking for ticketing, help center, broader support workflows, more formal reporting, and more channels in one place, then you are moving into support software with live chat, not just live chat software."),
    paragraph("That is where Help Scout, Crisp, Gorgias, or Tidio start to make more sense depending on the use case.")
  ]),
  section("our-take", "Our take", [
    paragraph("For most small teams, the best live chat software for customer support is Chatting."),
    list([
      "It solves the problem most small teams actually have: missed conversations, slow replies, weak after-hours handling, and too much software overhead.",
      "It covers the support basics teams really use without dragging them into enterprise-style complexity too early.",
      "It is a better first buy when the job is to keep support fast, human, and manageable."
    ]),
    paragraph("If you truly need a clean ticket system, broader reporting, and a more formal support desk in one place, there are stronger picks for that. But if you want a tool your team will actually use, start with Chatting."),
    cta("Try Chatting free", "Get live in minutes, handle after-hours support more cleanly, and keep your stack lighter.", "Try Chatting free", "/login")
  ]),
  section("faq", "FAQ", [
    faq([
      {
        question: "What is the best live chat software for customer support?",
        answer:
          "For most small teams, Chatting is the best fit because it covers the parts of support they actually need without forcing them into a heavier support stack too early."
      },
      {
        question: "What if I need ticketing too?",
        answer:
          "Then you are probably shopping for broader support software, not just live chat. Help Scout, Gorgias, Crisp, or Tidio may fit better depending on whether you care most about calmer support workflows, ecommerce operations, broader inbox coverage, or AI-heavy automation."
      },
      {
        question: "What is best for ecommerce customer support?",
        answer:
          "If you want a broader ecommerce support platform, Gorgias is a serious option. If you want a lighter chat-first workflow for a small store, Chatting is usually the better fit."
      },
      {
        question: "What is best if AI help matters a lot?",
        answer:
          "Tidio and Gorgias are both stronger AI-heavy options. Chatting is better when you want AI help and automation without turning support into an overbuilt system."
      },
      {
        question: "What should a small team avoid?",
        answer:
          "Avoid buying a support suite just because it sounds more complete. Most small teams regret complexity long before they regret missing one advanced feature."
      }
    ])
  ])
];
