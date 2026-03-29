import { cta, list, paragraph, section } from "@/lib/blog-block-factories";
import type { BlogSection } from "@/lib/blog-types";

export const wordpressLiveChatSetupSecondarySections = [
  section("option-b-plugin", "Option B: Using a plugin", [
    paragraph("Step 1: Install WPCode"),
    list(["Go to Plugins → Add New", "Search for \"WPCode\"", "Install and activate"], true),
    paragraph("Step 2: Add your snippet"),
    list(["Go to Code Snippets → Add Snippet", "Choose \"Add Your Custom Code\"", "Give it a name: \"Chatting Live Chat\"", "Set code type to \"HTML Snippet\"", "Paste your Chatting code", "Set location to \"Site Wide Header\"", "Toggle to \"Active\"", "Save"], true),
    paragraph("Same result, slightly more steps.")
  ]),
  section("customizing-for-wordpress", "Customizing for WordPress", [
    paragraph("Show on specific pages only: In Chatting settings, go to Widget → Display Rules and set URL patterns like `/contact/*`, `/pricing`, `/shop/*`."),
    paragraph("Different messages for different pages:"),
    list(["Blog posts: \"Enjoying the article? Let me know if you have questions!\"", "Pricing page: \"Need help choosing a plan? I'm happy to compare.\"", "Contact page: \"Rather chat than fill out a form? Go ahead!\""]),
    paragraph("Working with page builders: Chatting works with Elementor, Divi, Beaver Builder, Gutenberg, and WPBakery. The widget loads site-wide regardless of which builder you use for individual pages.")
  ]),
  section("wordpress-com-users", "WordPress.com users", [
    list(["Free/Personal/Premium plans: Cannot add custom code", "Business plan+: Can add custom code via plugins or Customizer"]),
    paragraph("You need at least the Business plan to add Chatting.")
  ]),
  section("common-questions", "Common questions", [
    {
      type: "faq",
      items: [
        { question: "Will this conflict with other plugins?", answer: "Very unlikely. Chatting loads independently and doesn't interact with WordPress plugins." },
        { question: "Does it work with caching plugins?", answer: "Yes. WP Rocket, W3 Total Cache, LiteSpeed Cache — all fine. The widget loads separately from your cached pages." },
        { question: "What about WooCommerce?", answer: "Works perfectly. Add chat to your store pages and help customers buy with confidence." },
        { question: "Can I show different agents for different pages?", answer: "Not different agents, but you can route conversations. In Chatting, set up rules to tag conversations from specific pages, then filter your inbox." },
        { question: "What if my theme doesn't have header.php?", answer: "Modern block themes might use different structures. Use the WPCode plugin method instead — it works universally." }
      ]
    }
  ]),
  section("after-installation", "After installation", [
    list(["Enable browser notifications — Settings → Notifications", "Set up offline hours — Settings → Availability", "Create saved replies — Settings → Saved Replies", "Turn on email alerts — Settings → Notifications", "Invite team members — Settings → Team"], true),
    paragraph("Your widget is live. Your visitors are waiting."),
    cta("Open your Chatting inbox", "", "Open your Chatting inbox", "/login")
  ])
];
