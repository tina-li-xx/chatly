import { CHATTING_GROWTH_MONTHLY_PRICE, CHATTING_STARTER_PLAN_LINE } from "@/lib/pricing";
import { comparison, list, paragraph, section } from "@/lib/blog-block-factories";
import type { BlogSection } from "@/lib/blog-types";

export const bestLiveChatSoftwareCustomerSupportPrimarySections: BlogSection[] = [
  section("short-version", "The short version", [
    paragraph("Most small teams asking for the best live chat software for customer support are not really asking for chat alone. They want some mix of live chat, saved replies, AI help, reports, a shared inbox, and maybe ticketing."),
    paragraph("That matters because once you say clean ticket system and good reports, you are already drifting out of pure live chat and into broader support software. That is exactly where small teams start to overbuy."),
    list([
      "Choose Chatting if you want the best fit for website conversations, after-hours capture, and small-team support without helpdesk sprawl.",
      "Choose Help Scout if a calmer support desk plus help center matters more than pure live chat.",
      "Choose Crisp if you want a broader inbox-style support tool with flat workspace pricing.",
      "Choose Gorgias if you run ecommerce and support is becoming a real operation.",
      "Choose Tidio if AI-heavy support automation matters most."
    ])
  ]),
  section("what-small-teams-actually-need", "What small teams actually need", [
    paragraph("Small teams usually do not need a customer service platform with every workflow bolted on. They need the support basics to work well without creating a second job."),
    list([
      "A chat widget that is easy to install",
      "A shared inbox",
      "Saved replies",
      "Some AI help or FAQ assistance",
      "After-hours capture",
      "Enough reporting to see what is happening",
      "Pricing that does not get stupid as soon as the team grows"
    ]),
    paragraph("What they usually do not need is complicated ticket bureaucracy, deep support-ops workflows, or software that takes longer to configure than the support process itself.")
  ]),
  section("chatting-best-fit-for-most-small-teams", "1. Chatting", [
    paragraph(`Price: ${CHATTING_STARTER_PLAN_LINE}. Growth starts at ${CHATTING_GROWTH_MONTHLY_PRICE} for 1-3 members.`),
    paragraph("Best for: Small teams that want live chat and customer support without buying a full helpdesk too early."),
    paragraph("Chatting is the best fit for most small teams because it stays close to the real problem: talking to customers while they are still on your site, replying quickly, and keeping support manageable without adding a lot of operational drag."),
    paragraph("Why Chatting stands out:"),
    list([
      "Customizable widget, shared inbox, and visitor context in one small-team workflow",
      "Saved replies, FAQ suggestions, proactive prompts, and offline capture without helpdesk sprawl",
      "Analytics and reply-by-email continuation without dragging you into broader support software too early",
      "Stronger fit for after-hours support and pre-sales conversations than heavier support desks",
      "Simple pricing that is easier to justify for a lean team"
    ]),
    paragraph("The tradeoff is straightforward. If your definition of customer support absolutely requires a heavier ticket system and broader service workflows, Chatting is not trying to be that. For many small teams, that focus is the reason it wins.")
  ]),
  section("help-scout-calmer-support-desk", "2. Help Scout", [
    paragraph("Best for: Teams that want a calmer support desk with live chat, help center, and AI assistance."),
    paragraph("Help Scout is one of the better fits when your team wants support software that still feels relatively sane. Its product positioning centers on a shared inbox, help center, live chat via Beacon, AI Answers, and support insights."),
    paragraph("Why it stands out:"),
    list([
      "Broader support-desk fit than pure chat tools",
      "Includes live chat, help center, and AI support assistance",
      "Strong option for email-plus-chat support teams",
      "Feels calmer than heavier support software"
    ]),
    paragraph("Where it loses to Chatting: if your main job is still talking to website visitors before they bounce, Chatting is the cleaner fit. Help Scout makes more sense once support is broader than live chat itself.")
  ]),
  section("crisp-broader-inbox-support", "3. Crisp", [
    paragraph("Price: Free, then $45/month for Mini, $95/month for Essentials, and $295/month for Plus, billed per workspace."),
    paragraph("Best for: Small teams that want one broader inbox for support conversations."),
    paragraph("Crisp is one of the most credible all-in-one-enough options for small teams. Its pricing page highlights the shared inbox, mobile apps, contact form, ecommerce integrations, canned responses, chat triggers, analytics, routing rules, and on higher plans, omnichannel inbox and ticketing."),
    paragraph("Why it stands out:"),
    list([
      "Flat workspace pricing is easier to budget than strict per-seat pricing",
      "Good shared inbox and collaboration features",
      "Includes canned responses, analytics, routing, and broader support tooling",
      "More complete support surface than many lightweight chat tools"
    ]),
    paragraph("Where it loses to Chatting: Crisp is broader, but also busier. If your team mainly needs live chat, fast replies, and after-hours capture, Chatting stays more focused on that core job.")
  ])
];
