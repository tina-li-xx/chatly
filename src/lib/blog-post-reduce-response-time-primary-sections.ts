import { CHATLY_GROWTH_MONTHLY_PRICE } from "@/lib/chatly-pricing-copy";
import { list, paragraph, quote, section } from "@/lib/blog-block-factories";
import type { BlogSection } from "@/lib/blog-types";

export const reduceResponseTimePrimarySections = [
  section("why-two-minutes", "Why 2 minutes?", [
    list(["Under 1 minute: Exceptional. Customer feels prioritized.", "1-2 minutes: Great. Feels like a real conversation.", "2-5 minutes: Acceptable. Customer might multitask.", "5+ minutes: Risky. Customer might leave.", "10+ minutes: Damaging. Customer has moved on."]),
    paragraph("Harvard Business Review found that companies responding within 5 minutes are 21x more likely to qualify leads than those responding in 30 minutes."),
    paragraph("Two minutes is the sweet spot: fast enough to feel instant, realistic enough for small teams.")
  ]),
  section("math-of-fast-responses", "The math of fast responses", [
    paragraph("Let's say your team handles 50 chats per day."),
    paragraph("Current state:"), list(["Average response time: 8 minutes", "Conversion rate: 12%", "Conversions: 6/day"]),
    paragraph("After optimization:"), list(["Average response time: 90 seconds", "Conversion rate: 18% (+50%)", "Conversions: 9/day"]),
    paragraph("That's 3 extra conversions per day. 60+ per month. From the same traffic, just faster responses.")
  ]),
  section("eight-ways", "8 ways to get under 2 minutes", [
    paragraph("1. Enable browser notifications"), paragraph("You can't respond fast if you don't know someone's waiting. Turn on browser notifications and set sounds that cut through the noise. Average time saved: 3-5 minutes."),
    paragraph("2. Use saved replies (templates)"), list(["Pricing questions", "Feature availability", "How to get started", "Technical requirements", "Refund policy"]), quote(`"Great question! Our Growth plan is ${CHATLY_GROWTH_MONTHLY_PRICE}. Want me to walk you through the features?"`),
    paragraph("Average time saved: 45-60 seconds per response"),
    paragraph("3. Set up typing indicators"), paragraph("When visitors see \"Sarah is typing...\", they wait. They know help is coming. This buys you 30-60 seconds while you formulate your response."),
    paragraph("4. Triage with quick acknowledgments"), quote("\"Good question — let me check on that for you. One sec!\""), paragraph("This resets the clock. The visitor knows you're working on it. Your \"response time\" stays fast even if the full answer takes longer.")
  ])
];
