import { resolvePrimaryBrandHelloMailFrom } from "@/lib/mail-from-addresses";
import { sendRenderedEmail } from "@/lib/rendered-email-delivery";
import {
  renderStarterUpgradePromptEmail,
  type TeamNotificationUpgradePrompt
} from "@/lib/team-notification-email";

export async function sendStarterUpgradePromptEmail(input: {
  to: string;
  prompt: TeamNotificationUpgradePrompt;
}) {
  await sendRenderedEmail({
    from: resolvePrimaryBrandHelloMailFrom(),
    to: input.to,
    rendered: renderStarterUpgradePromptEmail(input.prompt)
  });
}
