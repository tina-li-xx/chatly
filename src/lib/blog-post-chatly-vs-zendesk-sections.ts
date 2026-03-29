import { CHATLY_GROWTH_MONTHLY_PRICE, getChatlyMonthlyDifferencePrice } from "@/lib/chatly-pricing-copy";
import { comparison, cta, list, paragraph, section } from "@/lib/blog-block-factories";
import type { BlogSection } from "@/lib/blog-types";

export const chatlyVsZendeskSections: BlogSection[] = [
  section("different-tools-different-philosophies", "Different tools, different philosophies", [
    paragraph("Zendesk is a help desk that added live chat. Everything becomes a ticket. Tickets get assigned, prioritized, escalated, and resolved. It's built for support teams processing hundreds of requests per day."),
    paragraph("Chatting is live chat, pure and simple. Conversations happen in real-time. No ticket numbers. No escalation workflows. Just humans talking to humans."),
    paragraph("Neither is \"better\" — they're built for different problems."),
    comparison(["Chatting", "Zendesk"], [
      { label: "Core product", values: ["Live chat", "Help desk + ticketing"] },
      { label: "Starting price", values: ["Free", "$19/agent/mo (limited)"] },
      { label: "Chat pricing", values: [CHATLY_GROWTH_MONTHLY_PRICE.replace("/month", "/mo"), "$55/agent/mo"] },
      { label: "Setup time", values: ["5 minutes", "Hours to days"] },
      { label: "Learning curve", values: ["Minimal", "Steep"] },
      { label: "Ticket system", values: ["✗", "✓"] },
      { label: "Live chat", values: ["✓", "✓"] },
      { label: "Real-time visitor tracking", values: ["✓", "Limited"] },
      { label: "Best for", values: ["Conversations", "Ticket management"] }
    ])
  ]),
  section("ticket-problem", "The ticket problem", [
    paragraph("When someone chats with you on Zendesk, here's what happens:"),
    list(["Chat becomes a ticket", "Ticket gets a number (#48291)", "Ticket enters a queue", "Agent gets assigned", "Status changes: Open → Pending → Solved", "Customer gets a survey"], true),
    paragraph("That's great if you're managing 500 support requests a day. It's overkill if you're a 5-person team getting 20 questions a week."),
    paragraph("With Chatting:"),
    list(["Someone says hi", "You say hi back", "You help them", "Done"], true),
    paragraph("No tickets. No queues. No \"Your request #48291 has been updated.\"")
  ]),
  section("pricing-comparison", "Pricing comparison", [
    paragraph("Zendesk's pricing requires a spreadsheet to understand:"),
    list(["Support Team: $19/agent/month (no live chat)", "Suite Team: $55/agent/month (includes chat)", "Suite Growth: $89/agent/month", "Suite Professional: $115/agent/month"]),
    paragraph("For a 5-person team wanting live chat: $275/month minimum."),
    paragraph("Chatting:"),
    list([`Growth: ${CHATLY_GROWTH_MONTHLY_PRICE}`]),
    paragraph(`Same 5-person team. ${getChatlyMonthlyDifferencePrice("growth", 5, 27_500)} difference.`)
  ]),
  section("when-zendesk-wins", "When Zendesk wins", [
    list(["You process 100+ support tickets daily", "You need SLAs, escalations, and complex routing", "Multiple teams handle different request types", "You need help desk + chat + phone in one system", "You have a dedicated support ops person to configure it"]),
  ]),
  section("when-chatting-wins", "When Chatting wins", [
    list(["You want to chat with visitors, not manage tickets", "Your \"support team\" is also your sales team, marketing team, and founding team", "You get 10-50 conversations a week, not 500", "You want to be live today, not next quarter", "You value simplicity over configurability"]),
  ]),
  section("real-talk", "Real talk", [
    paragraph("We're not trying to replace Zendesk for enterprise support teams. If you're processing thousands of tickets with complex routing rules, Zendesk (or Freshdesk, or Help Scout) is probably right."),
    paragraph("But if you're a small team who just wants to talk to your website visitors without turning every conversation into a bureaucratic process — that's what Chatting is for."),
    cta("Try Chatting free", "", "Try Chatting free", "/login")
  ])
];
