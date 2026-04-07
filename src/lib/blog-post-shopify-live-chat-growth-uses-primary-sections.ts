import { list, paragraph, section } from "@/lib/blog-block-factories";
import type { BlogSection } from "@/lib/blog-types";

export const shopifyLiveChatGrowthUsesPrimarySections: BlogSection[] = [
  section("short-version", "The short version", [
    paragraph("A lot of Shopify stores install live chat and immediately trap it in the support bucket. It becomes the place for where is my order, how do returns work, and can I change my address."),
    paragraph("That is fine, but it is also a waste. Live chat can help stores convert better, recover more buying intent, and learn what is blocking revenue in the first place."),
    list([
      "Use live chat to help shoppers choose the right product",
      "Answer sizing, fit, and compatibility questions before they turn into bounce",
      "Catch hesitation at checkout before it becomes abandonment",
      "Capture after-hours leads instead of losing them",
      "Turn repeated questions into better product-page copy"
    ])
  ]),
  section("not-just-support", "Live chat is not just a support tool", [
    paragraph("Support happens after confusion. Growth happens when you catch confusion earlier."),
    paragraph("If someone asks for order tracking, the sale already happened. If someone asks whether a product will fit, whether shipping is fast enough, or which option to choose, that conversation can still change the outcome."),
    paragraph("That is why live chat has more revenue upside than a lot of stores give it credit for.")
  ]),
  section("product-recommendation", "1. Product recommendation for unsure shoppers", [
    paragraph("A lot of visitors do not need a full concierge experience. They just need a nudge between two versions, two bundle sizes, or two price points."),
    paragraph("That is exactly where live chat helps. A short reply can do what a long product page often does not: reduce decision fatigue."),
    list([
      "Useful for skincare, supplements, apparel, gifts, and home products",
      "Strong when buyers are asking which option is right for me",
      "Helpful when the product page is technically clear but still hard to decide from"
    ])
  ]),
  section("sizing-fit-compatibility", "2. Sizing, fit, and compatibility questions", [
    paragraph("Sizing and compatibility questions kill momentum. So do edge-case questions like what if I am between sizes or will this work with my setup."),
    paragraph("If nobody answers, the shopper either delays or leaves. Live chat is one of the fastest ways to reduce that kind of buying friction."),
    paragraph("And if the same questions keep coming up, that is not just support volume. That is page-copy feedback.")
  ]),
  section("checkout-rescue", "3. Checkout rescue when someone is stuck", [
    paragraph("If someone is hesitating at checkout, the issue is often small: a shipping question, a delivery concern, uncertainty about returns, or confusion about a product option."),
    paragraph("Those questions are often not big enough for the shopper to email you. They are big enough to stop the purchase."),
    paragraph("That is why proactive prompts on cart and checkout-adjacent pages can work so well. If someone is lingering, a simple invitation to ask a question can save sales that would otherwise disappear quietly.")
  ])
];
