import { cta, faq, list, paragraph, section } from "@/lib/blog-block-factories";

export const chattingZapierIntegrationGuideSections = [
  section("why", "Why teams use Zapier with Chatting", [
    paragraph("Zapier is the quickest way to move Chatting events into the rest of your stack without writing custom code. It works well when you want simple automations, lead routing, or spreadsheet logging built in a few minutes."),
    paragraph("Chatting exposes both triggers and actions, which means Zapier can react when something happens in Chatting or tell Chatting to create or update something on demand.")
  ]),
  section("available", "What Chatting supports in Zapier", [
    list([
      "Triggers: New conversation, Conversation resolved, New contact, Tag added",
      "Actions: Create contact, Add tag to contact, Send message"
    ]),
    paragraph("That gives you enough coverage to build common workflows like new-conversation alerts, contact syncing, and lightweight follow-up automation.")
  ]),
  section("connect", "How to connect Zapier", [
    list([
      "Open Settings → Integrations → Zapier in Chatting",
      "Copy the Chatting API key from the modal",
      "Open Chatting in Zapier from the same modal",
      "Paste the API key when Zapier asks for your Chatting account"
    ], true),
    paragraph("After the connection is saved, you can build Zaps using Chatting as either the trigger app or the action app.")
  ]),
  section("first-zaps", "Good first Zaps to build", [
    list([
      "New conversation → Slack message for real-time triage",
      "New contact → Google Sheets row for simple lead logging",
      "Tag added → Slack or CRM update for routing follow-up",
      "Google Sheets row → Create contact in Chatting for inbound lead imports"
    ]),
    paragraph("Start with one narrow Zap that proves the connection, then expand to the more workflow-heavy automations once the team trusts the data.")
  ]),
  section("troubleshooting", "What to check when Zapier says reconnect", [
    paragraph("Zapier connections are API-key based in Chatting. If Zapier marks the account as expired or stale, reconnect the account in Zapier with the current Chatting API key."),
    paragraph("It is also worth retesting the trigger sample after you add or change a Zap so the mapped fields come from the latest sample data.")
  ]),
  section("faq", "FAQ", [
    faq([
      {
        question: "Do I need a developer to use the Zapier integration?",
        answer: "No. The Chatting side already exposes the trigger and action endpoints; most teams can connect it entirely through Zapier's builder."
      },
      {
        question: "Should I start with triggers or actions?",
        answer: "Start with one trigger first because it is the fastest proof that Chatting data is flowing correctly into Zapier."
      },
      {
        question: "Where do I get the Chatting API key?",
        answer: "Open Settings → Integrations → Zapier inside Chatting and copy the key shown there."
      }
    ]),
    cta(
      "Want your first Zap live today?",
      "Open the Zapier integration in Chatting, copy the API key, and start with a single New conversation trigger.",
      "Open Chatting",
      "/login"
    )
  ])
];
