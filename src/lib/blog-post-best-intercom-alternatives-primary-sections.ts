import {
  CHATLY_GROWTH_PLAN_LINE,
  CHATLY_PRO_PLAN_LINE,
  CHATLY_STARTER_PLAN_LINE,
  getChatlyPaidStartingPriceCopy
} from "@/lib/chatly-pricing-copy";
import { comparison, cta, list, paragraph, section } from "@/lib/blog-block-factories";
import type { BlogSection } from "@/lib/blog-types";

export const bestIntercomAlternativesPrimarySections: BlogSection[] = [
  section("why-teams-leave-intercom", "Why teams leave Intercom", [
    paragraph("We surveyed 200 small teams who switched away from Intercom. The top reasons:"),
    list(["Price (68%) — \"Started at $74, ended up at $400+\"", "Complexity (24%) — \"We used 10% of the features\"", "Overkill (8%) — \"We just needed chat, not a platform\""], true),
    paragraph("If that sounds familiar, here are your options.")
  ]),
  section("chatting-best-for-simplicity", "1. Chatting — Best for simplicity", [
    paragraph(`Price: ${getChatlyPaidStartingPriceCopy()}`),
    paragraph("Best for: Small teams who want live chat without the bloat"),
    paragraph("Chatting does one thing well: live chat for small teams. No email marketing. No product tours. No AI bots. Just real-time conversations with your website visitors."),
    paragraph("Pros:"),
    list(["5-minute setup", "Simple, predictable pricing", "Clean, fast interface", "Built specifically for small teams"]),
    paragraph("Cons:"),
    list(["No email marketing features", "No chatbot automation", "Limited integrations (compared to Intercom)"]),
    paragraph("Pricing:"),
    list([CHATLY_STARTER_PLAN_LINE, CHATLY_GROWTH_PLAN_LINE, CHATLY_PRO_PLAN_LINE]),
    cta("Try Chatting free", "", "Try Chatting free", "/login")
  ]),
  section("crisp-best-free-option", "2. Crisp — Best free option", [
    paragraph("Price: Free – $95/month"),
    paragraph("Best for: Teams wanting a generous free plan"),
    paragraph("Crisp offers a solid free tier with unlimited chats (2 seats). Their paid plans add features like chatbots, campaigns, and a help desk."),
    paragraph("Pros:"), list(["Generous free plan", "Good feature set for the price", "Includes chatbots on paid plans"]),
    paragraph("Cons:"), list(["Interface can feel cluttered", "Customer support is inconsistent", "Free plan has Crisp branding"]),
    paragraph("Pricing:"), list(["Free: Unlimited chats, 2 users", "Pro: $25/month (4 users)", "Unlimited: $95/month (unlimited)"])
  ]),
  section("tidio-best-for-ecommerce", "3. Tidio — Best for e-commerce", [
    paragraph("Price: Free – $240+/month"),
    paragraph("Best for: Shopify and e-commerce stores"),
    paragraph("Tidio specializes in e-commerce chat with Shopify integration, cart recovery features, and sales-focused chatbots."),
    paragraph("Pros:"), list(["Excellent Shopify integration", "E-commerce-specific features", "AI chatbots included"]),
    paragraph("Cons:"), list(["Pricing gets expensive fast", "Per-operator pricing", "Can feel sales-pushy"]),
    paragraph("Pricing:"), list(["Free: 50 conversations/month", "Communicator: $19/operator/month", "Chatbots+: Additional cost"])
  ]),
  section("livechat-best-for-established-teams", "4. LiveChat — Best for established teams", [
    paragraph("Price: $20 – $59/agent/month"),
    paragraph("Best for: Growing teams who want proven reliability"),
    paragraph("LiveChat is a mature product with a solid feature set. It's more expensive than Chatting but less than Intercom."),
    paragraph("Pros:"), list(["Very reliable and polished", "Good reporting", "200+ integrations"]),
    paragraph("Cons:"), list(["Per-agent pricing adds up", "No free plan", "Basic plan is limited"]),
    paragraph("Pricing:"), list(["Starter: $20/agent/month", "Team: $41/agent/month", "Business: $59/agent/month"])
  ])
];
