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
    bodyHtml: `
      <div style="font-family: Avenir Next, Segoe UI, sans-serif; line-height: 1.6; color: #0d1b1e;">
        <p>${escapedBody}</p>
        ${
          attachments.length
            ? `<p style="margin-top: 20px;">Attached: ${attachments
                .map((attachment) => escapeHtml(attachment.fileName))
                .join(", ")}</p>`
            : ""
        }
        <p style="margin-top: 24px;">Reply to this email to continue the conversation.</p>
        <p style="margin-top: 24px; font-weight: 600;">Rate this reply</p>
        <div style="margin-top: 16px;">${renderConversationFeedbackScale(feedbackLinks)}</div>
      </div>
    `,
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
    inboxUrl: dashboardUrl
  });

  await sendRichEmail({
    to,
    replyTo: replyToAddress,
    subject: rendered.subject,
    bodyText: `${rendered.bodyText}\n\nWorkspace: ${siteName}\nAttachments: ${attachmentsCount}`,
    bodyHtml: rendered.bodyHtml.replace(
      "</table></td></tr></table>",
      `<tr><td style="padding:0 32px 32px;font:400 13px/1.7 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#64748B;">Workspace: ${escapeHtml(
        siteName
      )}<br />Attachments: ${attachmentsCount}</td></tr></table></td></tr></table>`
    )
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
  await sendSesEmail({
    from: getMailFromAddress(),
    to,
    replyTo: replyTo || undefined,
    subject,
    bodyText,
    attachments,
    bodyHtml: `
      <div style="font-family:Avenir Next,Segoe UI,sans-serif;line-height:1.6;color:#334155;">
        ${bodyHtml}
      </div>
    `
  });
}

export async function sendSettingsTemplateTestEmail(input: SendRichEmailInput) {
  return sendRichEmail(input);
}
