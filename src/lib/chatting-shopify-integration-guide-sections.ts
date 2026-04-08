import { cta, faq, list, paragraph, section } from "@/lib/blog-block-factories";

export const chattingShopifyIntegrationGuideSections = [
  section("why", "Why connect Shopify", [
    paragraph("Shopify is valuable in Chatting because it brings order and customer context into the inbox instead of forcing teammates to jump between tabs while they are trying to answer a visitor."),
    paragraph("When it is connected, the inbox can show the customer's profile, recent orders, total spend, and a direct link back to Shopify.")
  ]),
  section("before-you-start", "What you need first", [
    list([
      "Your Shopify store domain in the form your-store.myshopify.com",
      "Permission to approve the app inside Shopify",
      "A use case for seeing customer and order context inside the inbox"
    ]),
    paragraph("Chatting requests read access for customers and orders so the team can see the context that matters during a live conversation.")
  ]),
  section("setup", "How to connect Shopify", [
    list([
      "Open Settings → Integrations → Shopify in Chatting",
      "Enter the store slug or full myshopify domain",
      "Start the Shopify authorization flow",
      "Approve access in Shopify and return to Chatting"
    ], true),
    paragraph("Once the store is connected, Chatting can look up Shopify customer context for inbox conversations with a matching email address.")
  ]),
  section("inbox", "How the team uses it in the inbox", [
    list([
      "Check whether the visitor is a repeat buyer before replying",
      "See recent order totals and statuses without leaving the thread",
      "Open the Shopify customer record when a deeper account issue needs a second look"
    ]),
    paragraph("This matters most for support, returns, shipping questions, and high-value conversations where context changes the right reply.")
  ]),
  section("faq", "FAQ", [
    faq([
      {
        question: "Do we need to enter the full Shopify URL?",
        answer: "You can enter the slug only. Chatting will normalize it into the full your-store.myshopify.com format before starting the connection."
      },
      {
        question: "Will every conversation show Shopify data?",
        answer: "No. Chatting needs a matching email address before it can pull Shopify customer context into the inbox."
      },
      {
        question: "What if the store connection fails?",
        answer: "Reconnect Shopify from Chatting and confirm the store domain is correct before retrying the authorization flow."
      }
    ]),
    cta(
      "Want Shopify context in the inbox?",
      "Connect your store from Chatting and make sure your team collects visitor email addresses when a conversation starts.",
      "Open Chatting",
      "/login"
    )
  ])
];
