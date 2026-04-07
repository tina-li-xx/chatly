import { list, paragraph, section } from "@/lib/blog-block-factories";
import type { BlogSection } from "@/lib/blog-types";

export const smallEcommerceCustomerSupportWorkflowPrimarySections: BlogSection[] = [
  section("short-version", "The short version", [
    paragraph("A lot of small ecommerce stores do not have a support team. They have a founder, maybe one or two other people, and a growing pile of refunds, cancellations, shipping questions, and order-status emails that keep showing up at the worst possible time."),
    paragraph("That is why the real question is not whether support should be automated. It is what should actually be automated, what still needs a human, and how to keep the whole thing from becoming a mess."),
    list([
      "Automate the repetitive questions.",
      "Keep sensitive actions like refunds and cancellations under review.",
      "Use live chat to catch questions early before they become tickets.",
      "Keep one clean inbox instead of bouncing between tools all day."
    ])
  ]),
  section("what-small-stores-are-actually-dealing-with", "What small stores are actually dealing with", [
    paragraph("The same requests come up over and over again."),
    list([
      "Where is my order?",
      "Can I cancel this?",
      "Can I change the shipping address?",
      "When will this ship?",
      "Can I get a refund?",
      "Can I still edit my order?"
    ]),
    paragraph("Some of those are safe to automate. Some of them absolutely are not. That distinction matters more than people admit.")
  ]),
  section("what-should-usually-be-automated", "What should usually be automated", [
    paragraph("Most small stores should automate the low-risk, repetitive layer first."),
    list([
      "Order-status questions",
      "Shipping-policy questions",
      "Delivery timing basics",
      "Return-policy explanations",
      "FAQ-style product questions",
      "After-hours lead capture",
      "Routing the request to the right person or inbox"
    ]),
    paragraph("This is where Chatting fits well. It helps small teams handle the first layer of support without treating every message like a manual task.")
  ]),
  section("what-still-needs-a-human", "What usually still needs a human", [
    paragraph("This is where a lot of automated-support talk gets sloppy. Refunds, cancellations, partial refunds, edge-case delivery issues, damaged-item claims, and policy exceptions often still need a person to review them."),
    paragraph("Not because automation is useless. Because these actions affect money, inventory, fraud risk, and customer trust."),
    list([
      "A fully automatic workflow is only safe when the policy is extremely clear.",
      "The approval window is tightly defined.",
      "The order state is simple.",
      "The risk of abuse is low."
    ]),
    paragraph("Otherwise, a human still needs to look.")
  ])
];
