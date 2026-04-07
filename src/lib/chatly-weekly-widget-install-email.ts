import {
  joinEmailText,
  renderBulletList,
  renderChattingEmailPage,
  renderParagraph,
  renderSmallText,
  renderStack,
  renderTextBlock
} from "@/lib/chatly-email-foundation";

type RenderedEmail = { subject: string; bodyText: string; bodyHtml: string };

export function renderWeeklyWidgetInstallEmail(input: {
  teamName: string;
  widgetUrl: string;
  settingsUrl: string;
}) {
  return {
    subject: `Install your widget to start getting weekly reports`,
    bodyText: joinEmailText([
      `${input.teamName} has not installed the Chatting widget yet.`,
      "Your inbox stays empty until the widget is live.",
      "Install the widget on your site so visitors can start conversations, your team can reply faster, and Chatting can begin tracking what's actually happening.",
      "Once it's live, you'll start seeing:",
      "- new conversations in your inbox",
      "- where visitors were when they reached out",
      "- first-response time and weekly activity",
      "- after-hours questions you can follow up on later",
      "Once it's live, Chatting will switch from setup guidance to real conversation data.",
      `Install widget → ${input.widgetUrl}`,
      `Manage report settings → ${input.settingsUrl}`
    ]),
    bodyHtml: renderChattingEmailPage({
      preheader: "Install the widget to start collecting conversations and weekly reports.",
      title: "Install your widget",
      meta: input.teamName,
      sections: [
        {
          kind: "panel",
          html: renderStack(
            [
              renderTextBlock({
                html: "Your inbox stays empty until the widget is live.",
                color: "#0F172A",
                fontSize: 22,
                lineHeight: "1.3",
                fontWeight: 600
              }),
              renderParagraph(
                "Install the widget on your site so visitors can start conversations, your team can reply faster, and Chatting can begin tracking what's actually happening."
              ),
              renderBulletList([
                "new conversations in your inbox",
                "where visitors were when they reached out",
                "first-response time and weekly activity",
                "after-hours questions you can follow up on later"
              ]),
              renderSmallText("Once it's live, Chatting will switch from setup guidance to real conversation data.")
            ],
            { gap: "12px" }
          ),
          padding: "0 32px 28px",
          panelBackground: "#FFFFFF"
        }
      ],
      actions: {
        primary: { href: input.widgetUrl, label: "Install Widget" },
        secondary: { href: input.settingsUrl, label: "Manage report settings" },
        padding: "0 32px 28px",
        borderTopColor: undefined
      }
    })
  } satisfies RenderedEmail;
}
