import { list, paragraph, quote, section } from "@/lib/blog-block-factories";
import type { BlogSection } from "@/lib/blog-types";

export const liveChatWorthItSmallBusinessPrimarySections: BlogSection[] = [
  section("short-version", "The short version", [
    paragraph("Live chat is worth it for a small business when visitors have real questions that affect whether they buy, book, or reach out. It is usually not worth it if it becomes an ignored widget with no clear owner and no follow-up plan."),
    list([
      "Add live chat if response timing affects sales or support outcomes.",
      "Do not add it just because competitors have a widget.",
      "You do not need 24/7 coverage. You need a better handoff when nobody is online.",
      "Keep the setup light enough that your team can actually maintain it."
    ]),
    quote("Live chat should remove friction, not create a new kind of it.")
  ]),
  section("when-live-chat-is-worth-it", "When live chat is actually worth it", [
    paragraph("For small businesses, live chat usually pays off when the site already attracts people who are close to taking action but still have a few unanswered questions."),
    list([
      "Visitors ask the same pre-sales questions over and over.",
      "People hesitate around pricing, timing, fit, or next steps.",
      "A faster answer would likely save more leads or sales.",
      "Your team needs a simpler way to manage repetitive website conversations."
    ]),
    paragraph("If that sounds familiar, live chat is less of a nice extra and more of a practical conversion and support tool.")
  ]),
  section("when-it-is-not-worth-it-yet", "When it is probably not worth it yet", [
    paragraph("Live chat is not automatically the right next move for every business."),
    list([
      "Your site gets very little traffic and very few incoming questions.",
      "Nobody on the team can realistically own replies or follow-up.",
      "Your offer is simple enough that almost nobody needs clarification.",
      "You are adding chat only because competitors have it, not because it solves a real problem."
    ]),
    paragraph("In those cases, the issue may be traffic, positioning, or page clarity first. A widget will not fix that on its own.")
  ]),
  section("slow-replies-fear", "Is it worse to have chat if you cannot answer instantly?", [
    paragraph("Not necessarily. What frustrates people is not just delay. It is uncertainty. If the site clearly sets expectations, captures the question, and gives the visitor a real next step, that is still much better than silence."),
    paragraph("Small businesses talk themselves out of live chat by imagining a failed 24/7 support promise. That is the wrong standard. The right standard is whether chat helps the team answer faster, collect better questions, and stop losing visitors who would otherwise disappear."),
    paragraph("A slow reply can still work if the workflow is honest, organized, and useful.")
  ])
];
