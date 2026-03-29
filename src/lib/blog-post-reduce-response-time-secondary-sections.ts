import { CHATLY_GROWTH_MONTHLY_PRICE } from "@/lib/chatly-pricing-copy";
import { cta, list, paragraph, quote, section } from "@/lib/blog-block-factories";
import type { BlogSection } from "@/lib/blog-types";

export const reduceResponseTimeSecondarySections = [
  section("five-to-eight", "More ways to keep speed consistent", [
    paragraph("5. Use visitor context"), quote("\"I see you're on our pricing page — do you have questions about the Growth plan?\""), paragraph("Chatting shows you what page they're on, where they came from, and how long they've been browsing. Use it. Average time saved: 30-45 seconds per conversation."),
    paragraph("6. Set team coverage schedules"), list(["9-11am: Sarah", "11am-1pm: Marcus", "1-3pm: Sarah", "3-5pm: Marcus"]), paragraph("When it's your shift, chat is your priority. Not email. Not meetings. Chat."),
    paragraph("7. Create an escalation shortcut"), list(["@mention teammates in internal notes", "One-click handoff to specialists", "Clear escalation triggers"]),
    paragraph("8. Track and compete"), list(["Average first response time", "Response time by team member", "Response time by hour of day"]), quote("\"Sarah's averaging 47 seconds this week. Can you beat that?\"")
  ]),
  section("template-saved-replies", "Template: Your first 10 saved replies", [
    {
      type: "template",
      title: "Your first 10 saved replies",
      lines: [
        "1. Greeting",
        "\"Hey! 👋 Thanks for reaching out. How can I help?\"",
        "",
        "2. Pricing inquiry",
        "\"Great question! Our [Plan] is [$X]/month and includes [key features]. Would you like me to walk you through what's included?\"",
        "",
        "3. Feature question",
        "\"Yes, we do offer [feature]! Here's how it works: [brief explanation]. Want me to show you?\"",
        "",
        "4. Not sure / browsing",
        "\"No problem — take your time! I'm here if any questions come up while you're looking around.\"",
        "",
        "5. Technical question (needs research)",
        "\"Good question — let me check on that for you. Give me just a moment!\"",
        "",
        "6. Request demo",
        "\"Absolutely! You can [try it free / see it in action] at [link]. Or I can walk you through it right now if you have a few minutes?\"",
        "",
        "7. Comparing competitors",
        "\"We get that a lot! Here's the quick version: [key differentiator]. Happy to go deeper on any specific feature.\"",
        "",
        "8. Ready to buy",
        "\"Awesome! You can get started at [signup link]. Takes about 5 minutes. Want me to walk you through setup?\"",
        "",
        "9. Complaint / frustrated",
        "\"I'm really sorry to hear that. Let me fix this for you. Can you tell me [specific question]?\"",
        "",
        "10. Offline follow-up",
        "\"Thanks for waiting! I looked into [question] and here's what I found: [answer]. Does that help?\""
      ]
    }
  ]),
  section("what-fast-looks-like", "What \"fast\" looks like in practice", [
    paragraph("Scenario: Visitor on pricing page"),
    paragraph("Bad response (4 minutes later):"), quote("\"Hi there! Thank you for contacting us. How may I assist you today?\""),
    paragraph("Good response (45 seconds later):"), quote(`"Hey! I see you're checking out our pricing — any questions I can answer? Growth is ${CHATLY_GROWTH_MONTHLY_PRICE}."`),
    paragraph("Same outcome. Completely different experience.")
  ]),
  section("bottom-line", "The bottom line", [
    list(["Being notified instantly", "Having templates ready", "Knowing your visitor before they speak", "Making chat a priority, not an afterthought"]),
    paragraph("Get these right, and under 2 minutes becomes automatic."),
    cta("Try Chatting free", "See your response times improve in week one.", "Try Chatting free", "/login")
  ])
];
