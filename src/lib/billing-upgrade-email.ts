import { sendRichEmail } from "@/lib/email";
import {
  renderStarterUpgradePromptEmail,
  type TeamNotificationUpgradePrompt
} from "@/lib/team-notification-email";

export async function sendStarterUpgradePromptEmail(input: {
  to: string;
  prompt: TeamNotificationUpgradePrompt;
}) {
  const rendered = renderStarterUpgradePromptEmail(input.prompt);

  await sendRichEmail({
    to: input.to,
    subject: rendered.subject,
    bodyText: rendered.bodyText,
    bodyHtml: rendered.bodyHtml
  });
}
