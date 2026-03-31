import {
  renderProductUpdateEmail,
  renderTrialEndingReminderEmail,
  renderTrialExpiredEmail
} from "@/lib/chatly-marketing-emails";
import { sendRichEmail } from "@/lib/email";

export async function sendTrialEndingReminderEmail(input: {
  to: string;
  firstName: string;
  endDate: string;
  metrics: Array<{ value: string; label: string }>;
  upgradeUrl: string;
  plansUrl?: string;
}) {
  const rendered = renderTrialEndingReminderEmail(input);
  return sendRichEmail({
    to: input.to,
    subject: rendered.subject,
    bodyText: rendered.bodyText,
    bodyHtml: rendered.bodyHtml
  });
}

export async function sendTrialExpiredEmail(input: {
  to: string;
  firstName: string;
  reactivateUrl: string;
}) {
  const rendered = renderTrialExpiredEmail(input);
  return sendRichEmail({
    to: input.to,
    subject: rendered.subject,
    bodyText: rendered.bodyText,
    bodyHtml: rendered.bodyHtml
  });
}

export async function sendProductUpdateEmail(input: {
  to: string;
  featureName: string;
  featureDescription: string;
  monthLabel: string;
  tryItUrl: string;
  changelogUrl: string;
  additionalUpdates: string[];
}) {
  const rendered = renderProductUpdateEmail(input);
  return sendRichEmail({
    to: input.to,
    subject: rendered.subject,
    bodyText: rendered.bodyText,
    bodyHtml: rendered.bodyHtml
  });
}
