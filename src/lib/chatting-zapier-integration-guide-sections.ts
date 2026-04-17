import { cta, faq, list, paragraph, section } from "@/lib/blog-block-factories";
import {
  CHATTING_ZAPIER_API_REFERENCE_PATH,
  CHATTING_ZAPIER_SUPPORT_URL,
  CHATTING_ZAPIER_STARTER_ZAPS_GUIDE_PATH
} from "@/lib/chatting-zapier-starter-workflows";

export const chattingZapierIntegrationGuideSections = [
  section("before-you-start", "Before you start", [
    list([
      "A Chatting workspace with access to `Settings → Integrations → Zapier`",
      "A Zapier account",
      "One trigger or action you want to test first"
    ]),
    paragraph("Start with one simple Zap first so you can confirm the connection before building larger workflows.")
  ]),
  section("supported-triggers-and-actions", "Supported triggers and actions", [
    list([
      "Triggers: `New conversation`, `Conversation resolved`, `New contact`, `Tag added`",
      "Actions: `Create contact`, `Add tag to contact`, `Send message`"
    ]),
    paragraph(`For the endpoint-level reference, use \`${CHATTING_ZAPIER_API_REFERENCE_PATH}\`.`)
  ]),
  section("connect-zapier", "Connect Zapier", [
    list([
      "Open `Settings → Integrations → Zapier` in Chatting",
      "Copy the Chatting API key from the modal",
      "Open Chatting in Zapier from the same modal",
      "Paste the API key when Zapier asks for your Chatting account"
    ], true),
    paragraph("After the connection is saved, Chatting is available in Zapier as both a trigger app and an action app.")
  ]),
  section("build-first-zap", "Build your first Zap", [
    list([
      "Start with one `New conversation` trigger",
      "Send the output to Slack, Google Sheets, or another simple destination",
      "Test with one real conversation from Chatting",
      "Turn the Zap on after the sample data looks correct"
    ], true),
    paragraph(`For ready-made examples after the connection is live, use \`${CHATTING_ZAPIER_STARTER_ZAPS_GUIDE_PATH}\`.`)
  ]),
  section("check-connection", "Check the connection", [
    list([
      "Reconnect the account if Zapier says the connection is stale",
      "Retest the trigger sample after you add or change a Zap",
      "Confirm the mapped fields in Zapier match the latest Chatting sample data"
    ], true)
  ]),
  section("troubleshooting", "Troubleshoot a broken Zap", [
    list([
      "If Zapier says the Chatting account is stale or expired, reconnect the Chatting account and test the step again.",
      "If trigger fields are missing or out of date, load a fresh sample from Chatting and remap the fields in the Zap editor.",
      "If a live Zap run fails even after reconnecting and retesting, use Zapier support so their team can inspect the Zap history with full account context."
    ], true),
    cta(
      "Need Zapier to inspect a broken workflow?",
      "Use Zapier support for broken Zaps, editor issues, or account-level workflow problems so their team gets the run history and setup context directly.",
      "Contact Zapier support",
      CHATTING_ZAPIER_SUPPORT_URL
    )
  ]),
  section("faq", "FAQ", [
    faq([
      {
        question: "Do I need a developer to use the Zapier integration?",
        answer: "No. Most teams can connect Chatting entirely through Zapier's builder."
      },
      {
        question: "Should I start with triggers or actions?",
        answer: "Start with one trigger first because it is the fastest proof that Chatting data is flowing correctly into Zapier."
      },
      {
        question: "Where do I get the Chatting API key?",
        answer: "Open `Settings → Integrations → Zapier` inside Chatting and copy the key shown there."
      },
      {
        question: "Who should I contact if a Zap breaks?",
        answer: `If the issue is with a Zap run, the Zap editor, or your Zapier account, contact Zapier at \`${CHATTING_ZAPIER_SUPPORT_URL}\` so their support team can inspect the workflow history directly.`
      }
    ]),
    cta(
      "Ready to connect Zapier?",
      "Open the Zapier integration in Chatting, copy the API key, and start with one trigger.",
      "Open Chatting",
      "/login"
    )
  ])
];
