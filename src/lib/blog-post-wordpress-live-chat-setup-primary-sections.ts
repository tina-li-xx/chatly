import { code, list, paragraph, section } from "@/lib/blog-block-factories";
import type { BlogSection } from "@/lib/blog-types";

export const wordpressLiveChatSetupPrimarySections = [
  section("two-ways", "Two ways to add chat to WordPress", [
    paragraph("Option A: Code snippet (recommended)"),
    paragraph("Paste one line of code. Works with any theme. No plugin to update or maintain."),
    paragraph("Option B: Plugin (alternative)"),
    paragraph("Use a code-snippets plugin if you're not comfortable editing theme files. Both take about 5 minutes. Option A is cleaner.")
  ]),
  section("prerequisites", "Prerequisites", [
    list(["A WordPress site (self-hosted or WordPress.com Business plan)", "Admin access to your WordPress dashboard", "A Chatting account (free)"])
  ]),
  section("option-a-add-code-directly", "Option A: Add code directly (recommended)", [
    paragraph("Step 1: Create your Chatting account"),
    paragraph("Go to https://usechatting.com and sign up. Free plan works fine. Complete the quick setup with your team name, website URL, brand color, and welcome message."),
    paragraph("Step 2: Get your install code"),
    code('<script src="https://usechatting.com/widget.js" data-site-id="YOUR_SITE_ID"></script>', "html"),
    paragraph("Step 3: Add to WordPress"),
    paragraph("Method 1: Header/Footer plugin (easiest)"),
    list(["Install the free \"Insert Headers and Footers\" plugin by WPCode", "Go to Code Snippets → Header & Footer", "Paste your Chatting code in the \"Header\" box", "Save"], true),
    paragraph("Method 2: Theme file (no plugin)"),
    list(["Go to Appearance → Theme File Editor", "On the right, click header.php", "Find </head> near the top of the file", "Paste your Chatting code just before </head>", "Click Update File"], true),
    paragraph("Note: If you update your theme, you may need to re-add the code. Use a child theme to avoid this."),
    paragraph("Method 3: Customizer (some themes)"),
    list(["Go to Appearance → Customize", "Look for \"Additional CSS\" or \"Custom Code\" section", "Some themes have a \"Header Scripts\" option", "Paste your code and publish"], true)
  ]),
  section("test-it", "Step 4: Test it", [
    list(["Visit your site in an incognito window", "Look for the chat bubble (bottom right by default)", "Click and send a test message", "Check your Chatting inbox"], true),
    paragraph("Working? You're done!")
  ])
];
