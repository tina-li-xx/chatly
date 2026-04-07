import { CHATTING_GROWTH_MONTHLY_PRICE } from "@/lib/pricing";
import { comparison, list, paragraph, section } from "@/lib/blog-block-factories";
import type { BlogSection } from "@/lib/blog-types";

export const zendeskAlternativesSmallTeamsPrimarySections: BlogSection[] = [
  section("short-version", "The short version", [
    paragraph("Zendesk is not bad software. It is just very easy for a small team to overbuy."),
    paragraph("If you actually need a larger-ticket help desk with routing, queues, and broader service operations, Zendesk is a real option. But if you mostly need a shared inbox, live chat on your site, faster replies, and less operational drag, it can feel like too much system for the problem you have."),
    list([
      "Choose Chatting if you want live chat and a shared inbox without full helpdesk overhead.",
      "Choose Help Scout if you still want a support desk, but one that feels calmer than Zendesk.",
      "Choose Crisp if you want a broader inbox-style tool with flat workspace pricing.",
      "Choose Freshdesk if you still want a classic help desk at a lower entry point.",
      "Choose Gorgias if you run ecommerce and support is becoming a real operation."
    ])
  ]),
  section("why-teams-start-looking", "Why teams start looking for a Zendesk alternative", [
    paragraph("Small teams do not usually leave Zendesk because it is broken. They leave because the category fit starts to feel wrong."),
    list([
      "Too much ticket overhead for a lean team",
      "Per-agent pricing adds up quickly",
      "The workflow feels heavier than the actual support volume",
      "The team needs faster conversations, not deeper support bureaucracy"
    ]),
    paragraph("That is the real Zendesk-alternatives question: are you replacing Zendesk the help desk, or Zendesk the layer of complexity?")
  ]),
  section("chatting-best-for-lean-teams", "1. Chatting — Best for lean teams that want live chat, not helpdesk sprawl", [
    paragraph(`Price: free starter, then ${CHATTING_GROWTH_MONTHLY_PRICE} for 1-3 members.`),
    paragraph("Best for: Small teams that want to talk to website visitors, answer quickly, and keep one clean inbox without buying a bigger support stack."),
    paragraph("Chatting is the strongest Zendesk alternative when the real job is live conversations. You get the widget, shared inbox, visitor context, saved replies, after-hours capture, and lightweight automation without turning the whole thing into ticket management."),
    paragraph("Where Chatting wins:"),
    list([
      "Live chat is the center of the product, not just one feature inside a bigger support suite",
      "Small teams can keep it running without a support-ops person",
      "Visitor context, saved replies, routing, and offline follow-up are all there without heavy setup",
      "It is easier to justify financially when the team is still lean"
    ])
  ]),
  section("helpscout-calmer-helpdesk", "2. Help Scout — Best if you still want a support desk", [
    paragraph("Best for: Teams that want a help center, shared inbox, and Beacon live chat without as much enterprise feel."),
    paragraph("Help Scout is one of the cleaner Zendesk alternatives when your workflow is broader than live chat, but you still want the product to feel sane. It is more support-desk-first than Chatting, and that can be a good thing if your team is already handling more than simple website conversations."),
    paragraph("Pros:"),
    list([
      "Calmer support-desk feel than Zendesk",
      "Strong fit for email-plus-help-center workflows",
      "Beacon gives you live chat without making chat the entire product"
    ]),
    paragraph("Cons:"),
    list([
      "Still broader than necessary if your main job is website chat",
      "Not as tightly focused on storefront or pre-sales conversations as Chatting"
    ])
  ]),
  section("crisp-broader-inbox", "3. Crisp — Best if you want a broader inbox with predictable pricing", [
    paragraph("Price: Free, then $45/month for Mini, $95/month for Essentials, or $295/month for Plus, billed per workspace."),
    paragraph("Best for: Teams that want chat, inbox collaboration, and broader channel coverage without per-agent pricing stress."),
    paragraph("Crisp is a credible Zendesk alternative if you like the idea of a broader inbox product, but do not want the feeling that every extra seat turns into a pricing headache."),
    paragraph("Pros:"),
    list([
      "Flat workspace pricing is easier to budget around",
      "Good shared inbox and team-collaboration basics",
      "Broader than a pure live-chat tool without feeling as heavy as Zendesk"
    ]),
    paragraph("Cons:"),
    list([
      "Busier interface than a tighter chat-first workflow",
      "Wider surface area than many small teams actually need"
    ])
  ])
];
