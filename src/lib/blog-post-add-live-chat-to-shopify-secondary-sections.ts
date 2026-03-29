import { cta, list, paragraph, quote, section } from "@/lib/blog-block-factories";
import type { BlogSection } from "@/lib/blog-types";

export const addLiveChatToShopifySecondarySections = [
  section("alternative-code-injection", "Alternative: Use Shopify's code injection (even easier)", [
    list(["Go to Online Store → Themes → Customize", "Click Theme Settings (gear icon)", "Scroll down to Custom code or Additional scripts", "Paste your Chatting code", "Save"], true),
    paragraph("Same result, no file editing.")
  ]),
  section("customizing-for-shopify", "Customizing for Shopify stores", [
    paragraph("Show on specific pages only: In Chatting, go to Settings → Widget → Display Rules. Set \"Show only on\" and enter your page paths, for example `/products/*`, `/cart`, `/collections/*`."),
    paragraph("Hide on checkout: Shopify's checkout is hosted separately, so your widget won't appear there by default — no action needed."),
    paragraph("Trigger proactive messages:"),
    list(["Cart page: \"Questions before you check out? I'm here!\"", "Pricing page: \"Need help choosing? Happy to compare options.\"", "Product page (30+ seconds): \"Want more info about this product?\""])
  ]),
  section("offline-behavior", "What happens when you're offline?", [
    paragraph("Set your business hours in Chatting settings."),
    list(["Online: Widget shows your welcome message, visitors can chat live", "Offline: Widget shows an offline message and email form"]),
    quote("\"We're away right now, but leave your email and we'll get back to you within a few hours!\""),
    paragraph("All offline messages go to your inbox for follow-up.")
  ]),
  section("tracking-performance", "Tracking performance", [
    list(["Conversations started: How many visitors are engaging", "Top pages: Where customers have the most questions", "Response time: How fast you're replying", "Resolution rate: How many questions you're answering"]),
    paragraph("Use this data to write better product descriptions, fix confusing UX, and identify common questions for your FAQ.")
  ]),
  section("faq", "FAQ", [
    {
      type: "faq",
      items: [
        { question: "Will this slow down my store?", answer: "No. The Chatting widget loads asynchronously (that `async` in the code) so it doesn't block your page. Impact on load time is <0.1 seconds." },
        { question: "Does it work on mobile?", answer: "Yes. The widget is fully responsive and works on all devices." },
        { question: "Can I customize the widget colors more?", answer: "Yes. Chatting lets you customize colors, welcome message, team name, avatar style, and position. Pro plan users can remove the Chatting branding entirely." },
        { question: "What if I use a page builder like PageFly?", answer: "Same process — add the code to theme.liquid. The widget will appear on all pages, including PageFly pages." },
        { question: "Can I have different messages on different pages?", answer: "Yes, with display rules and triggered messages. Set up page-specific welcome messages in Settings → Automation." }
      ]
    }
  ]),
  section("next-steps", "Next steps", [
    list(["Set up saved replies — Answer common questions instantly", "Enable notifications — Never miss a message", "Invite your team — Share the workload"], true),
    cta("Get started with Chatting", "Starter includes 50 conversations/month. No credit card required.", "Get started with Chatting", "/login")
  ])
];
