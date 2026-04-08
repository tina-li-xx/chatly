import { list, paragraph, quote, section } from "@/lib/blog-block-factories";
import type { BlogSection } from "@/lib/blog-types";

export const whatIsLiveChatBenefitsPrimarySections: BlogSection[] = [
  section("what-live-chat-is", "What live chat is", [
    paragraph("Live chat is real-time messaging between a business and the people visiting its website. Instead of forcing someone into a phone call or a slow email thread, live chat gives them a faster, lower-friction way to ask while they are already on the site."),
    paragraph("Modern live chat often includes a website widget, a shared inbox, visitor context, saved replies, offline capture, and light automation or AI help for the repeat questions."),
    paragraph("For a small business, that matters because the job is usually not building a support department. It is answering the question that is blocking the next sale, booking, or conversation."),
    quote("The real value of live chat is not the widget itself. It is shortening the gap between customer intent and a useful answer.")
  ]),
  section("why-it-matters-now", "Why it matters more now", [
    paragraph("Customers have less patience than they used to. If they cannot get clarity quickly, they often leave. That is true for ecommerce stores, SaaS companies, local services, and any site where a visitor is deciding whether to take the next step."),
    paragraph("That is why live chat keeps moving from optional to expected. It helps businesses respond faster without turning every question into a phone call or a multi-message email thread."),
    paragraph("The real small-business decision is not whether live chat works. It is whether you choose a lightweight chat-first tool that fits the team you have, or overbuy a bigger platform meant for support ops you do not actually run.")
  ]),
  section("customer-and-team-benefits", "Benefits 1-6: customer experience and team efficiency", [
    list([
      "1. Faster support: visitors get answers sooner than they would through email, and the team can resolve simple questions while the moment still matters.",
      "2. Better scalability for small teams: one shared inbox, saved replies, and clearer routing help a lean team handle more conversations without chaos.",
      "3. Proactive engagement: chat can appear when someone is hesitating on pricing, product, or checkout pages instead of waiting for the visitor to leave.",
      "4. Better customer context: page URL, referrer, prior messages, and session detail make replies more relevant and faster to write.",
      "5. Higher customer satisfaction: live chat feels easier because it is convenient, fast, and leaves a written record people can refer back to.",
      "6. Better agent productivity and morale: a cleaner workflow with less context switching usually feels lighter than juggling calls, inboxes, and scattered messages."
    ]),
    paragraph("For a small business, these benefits compound. Faster answers usually mean less frustration, fewer lost conversations, and less stress on the team.")
  ])
];
