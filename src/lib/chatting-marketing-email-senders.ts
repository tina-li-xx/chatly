import {
  renderProductUpdateEmail,
  renderTrialEndingReminderEmail,
  renderTrialExpiredEmail
} from "@/lib/chatting-marketing-emails";
import { getPublicAppUrl } from "@/lib/env";
import {
  resolvePrimaryBrandHelloMailFrom,
  resolveProductUpdatesMailFrom
} from "@/lib/mail-from-addresses";
import { sendRenderedEmail } from "@/lib/rendered-email-delivery";

export async function sendTrialEndingReminderEmail(input: {
  to: string;
  firstName: string;
  endDate: string;
  metrics: Array<{ value: string; label: string }>;
  upgradeUrl: string;
  plansUrl?: string;
}) {
  return sendRenderedEmail({
    from: resolvePrimaryBrandHelloMailFrom(),
    to: input.to,
    emailCategory: "optional",
    footerTeamName: "Chatting",
    rendered: renderTrialEndingReminderEmail(input)
  });
}

export async function sendTrialExpiredEmail(input: {
  to: string;
  firstName: string;
  reactivateUrl: string;
}) {
  return sendRenderedEmail({
    from: resolvePrimaryBrandHelloMailFrom(),
    to: input.to,
    emailCategory: "optional",
    footerTeamName: "Chatting",
    rendered: renderTrialExpiredEmail(input)
  });
}

export async function sendProductUpdateEmail(input: {
  to: string;
  featureName: string;
  featureDescription: string;
  monthLabel: string;
  tryItUrl: string;
  changelogUrl?: string;
  additionalUpdates: string[];
}) {
  return sendRenderedEmail({
    from: resolveProductUpdatesMailFrom(),
    to: input.to,
    emailCategory: "optional",
    footerTeamName: "Chatting",
    rendered: renderProductUpdateEmail({
      ...input,
      changelogUrl: input.changelogUrl ?? `${getPublicAppUrl()}/changelog`
    })
  });
}
