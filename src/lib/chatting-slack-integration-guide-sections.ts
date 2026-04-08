import { cta, faq, list, paragraph, section } from "@/lib/blog-block-factories";

export const chattingSlackIntegrationGuideSections = [
  section("why", "Why teams connect Slack", [
    paragraph("Slack is the fastest way to pull Chatting into the rest of the day. Instead of watching the inbox constantly, your team can get new conversation alerts in a channel they already live in."),
    paragraph("The Slack integration is best for teams who want immediate visibility, cleaner handoffs, and the option to reply from the Slack thread when a teammate is away from the dashboard.")
  ]),
  section("setup", "How to connect Slack", [
    list([
      "Open Settings → Integrations in Chatting",
      "Choose Slack and start the connection flow",
      "Authorize Chatting in Slack",
      "Pick the Slack channel where new conversations should land",
      "Save the settings to finish the connection"
    ], true),
    paragraph("Once Slack is connected, Chatting stores the workspace and channel settings for your team, so you can come back later and change where alerts go.")
  ]),
  section("notifications", "What you can send to Slack", [
    paragraph("Slack settings let you decide how noisy or quiet the integration should be."),
    list([
      "New conversation notifications",
      "Conversations assigned to you",
      "Resolved conversations",
      "All new messages"
    ]),
    paragraph("Most teams start with new conversations and assigned-to-me alerts first, then widen it only if the channel still feels manageable.")
  ]),
  section("replying", "Replying from Slack", [
    paragraph("If Reply from Slack is enabled, your team can answer directly from the Slack thread and send that reply back to the visitor."),
    paragraph("That keeps fast handoffs possible without forcing every teammate back into the dashboard for short, straightforward replies.")
  ]),
  section("rollout", "A simple rollout that works", [
    list([
      "Start with one shared support or sales channel",
      "Keep notifications narrow at first",
      "Turn on Reply from Slack for the teammates who actually use it",
      "Use assigned-to-me alerts when individual ownership matters"
    ], true),
    cta(
      "Ready to connect Slack?",
      "Open the Integrations area in Chatting and finish the Slack connection in a few minutes.",
      "Open Chatting",
      "/login"
    )
  ]),
  section("faq", "FAQ", [
    faq([
      {
        question: "Can we change the Slack channel later?",
        answer: "Yes. Open Slack settings in Chatting and choose a different channel whenever your workflow changes."
      },
      {
        question: "Do we have to allow replies from Slack?",
        answer: "No. You can keep Slack as a notification-only integration if you want the dashboard to remain the only place where replies are sent."
      },
      {
        question: "What should we do if Slack shows a reconnect state?",
        answer: "Reconnect the Slack account from Chatting so notifications and threaded replies can resume cleanly."
      }
    ])
  ])
];
