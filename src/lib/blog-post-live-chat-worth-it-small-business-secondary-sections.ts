import { cta, faq, list, paragraph, section } from "@/lib/blog-block-factories";
import type { BlogSection } from "@/lib/blog-types";

export const liveChatWorthItSmallBusinessSecondarySections: BlogSection[] = [
  section("how-small-teams-make-it-manageable", "How small teams make live chat manageable", [
    paragraph("The best small-business live chat setup is usually simple."),
    list([
      "Set clear business hours instead of pretending someone is always available.",
      "Use saved replies for the repeat questions that eat up time.",
      "Capture after-hours messages so serious visitors do not disappear.",
      "Route or share ownership so one person does not carry the whole inbox.",
      "Use the conversations to improve product pages, FAQs, and offer clarity."
    ]),
    paragraph("That is the middle ground most small teams actually need: faster answers, better follow-up, and less guesswork.")
  ]),
  section("why-chatting-fits-this-decision", "Why Chatting fits this kind of decision", [
    paragraph("This is where Chatting makes sense. Small businesses usually do not need a giant support platform with enterprise overhead. They need a cleaner way to talk to visitors while the moment still matters."),
    list([
      "A customizable website widget that feels easy to deploy.",
      "A shared inbox so multiple people can stay aligned.",
      "Visitor context that makes replies faster and more relevant.",
      "Saved replies, FAQ suggestions, and offline capture without helpdesk sprawl."
    ]),
    paragraph("That makes Chatting a strong fit when the real question is not do we need a support department, but can we answer faster without adding another mess to manage.")
  ]),
  section("our-take", "Our take", [
    paragraph("If your small business is debating live chat, the decision should come down to one thing: does the site already create moments where a faster answer would save the conversation?"),
    paragraph("If yes, live chat is usually worth it. If no, do not install it just because it looks modern."),
    cta(
      "See if live chat is worth it before overbuilding support",
      "Use Chatting to answer real visitor questions, capture after-hours demand, and keep the workflow light enough for a small team.",
      "Start free with Chatting",
      "/login"
    )
  ]),
  section("faq", "FAQ", [
    faq([
      {
        question: "Is live chat worth it for a small business?",
        answer:
          "Usually yes when visitors have questions that affect whether they buy, book, or reach out. It is less useful when the site gets little traffic or almost no one needs clarification."
      },
      {
        question: "Do I need to respond instantly for live chat to work?",
        answer:
          "No. You need clear expectations, a reliable follow-up process, and a way to avoid leaving serious visitors at a dead end."
      },
      {
        question: "Is it worse to have chat than not have it at all?",
        answer:
          "Only if it is neglected and misleading. A lightweight setup with business hours, offline capture, and honest response expectations is usually better than silence."
      },
      {
        question: "How do small teams manage live chat without someone online all day?",
        answer:
          "They use saved replies, a shared inbox, clear availability, and after-hours capture. The goal is not 24/7 staffing. It is a better handoff."
      },
      {
        question: "Where does Chatting fit?",
        answer:
          "Chatting fits when you want the benefits of live chat without taking on enterprise-style support complexity. It gives small teams the core workflow they actually need."
      }
    ])
  ])
];
