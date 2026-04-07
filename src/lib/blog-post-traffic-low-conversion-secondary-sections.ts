import { cta, faq, list, paragraph, section } from "@/lib/blog-block-factories";
import type { BlogSection } from "@/lib/blog-types";

export const trafficLowConversionSecondarySections: BlogSection[] = [
  section("why-live-chat-helps", "Why live chat helps when conversion is weak", [
    paragraph("This is where Chatting fits. If your site is getting traffic but not enough sales or leads, live chat is not just a support layer. It is a way to hear the objections your analytics cannot explain."),
    paragraph("A lot of conversion problems are really question problems. Visitors are wondering whether the offer fits their situation, how the process works, what happens after they submit, or whether there is a catch. When nobody answers those questions, the visitor leaves."),
    paragraph("Chatting gives small teams a cleaner way to catch that moment.")
  ]),
  section("what-chatting-helps-you-learn-fast", "What Chatting helps you learn fast", [
    paragraph("For a business trying to improve conversion, the first value of live chat is not building a massive support workflow. It is learning faster."),
    list([
      "See what visitors ask before converting.",
      "Capture after-hours interest instead of losing it.",
      "Spot repeat objections across key pages.",
      "Follow up with interested people who are not ready yet.",
      "Use FAQ suggestions and live conversation to reduce hesitation."
    ]),
    paragraph("That gives you better input for fixing page copy, offer clarity, FAQ content, pricing explanation, trust signals, call-to-action language, and the lead capture flow.")
  ]),
  section("what-to-fix-before-buying-more-traffic", "What to fix before spending more on traffic", [
    paragraph("If traffic is coming in but conversion is lagging, fix the page before scaling spend."),
    list([
      "Clearer positioning",
      "Stronger proof",
      "Better explanation of the offer",
      "Less friction around the next step",
      "More visible trust signals",
      "Faster answers to pre-conversion questions"
    ], true),
    paragraph("Do not keep paying for more visits to a page that is already under-converting. That is not scale. That is expensive ambiguity.")
  ]),
  section("our-take", "Our take", [
    paragraph("If your site is getting traffic but not enough sales or leads, the answer is usually not just to get more traffic. It is to find the friction."),
    paragraph("That is why Chatting is useful at this stage. It helps small teams uncover the questions, objections, and trust gaps that stop people from converting, and it gives visitors a way to ask instead of bounce."),
    cta(
      "Find what is blocking conversions faster",
      "Use Chatting to surface buyer questions, capture after-hours interest, and turn low-converting traffic into clearer next actions for your team.",
      "Start free with Chatting",
      "/login"
    )
  ]),
  section("faq", "FAQ", [
    faq([
      {
        question: "Is low conversion always a traffic problem?",
        answer:
          "No. Sometimes traffic quality is the issue, but often the bigger problem is that the page does not explain, reassure, or convert well enough."
      },
      {
        question: "Should I increase ad spend if conversion is weak?",
        answer:
          "Usually not yet. Fix the page, trust gaps, and buying friction first so you do not pay to learn slowly."
      },
      {
        question: "How does live chat help with conversion?",
        answer:
          "It helps you uncover real visitor objections in real time instead of guessing from bounce rate, scroll depth, and click-through data alone."
      },
      {
        question: "Is Chatting more useful for support or conversion?",
        answer:
          "For teams in this situation, it is often most useful as a pre-sales or pre-conversion learning tool first. The conversations tell you what the page still is not doing."
      },
      {
        question: "What should I look at first on a low-converting site?",
        answer:
          "Start with clarity, trust, pricing or offer support, and the questions visitors are most likely leaving with. Those are usually the fastest path to better conversion."
      }
    ])
  ])
];
