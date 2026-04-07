import {
  CHATTING_GROWTH_MONTHLY_PRICE,
  CHATTING_STARTER_PLAN_LINE,
  CHATTING_STARTER_PRICE_LABEL
} from "@/lib/pricing";
import { comparison, cta, list, paragraph, section } from "@/lib/blog-block-factories";
import type { BlogSection } from "@/lib/blog-types";

export const chattingVsGorgiasPrimarySections: BlogSection[] = [
  section("short-version", "The short version", [
    paragraph("If you run an ecommerce store, Gorgias is a legitimate product to compare against Chatting. It is not just a widget. It is a full ecommerce helpdesk with live chat attached."),
    paragraph("That is also why most small stores should not default to it. Gorgias is built for broader support operations. Chatting is built for small teams who mainly need live chat, after-hours capture, visitor context, and a shared inbox that does not turn into helpdesk sprawl."),
    paragraph("So the real question is not which tool has more features. It is whether you need a better website conversation flow or a bigger ecommerce support system."),
    comparison(["Chatting", "Gorgias"], [
      { label: "Core product", values: ["Live chat for small teams", "Ecommerce helpdesk with live chat"] },
      { label: "Starting price", values: [`${CHATTING_STARTER_PRICE_LABEL} (${CHATTING_STARTER_PLAN_LINE})`, "$10/mo for 50 tickets"] },
      { label: "Pricing model", values: ["Team pricing", "Ticket-based pricing"] },
      { label: "Best for", values: ["Small stores that want simple live chat", "Support-heavy ecommerce teams"] },
      { label: "Omnichannel support", values: ["No", "Yes"] },
      { label: "Shopify order actions", values: ["No", "Yes"] },
      { label: "After-hours lead capture", values: ["Yes", "Yes"] }
    ], 0)
  ]),
  section("what-gorgias-actually-is", "What Gorgias actually is", [
    paragraph("Gorgias is not just a live chat tool. It positions itself as an AI-powered ecommerce helpdesk."),
    paragraph("Its official product pages highlight a centralized support inbox, Shopify context, order actions, omnichannel support, chat campaigns, rules, self-service flows, and AI-heavy automation."),
    paragraph("That makes it closer to a support-ops product than a simple storefront chat tool. If your team already thinks in terms of ticket volume, support channels, queue management, and support efficiency, that can be a real strength."),
    list([
      "Live chat on the storefront",
      "Shopify product and order context inside support",
      "Rules, routing, and proactive chat campaigns",
      "Auto-replies outside business hours",
      "Self-service flows for things like order status and common support requests"
    ]),
    paragraph("That is useful if your support operation is already bigger than: we need to answer buying questions on the site before the visitor leaves. It is less useful if that broader system becomes the thing your small team has to maintain.")
  ]),
  section("where-chatting-wins", "Where Chatting wins", [
    paragraph("Chatting wins when the actual job is talking to shoppers before they leave, not building a full support department."),
    paragraph("A lot of small ecommerce teams do not need deeper support operations yet. They need to answer the handful of questions that keep showing up on product pages, cart pages, and after-hours visits: shipping, timing, customization, stock, simple objections before checkout."),
    paragraph("That is where Chatting is the cleaner fit."),
    list([
      "Website conversations, not support bureaucracy: Chatting starts with the widget, the visitor, and the reply, not with tickets, queue logic, and support process overhead.",
      "Stronger fit for pre-sales hesitation: when the real job is answering buying questions before someone bounces, a chat-first workflow is usually better than a helpdesk-first one.",
      "After-hours capture built into the normal flow: offline capture, reply-by-email continuation, FAQ suggestions, and saved replies help small teams keep the conversation alive without pretending they are online 24/7.",
      "Easier for a small team to keep running: a customizable widget, shared inbox, visitor context, routing, saved replies, and lightweight automation are enough to be useful without turning chat into another operations project.",
      `Pricing fits the stage most small stores are actually at: free to start, then ${CHATTING_GROWTH_MONTHLY_PRICE} for 1-3 members instead of stepping straight into a bigger support system.`
    ]),
    paragraph("The biggest advantage is not one isolated feature. It is fit. Chatting stays much closer to the actual problem most small stores have: better conversations, fewer missed buying moments, and less software drag.")
  ]),
  section("where-gorgias-wins", "Where Gorgias wins", [
    paragraph("Gorgias wins when your team really does need a support platform, not just live chat."),
    paragraph("If support volume is already meaningful and the job has moved beyond storefront questions into broader CX operations, Gorgias starts to make more sense."),
    list([
      "Support volume is already high",
      "You need support across chat, email, social, and other channels in one system",
      "Shopify order actions inside support matter a lot",
      "Your team already works more like a CX function than a small shared inbox",
      "You want heavier automation and self-service on top of live chat"
    ]),
    paragraph("If that is your world, Gorgias is a serious option. It is more natural for that job than trying to stretch a lean chat-first tool into a full ecommerce helpdesk. It is just not the right default recommendation for every smaller store.")
  ])
];
