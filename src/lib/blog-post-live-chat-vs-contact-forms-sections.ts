import { cta, comparison, list, paragraph, quote, section } from "@/lib/blog-block-factories";
import type { BlogSection } from "@/lib/blog-types";

export const liveChatVsContactFormsSections: BlogSection[] = [
  section("uncomfortable-truth", "The uncomfortable truth about contact forms", [
    paragraph("You spent money getting someone to your website. They're interested enough to have a question. They click \"Contact Us.\""),
    list(["Name (required)", "Email (required)", "Phone (required)", "Company (required)", "Message (required)", "\"Someone will get back to you within 24-48 business hours.\""]),
    paragraph("And 98% of them leave."),
    paragraph("Not because they lost interest. Because you made it too hard. Because 24-48 hours is an eternity. Because filling out a form feels like homework.")
  ]),
  section("numbers-dont-lie", "The numbers don't lie", [
    comparison(["Contact Form", "Live Chat"], [
      { label: "Average conversion rate", values: ["2.35%", "6-10%"] },
      { label: "Average response time", values: ["24-48 hours", "2 minutes"] },
      { label: "Completion rate", values: ["20% start, 2% submit", "80%+ engagement"] },
      { label: "Customer preference", values: ["14%", "41%"] }
    ], 1),
    paragraph("Source: Forrester, Kayako, HubSpot research"),
    paragraph("People prefer chat. Chat converts better. Why are you still using forms?")
  ]),
  section("why-chat-works", "Why chat works", [
    list(["1. It's instant", "2. It's conversational", "3. It reduces friction", "4. It builds trust"]),
    paragraph("When someone has a question, they want an answer now. Not tomorrow. Not \"within 1-2 business days.\" Now. Live chat delivers that. Forms don't."),
    quote("\"Please describe your inquiry in the box below\" vs \"Hey! What can I help you with?\""),
    paragraph("Forms ask for everything upfront: name, email, phone, company, message, blood type, mother's maiden name. Chat starts with one question: \"How can I help?\""),
    paragraph("A form says: \"We'll get back to you eventually.\" A chat says: \"We're here right now.\" Which company would you rather buy from?")
  ]),
  section("what-if-were-not-online", "The \"but what if we're not online?\" objection", [
    paragraph("This is the #1 reason teams avoid live chat. And it's a solved problem."),
    quote("\"We're not online right now, but leave your email and we'll get back to you ASAP.\""),
    paragraph("It's still a form — but it's a short form, after they've already decided to reach out. Conversion rates on offline forms are 3-4x higher than standalone contact pages."),
    paragraph("Plus, you can set business hours, so visitors know when to expect a response.")
  ]),
  section("hidden-cost", "The hidden cost of slow responses", [
    list(["5 minutes or less: 21x more likely to qualify a lead", "30 minutes: Lead is 100x less likely to convert than at 5 minutes", "24 hours: They've already talked to your competitor"]),
    paragraph("Contact forms guarantee slow responses. Chat makes fast responses the default.")
  ]),
  section("how-to-make-the-switch", "How to make the switch", [
    list(["Step 1: Don't remove your contact form immediately", "Step 2: Watch the data", "Step 3: Phase out the form", "Step 4: Optimize your chat"], true),
    paragraph("Add chat alongside your form. Let visitors choose. Track which converts better. Within a week, you'll see more conversations, higher engagement, and faster time-to-conversion."),
    paragraph("Once you trust the data, move your form to a secondary position. Make chat the primary contact method."),
    list(["Set a friendly welcome message", "Use offline forms for after-hours", "Track which pages generate the most chats", "Train your team on fast responses"])
  ]),
  section("brightpath-example", "Real example: BrightPath's switch", [
    paragraph("BrightPath (an online education company) switched from contact forms to Chatting."),
    paragraph("Before (contact form):"),
    list(["340 form views/month", "8 submissions (2.3% conversion)", "28-hour average response time", "2 closed deals"]),
    paragraph("After (live chat):"),
    list(["340 widget views/month", "47 conversations (13.8% conversion)", "3-minute average response time", "11 closed deals"]),
    paragraph("Same traffic. 5.5x more deals.")
  ]),
  section("bottom-line", "The bottom line", [
    paragraph("Contact forms feel safe. They're familiar. You \"always have\" them."),
    paragraph("But safe isn't the same as effective."),
    paragraph("If you're serious about converting website visitors, give them what they actually want: a conversation."),
    cta("Add live chat to your site", "Setup takes 5 minutes.", "Add live chat to your site", "/login")
  ])
];
