import { cta, faq, list, paragraph, section } from "@/lib/blog-block-factories";
import type { BlogSection } from "@/lib/blog-types";

export const smallEcommerceCustomerSupportWorkflowSecondarySections: BlogSection[] = [
  section("the-biggest-misunderstanding", "The biggest misunderstanding about support automation", [
    paragraph("A lot of store owners think support automation means they never touch this again. Usually it means fewer repetitive replies, cleaner routing, faster first responses, less after-hours leakage, and better organization around what still needs a human."),
    paragraph("That is still valuable. In fact, that is usually the right goal. Small stores do not need fake autonomy. They need less operational drag.")
  ]),
  section("the-most-annoying-part", "The most annoying part of most setups", [
    paragraph("For small stores, the worst part is usually not the message volume itself. It is the fragmentation."),
    list([
      "One tool for chat",
      "The ecommerce admin for something else",
      "Email inboxes for another slice of support",
      "Manual policy decisions living in someone's head",
      "No clean way to tell what should be automated and what should be escalated"
    ]),
    paragraph("That is how simple questions start eating hours. The problem is not just volume. It is context switching and inconsistency.")
  ]),
  section("why-chatting-fits-small-store-support", "Why Chatting makes sense for small-store support", [
    paragraph("This is the kind of support problem Chatting is built for. Small stores usually do not need a giant enterprise helpdesk. They need a faster, cleaner front layer for customer questions so the team can spend time on the requests that actually need judgment."),
    list([
      "A live chat widget for pre-sales and support questions",
      "FAQ suggestions for repetitive requests",
      "A shared inbox so nothing gets lost",
      "After-hours capture when nobody is online",
      "Visitor context so replies start with actual information"
    ]),
    paragraph("That is a better fit for stores trying to reduce support overhead without turning support into its own department.")
  ]),
  section("our-take", "Our take", [
    paragraph("If you run a small ecommerce store, the best support workflow is usually part automation and part human review."),
    list([
      "Automate repetitive questions, first responses, routing, and after-hours capture.",
      "Keep human review for refunds, cancellations, exceptions, and anything with financial or policy risk."
    ], true),
    paragraph("That is the sane middle ground. And for most small teams, Chatting is strongest in that front layer: catching questions early, reducing repetitive work, and keeping the inbox manageable before support turns into a daily bottleneck."),
    cta(
      "Keep ecommerce support lighter without losing control",
      "Use Chatting to handle repetitive questions, capture after-hours requests, and give your team one cleaner support front layer before every issue turns into manual work.",
      "Start free with Chatting",
      "/login"
    )
  ]),
  section("faq", "FAQ", [
    faq([
      {
        question: "Do small stores usually automate refunds and cancellations completely?",
        answer:
          "Usually not. Some stores automate narrow cases, but many still review those actions manually because they affect money, inventory, and fraud risk."
      },
      {
        question: "What should a small store automate first?",
        answer:
          "Start with order-status questions, shipping basics, policy explanations, FAQ replies, and after-hours capture. Those usually remove the most repetitive work with the least risk."
      },
      {
        question: "Do support tools really run on their own?",
        answer:
          "Not completely for most small stores. They usually automate triage and repetitive replies, but humans still step in for higher-risk decisions and edge cases."
      },
      {
        question: "What is the most frustrating part of small-store support?",
        answer:
          "Usually the fragmentation. Messages come in across too many places, and the team still has to manually sort what is simple versus what needs judgment."
      },
      {
        question: "Where does Chatting fit?",
        answer:
          "Chatting fits best as the fast front layer: live chat, FAQ help, inbox organization, and after-hours capture so the team can focus on the cases that actually need a person."
      }
    ])
  ])
];
