import { CHATLY_GROWTH_MONTHLY_PRICE, CHATLY_PRO_MONTHLY_PRICE, CHATLY_STARTER_PRICE_LABEL } from "@/lib/chatly-pricing-copy";
import type { BlogSection } from "@/lib/blog-types";

export const chatlyVsIntercomPrimarySections: BlogSection[] = [
  {
    id: "short-version",
    title: "The short version",
    blocks: [
      {
        type: "paragraph",
        text: "If you're a small team (under 20 people) looking for live chat, here's the truth:"
      },
      {
        type: "paragraph",
        text:
          "Intercom is a full customer platform — live chat, email marketing, help desk, product tours, bots, and more. It's incredibly powerful. It's also complex, expensive, and built for companies with dedicated support teams."
      },
      {
        type: "paragraph",
        text: "Chatting does one thing: live chat for small teams. Fast setup. Simple pricing. No enterprise bloat."
      },
      {
        type: "comparison",
        columns: ["Chatting", "Intercom"],
        highlightedColumn: 0,
        rows: [
          { label: "Starting price", values: [`${CHATLY_STARTER_PRICE_LABEL} (then ${CHATLY_GROWTH_MONTHLY_PRICE.replace("/month", "/mo")})`, "$74/mo (Essential)"] },
          { label: "Setup time", values: ["5 minutes", "30+ minutes"] },
          { label: "Unlimited chats", values: ["✓ (Growth plan)", "✓"] },
          { label: "Visitor tracking", values: ["✓", "✓"] },
          { label: "Team inbox", values: ["✓", "✓"] },
          { label: "Analytics", values: ["✓", "✓"] },
          { label: "Email marketing", values: ["✗", "✓"] },
          { label: "Product tours", values: ["✗", "✓"] },
          { label: "Help desk/ticketing", values: ["✗", "✓"] },
          { label: "AI chatbots", values: ["✗", "✓ (add-on)"] },
          { label: "Remove branding", values: ["Pro plan", "All plans"] }
        ]
      }
    ]
  },
  {
    id: "pricing-elephant-in-room",
    title: "Pricing: The elephant in the room",
    blocks: [
      { type: "paragraph", text: "Let's talk money." },
      {
        type: "paragraph",
        text:
          "Intercom's pricing is... complicated. Their Essential plan starts at $74/month, but that's per seat. Add a second team member? That's $148/month. Want AI features? That's extra. Resolution-based pricing? More math."
      },
      {
        type: "paragraph",
        text: "Most small teams we talk to end up quoted $300-500/month for Intercom."
      },
      { type: "paragraph", text: "Chatting's pricing is simple:" },
      {
        type: "list",
        items: [
          "Starter: 50 conversations/month",
          `Growth: ${CHATLY_GROWTH_MONTHLY_PRICE}`,
          `Pro: ${CHATLY_PRO_MONTHLY_PRICE}`
        ]
      },
      {
        type: "paragraph",
        text: "That's it. Clear per-seat pricing, no surprise usage fees, and no sales-call pricing games."
      },
      {
        type: "quote",
        text:
          "\"We were paying $420/month for Intercom. Switched to Chatting and kept the workflow our team actually used without the enterprise overhead.\" — Marcus R., Flowstate"
      }
    ]
  },
  {
    id: "features-what-you-actually-need",
    title: "Features: What you actually need",
    blocks: [
      {
        type: "paragraph",
        text: "Here's a secret: most small teams use about 20% of Intercom's features."
      },
      { type: "paragraph", text: "You need:" },
      {
        type: "list",
        items: [
          "✓ Live chat widget on your site",
          "✓ A shared inbox for your team",
          "✓ Know who's on your site",
          "✓ Basic analytics",
          "✓ Browser notifications"
        ]
      },
      { type: "paragraph", text: "You probably don't need:" },
      {
        type: "list",
        items: [
          "✗ AI chatbots (you want to talk to customers, not avoid them)",
          "✗ Email marketing (you have Mailchimp)",
          "✗ Product tours (you're not a SaaS enterprise)",
          "✗ Help desk ticketing (you get 20 questions a day, not 200)"
        ]
      },
      {
        type: "paragraph",
        text: "Chatting gives you everything in the first list. Intercom gives you everything in both lists — and charges accordingly."
      }
    ]
  },
  {
    id: "setup-5-minutes-vs-5-meetings",
    title: "Setup: 5 minutes vs 5 meetings",
    blocks: [
      { type: "paragraph", text: "We timed it." },
      { type: "paragraph", text: "Chatting setup:" },
      {
        type: "list",
        ordered: true,
        items: ["Sign up (1 minute)", "Name your team, pick colors (2 minutes)", "Copy one line of code to your site (2 minutes)", "Done. You're live."]
      },
      { type: "paragraph", text: "Intercom setup:" },
      {
        type: "list",
        ordered: true,
        items: [
          "Sign up and verify",
          "Schedule onboarding call",
          "Configure Messenger settings",
          "Set up Operator (their bot)",
          "Configure routing rules",
          "Integrate with your stack",
          "Train your team on the dashboard",
          "Actually go live"
        ]
      },
      {
        type: "paragraph",
        text: "Intercom is powerful because it does everything. But \"everything\" takes time to configure."
      }
    ]
  }
];
