import { getPublicAppUrl } from "@/lib/env";

export function codeSnippet() {
  const appUrl = getPublicAppUrl();

  return `<script
  src="${appUrl}/widget.js"
  data-site-id="your-site-id"
></script>`;
}

export const pillars = [
  {
    icon: "chat",
    title: "Real-time, really",
    body:
      "See who's typing. Know when messages are read. No refresh button in sight. When someone asks a question, you answer, and they see it appear in real-time.",
    stat: "",
    meta: ""
  },
  {
    icon: "eye",
    title: "Context at a glance",
    body:
      "See what page they're viewing, where they came from, and how long they've been browsing. Start every conversation with context, not \"How can I help you today?\"",
    stat: "",
    meta: ""
  },
  {
    icon: "users",
    title: "Small team, big presence",
    body:
      "Customizable branding, smart away messages, and email fallback mean you're always on, even when you're not. Your team of 3 can feel like a team of 30.",
    stat: "",
    meta: ""
  }
];

export const testimonials = [
  {
    initials: "M",
    name: "Marc",
    quote:
      "We used to lose 30% of our pricing page visitors. Now we catch them right when they're deciding. Chatting paid for itself in the first week."
  },
  {
    initials: "R",
    name: "Rupert",
    quote:
      "Finally, live chat that doesn't feel like enterprise software. My team was productive on day one."
  },
  {
    initials: "E",
    name: "Eliana",
    quote:
      "The visitor page is magic. Seeing someone read our docs for 10 minutes then land on pricing? That's when you reach out."
  }
];

export const setupSteps = [
  {
    number: "1",
    title: "Copy one line of code",
    body:
      "Add our tiny script to your site. That's it. Works with any website, WordPress, Webflow, Shopify, or custom code."
  },
  {
    number: "2",
    title: "Customize your widget",
    body:
      "Pick your colors. Write your welcome message. Position it where you want. See changes in real-time."
  },
  {
    number: "3",
    title: "Start chatting",
    body:
      "When a visitor says hello, you'll know. Desktop notifications and email alerts help your team stay on top of every conversation."
  }
];

export const stats = [
  { value: "1.2m", label: "Average response time" },
  { value: "94%", label: "Resolution rate" },
  { value: "4.8/5", label: "Satisfaction score" },
  { value: "2,400+", label: "Happy teams" }
];
