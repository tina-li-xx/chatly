import { CHATLY_GROWTH_MONTHLY_PRICE } from "@/lib/chatly-pricing-copy";
import type { BlogSection } from "@/lib/blog-types";

export const chatlyVsIntercomSecondarySections: BlogSection[] = [
  {
    id: "when-intercom-makes-sense",
    title: "When Intercom makes sense",
    blocks: [
      { type: "paragraph", text: "To be fair, Intercom is the right choice if:" },
      {
        type: "list",
        items: [
          "You have 50+ employees and a dedicated support team",
          "You need email marketing, help desk, and chat in one platform",
          "You want AI bots handling tier-1 questions",
          "You have budget for $500+/month tooling",
          "You need enterprise security and compliance features"
        ]
      },
      { type: "paragraph", text: "If that's you, Intercom is genuinely great. Go for it." }
    ]
  },
  {
    id: "when-chatting-makes-sense",
    title: "When Chatting makes sense",
    blocks: [
      {
        type: "list",
        items: [
          "You're a small team (2-20 people)",
          "You want to talk to customers, not automate them away",
          "You need live chat, not a \"customer platform\"",
          "You want to be live in 5 minutes, not 5 weeks",
          `You'd rather pay ${CHATLY_GROWTH_MONTHLY_PRICE} than $500/month for a platform you barely use`
        ]
      }
    ]
  },
  {
    id: "bottom-line",
    title: "The bottom line",
    blocks: [
      {
        type: "paragraph",
        text: "Intercom is a Swiss Army knife. Chatting is a really good pocketknife."
      },
      {
        type: "paragraph",
        text:
          "If you need the Swiss Army knife, get Intercom. But if you just need to cut things — and cut them well — the pocketknife is lighter, cheaper, and gets the job done."
      },
      {
        type: "cta",
        title: "Try Chatting free",
        text: "No credit card required. Setup takes 5 minutes.",
        buttonLabel: "Try Chatting free",
        href: "/login"
      }
    ]
  },
  {
    id: "faq-section",
    title: "FAQ Section",
    blocks: [
      {
        type: "faq",
        items: [
          {
            question: "Is Chatting really comparable to Intercom?",
            answer:
              "For live chat specifically? Yes. Both let you chat with visitors in real-time, see who's on your site, and manage conversations as a team. Intercom has more features beyond chat, but if chat is your main need, Chatting delivers."
          },
          {
            question: "Can I migrate from Intercom to Chatting?",
            answer:
              "Yes. Your conversation history stays in Intercom, but you can be live with Chatting in 5 minutes. Many teams run both in parallel during transition."
          },
          {
            question: "What features does Intercom have that Chatting doesn't?",
            answer:
              "If you need those, Intercom (or combining Chatting with other tools) might be better."
          },
          {
            question: "Is Chatting secure?",
            answer: "Yes."
          }
        ]
      }
    ]
  },
  {
    id: "ready-to-switch",
    title: "Ready to switch?",
    blocks: [
      { type: "paragraph", text: "Join 2,400+ small teams who chose simple over complicated." },
      {
        type: "cta",
        title: "Start your free trial",
        text: "",
        buttonLabel: "Start your free trial",
        href: "/login"
      }
    ]
  }
];
