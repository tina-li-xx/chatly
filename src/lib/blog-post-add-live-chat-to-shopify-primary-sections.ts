import { code, list, paragraph, quote, section } from "@/lib/blog-block-factories";
import type { BlogSection } from "@/lib/blog-types";

export const addLiveChatToShopifyPrimarySections = [
  section("why-add-live-chat", "Why add live chat to Shopify?", [
    paragraph("68% of online shoppers abandon their cart because they have an unanswered question."),
    list(["Answer product questions in real-time", "Help with sizing, shipping, and returns", "Recover abandoned carts with proactive messages", "Build trust that converts browsers to buyers"]),
    paragraph("The average Shopify store with live chat sees a 10-15% increase in conversion rate.")
  ]),
  section("what-youll-need", "What you'll need", [
    list(["A Shopify store (any plan)", "A Chatting account (free to start)", "5 minutes"])
  ]),
  section("step-by-step-installation", "Step-by-step installation", [
    paragraph("Step 1: Create your Chatting account (1 minute)"),
    paragraph("Go to https://usechatting.com and click \"Start free trial.\" Enter your email, create a password, and you're in."),
    paragraph("Step 2: Set up your team (1 minute)"),
    list(["\"Acme Support\"", "\"The Cozy Blanket Co.\"", "Your store name"]),
    paragraph("Enter your website URL (your Shopify domain)."),
    paragraph("Step 3: Customize your widget (1 minute)"),
    paragraph("Choose your brand color. Click the color picker and match your store's primary color. Or enter your exact hex code."),
    paragraph("Write your welcome message."),
    quote("\"Hey! 👋 Questions about our products? I'm here to help.\"\n\"Welcome! Need help finding the right size?\"\n\"Hi there! Let me know if you have any questions.\""),
    paragraph("Set your position. Bottom-right works for most stores. Bottom-left if your cart icon is on the right."),
    paragraph("Step 4: Copy your install code (30 seconds)"),
    code('<script src="https://usechatting.com/widget.js" data-site-id="YOUR_SITE_ID"></script>', "html")
  ]),
  section("add-code-to-shopify", "Step 5: Add the code to Shopify (1.5 minutes)", [
    list(["Log in to your Shopify admin", "Go to Online Store → Themes", "Click Actions → Edit code on your current theme", "In the left sidebar, find Layout → theme.liquid", "Find the </head> tag (use Ctrl+F or Cmd+F)", "Paste your Chatting code right before </head>", "Click Save"], true),
    paragraph("That's it. Your widget is live.")
  ]),
  section("test-it", "Step 6: Test it", [
    list(["Open your store in a new incognito window", "Look for the chat bubble in the bottom corner", "Click it and send a test message", "Check your Chatting inbox — you should see the message"], true),
    paragraph("You're live!")
  ])
];
