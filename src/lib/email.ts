import {
  appendChattingCompanyLegalText,
  renderChattingEmailPage
} from "@/lib/chatly-email-foundation";
import { renderNewMessageNotificationEmail } from "@/lib/chatly-notification-emails";
import { buildConversationFeedbackLinks } from "@/lib/conversation-feedback";
import {
  renderConversationFeedbackScale,
  renderConversationFeedbackText
} from "@/lib/conversation-feedback-email";
import { type EmailAttachment } from "@/lib/email-mime";
import { getPublicAppUrl } from "@/lib/env";
import { getAppDisplayName, getMailFromAddress, getReplyDomain } from "@/lib/env.server";
import { sendSesEmail } from "@/lib/ses-email";
import { escapeHtml } from "@/lib/utils";

type SendRichEmailInput = {
  to: string;
  replyTo?: string | null;
  subject: string;
  bodyText: string;
  bodyHtml: string;
  attachments?: EmailAttachment[];
};

function getAppUrl() {
  return getPublicAppUrl();
}

function getReplyToAddress(conversationId: string) {
  const domain = getReplyDomain();

  if (!domain) {
    return undefined;
  }

  return `reply+${conversationId}@${domain}`;
}

function hasRenderedEmailShell(bodyHtml: string) {
  const normalized = bodyHtml.replace(/\s+/g, " ");
  return normalized.includes('role="presentation" width="100%"') && normalized.includes("max-width:600px");
}

function assertRenderedEmailShell(bodyHtml: string) {
  if (!hasRenderedEmailShell(bodyHtml)) {
    throw new Error("sendRichEmail requires fully rendered Chatting email HTML.");
  }
}

export async function sendFounderReplyEmail({
  conversationId,
  to,
  content,
  attachments = []
}: {
  conversationId: string;
  to: string;
  content: string;
  attachments?: EmailAttachment[];
}) {
  const appName = getAppDisplayName();
  const appUrl = getAppUrl();
  const feedbackLinks = buildConversationFeedbackLinks(appUrl, conversationId);
  const escapedBody = escapeHtml(content).replace(/\n/g, "<br />");
  const replyToAddress = getReplyToAddress(conversationId);

  await sendRichEmail({
    to,
    replyTo: replyToAddress,
    subject: `Reply from ${appName}`,
    bodyText: `${content}

Reply to this email to continue the conversation.

Rate this reply:
${renderConversationFeedbackText(feedbackLinks)}`,
    bodyHtml: renderChattingEmailPage({
      preheader: `Reply from ${appName}`,
      title: `Reply from ${appName}`,
      sections: [
        { kind: "html" as const, html: `<div>${escapedBody}</div>`, padding: "0 32px 24px" },
        attachments.length
          ? {
              kind: "html" as const,
              html: `<div style="font:400 15px/1.7 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#475569;">Attached: ${attachments
                .map((attachment) => escapeHtml(attachment.fileName))
                .join(", ")}</div>`,
              padding: "0 32px 24px"
            }
          : null,
        {
          kind: "html" as const,
          html: `<div style="font:600 15px/1.7 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#0F172A;">Rate this reply</div><div style="margin-top:16px;">${renderConversationFeedbackScale(
            feedbackLinks
          )}</div>`,
          padding: "0 32px 32px"
        }
      ].filter((section): section is NonNullable<typeof section> => Boolean(section)),
      actions: {
        message: "Reply to this email to continue the conversation.",
        primary: replyToAddress ? { href: `mailto:${replyToAddress}`, label: "Reply to This Email" } : null,
        borderTopColor: undefined
      }
    }),
    attachments
  });
}

export async function sendTeamNewMessageEmail({
  to,
  siteName,
  conversationId,
  content,
  visitorEmail,
  pageUrl,
  attachmentsCount
}: {
  to: string;
  siteName: string;
  conversationId: string;
  content: string;
  visitorEmail: string | null;
  pageUrl: string | null;
  attachmentsCount: number;
}) {
  const appUrl = getAppUrl();
  const dashboardUrl = `${appUrl}/dashboard?id=${encodeURIComponent(conversationId)}`;
  const replyToAddress = getReplyToAddress(conversationId);
  const rendered = renderNewMessageNotificationEmail({
    visitorName: visitorEmail || "Visitor",
    visitorEmail,
    currentPage: pageUrl,
    messagePreview: content,
    replyNowUrl: replyToAddress ? `mailto:${replyToAddress}` : dashboardUrl,
    inboxUrl: dashboardUrl,
    workspaceName: siteName,
    attachmentsCount
  });

  await sendRichEmail({
    to,
    replyTo: replyToAddress,
    subject: rendered.subject,
    bodyText: rendered.bodyText,
    bodyHtml: rendered.bodyHtml
  });
}

export async function sendRichEmail({
  to,
  replyTo,
  subject,
  bodyText,
  bodyHtml,
  attachments = []
}: SendRichEmailInput) {
  assertRenderedEmailShell(bodyHtml);

  await sendSesEmail({
    from: getMailFromAddress(),
    to,
    replyTo: replyTo || undefined,
    subject,
    bodyText: appendChattingCompanyLegalText(bodyText),
    attachments,
    bodyHtml
  });
}

export async function sendSettingsTemplateTestEmail(input: SendRichEmailInput) {
  return sendRichEmail(input);
}
