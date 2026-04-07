import { list, paragraph, quote, section } from "@/lib/blog-block-factories";
import type { BlogSection } from "@/lib/blog-types";

export const trafficLowConversionPrimarySections: BlogSection[] = [
  section("short-version", "The short version", [
    paragraph("Getting traffic is not the same as getting results. A site can have a few hundred visits and no conversions, or a huge amount of traffic and a weak conversion rate, and the underlying problem is often the same: something in the journey is creating friction, confusion, or doubt."),
    list([
      "Check whether the promise that brought people in matches the page they land on.",
      "Make the value obvious in the first few seconds.",
      "Remove trust gaps around proof, pricing, timing, guarantees, or next steps.",
      "Use live chat to uncover hesitation while people are still on the site."
    ]),
    quote("Analytics can tell you where people drop off. They usually cannot tell you why.")
  ]),
  section("what-low-conversion-usually-means", "What low conversion usually means", [
    paragraph("When traffic is coming in but conversions stay weak, the problem usually falls into one of a few buckets: the wrong audience is arriving, the right audience is arriving but the page is not doing enough to convert them, the offer is interesting but trust is too weak, or visitors have simple questions and no easy way to get answers."),
    paragraph("A lot of teams jump straight to blaming traffic. Sometimes that is correct. But plenty of low-converting sites have the opposite problem: the visits are real, the interest is real, and the page is where momentum breaks."),
    paragraph("That is actually a better problem to have, because conversion problems are usually more fixable than demand problems.")
  ]),
  section("what-usually-blocks-the-conversion", "What usually blocks the conversion", [
    paragraph("The same issues come up again and again across e-commerce stores, SaaS landing pages, local service businesses, agencies, and info-product offers."),
    list([
      "The value proposition is not clear enough.",
      "The page assumes too much prior understanding.",
      "The offer feels weak compared to the price.",
      "There is not enough proof, demonstration, or reassurance.",
      "The next step feels risky or unclear."
    ]),
    paragraph("Different businesses, same core problem: the visitor is interested, but not convinced enough to act.")
  ]),
  section("a-common-pattern", "A simple case: traffic arrives, but the questions stay unresolved", [
    paragraph("A common pattern looks like this: a business starts running ads or getting traction from content. People click through. Some spend time on the page. Maybe a few even start the process. But the conversion rate stays weak."),
    paragraph("At first, it looks like a traffic problem. Then you look closer and realize visitors are still trying to figure out basic things."),
    list([
      "Is this actually for me?",
      "Why should I trust this?",
      "What makes this different?",
      "What happens next?",
      "Can I get a quick answer before I commit?"
    ]),
    paragraph("Those are not impossible objections. They are just unresolved ones. Until the site resolves them, more traffic usually just means more wasted attention.")
  ])
];
