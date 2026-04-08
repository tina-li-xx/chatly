import {
  renderChattingEmailPage,
  joinEmailText,
  renderParagraph,
  renderStack,
  renderTextBlock
} from "@/lib/chatting-email-foundation";
import { renderNewMessageNotificationEmail } from "@/lib/chatting-notification-emails";
import { buildConversationFeedbackLinks } from "@/lib/conversation-feedback";
import {
  renderConversationFeedbackScale,
  renderConversationFeedbackText
} from "@/lib/conversation-feedback-email";
import { type EmailAttachment } from "@/lib/email-mime";
import { getPublicAppUrl } from "@/lib/env";
import { getAppDisplayName, getReplyDomain } from "@/lib/env.server";
import { buildEmailUnsubscribeUrl, isEmailRecipientUnsubscribed } from "@/lib/email-unsubscribe";
import {
  resolveImmediateTeamNotificationMailFrom,
  resolvePrimaryBrandHelloMailFrom
} from "@/lib/mail-from-addresses";
import { sendSesEmail } from "@/lib/ses-email";
import { COMPANY_LEGAL_LINES, FONT_STACK } from "@/lib/chatting-email-tokens";
import { escapeHtml } from "@/lib/utils";

type SendRichEmailInput = {
  to: string;
  from?: string;
  replyTo?: string | null;
  subject: string;
  bodyText: string;
  bodyHtml: string;
  attachments?: EmailAttachment[];
  emailCategory?: "critical" | "optional";
  footerTeamName?: string | null;
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

function injectFooterRows(bodyHtml: string, footerRows: string) {
  return bodyHtml.replace(
    /<\/table>\s*<\/td><\/tr>\s*<\/table>\s*$/,
    `${footerRows}</table></td></tr></table>`
  );
}

function buildPrivacyUrl(appUrl: string) {
  return new URL("/privacy", appUrl).toString();
}

function buildChattingUrl(appUrl: string) {
  const url = new URL(appUrl);
  url.pathname = "/";
  url.search = "";
  url.searchParams.set("utm_source", "email_footer");
  url.searchParams.set("utm_medium", "email");
  url.searchParams.set("utm_campaign", "legal_footer");
  url.hash = "";
  return url.toString();
}

function buildStandardLegalFooter(input: {
  teamName: string;
  appUrl: string;
  unsubscribeUrl: string;
}) {
  const privacyUrl = buildPrivacyUrl(input.appUrl);
  const chattingUrl = buildChattingUrl(input.appUrl);
  const text = `This email was sent by ${input.teamName} using Chatting.`;
  const companyLegalHtml = COMPANY_LEGAL_LINES.map(
    (line, index) =>
      `<tr><td align="center" style="font:400 12px/1.6 ${FONT_STACK};color:#94A3B8;${index === 0 ? "padding-top:12px;" : ""}">${escapeHtml(line)}</td></tr>`
  ).join("");
  const attributionHtml = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;"><tr><td align="center" style="font:400 12px/1.6 ${FONT_STACK};color:#94A3B8;">This email was sent by ${escapeHtml(input.teamName)} using <a href="${chattingUrl}" target="_blank" rel="noopener noreferrer" style="color:#64748B;text-decoration:underline;">Chatting</a>.</td></tr><tr><td align="center" style="padding-top:8px;"><a href="${input.unsubscribeUrl}" style="font:400 12px/1.6 ${FONT_STACK};color:#64748B;text-decoration:underline;">Unsubscribe</a><span style="font:400 12px/1.6 ${FONT_STACK};color:#94A3B8;"> &bull; </span><a href="${privacyUrl}" style="font:400 12px/1.6 ${FONT_STACK};color:#64748B;text-decoration:underline;">Privacy Policy</a></td></tr>${companyLegalHtml}</table>`;

  return {
    text,
    html: `<tr><td align="center" style="padding:24px 32px;background:#F8FAFC;border-top:1px solid #E2E8F0;">${attributionHtml}</td></tr>`,
    textBlock: joinEmailText([
      text,
      `Unsubscribe: ${input.unsubscribeUrl}`,
      `Privacy Policy: ${privacyUrl}`,
      COMPANY_LEGAL_LINES.join("\n")
    ])
  };
}

export async function sendTeamReplyEmail({
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
        { kind: "html" as const, html: renderParagraph(escapedBody), padding: "0 32px 24px" },
        attachments.length
          ? {
              kind: "html" as const,
              html: renderParagraph(`Attached: ${attachments.map((attachment) => escapeHtml(attachment.fileName)).join(", ")}`),
              padding: "0 32px 24px"
            }
          : null,
        {
          kind: "html" as const,
          html: renderStack(
            [
              renderTextBlock({ html: "Rate this reply", color: "#0F172A", fontWeight: 600 }),
              renderConversationFeedbackScale(feedbackLinks)
            ],
            { gap: "16px", align: "center" }
          ),
          padding: "0 32px 32px"
        }
      ].filter((section): section is NonNullable<typeof section> => Boolean(section)),
      actions: {
        message: "Reply to this email to continue the conversation.",
        primary: replyToAddress ? { href: `mailto:${replyToAddress}`, label: "Reply to This Email" } : null,
        borderTopColor: undefined
      }
    }),
    attachments,
    emailCategory: "optional",
    footerTeamName: appName
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
  const rendered = renderNewMessageNotificationEmail({
    visitorName: visitorEmail || "Visitor",
    visitorEmail,
    currentPage: pageUrl,
    messagePreview: content,
    replyNowUrl: dashboardUrl,
    inboxUrl: dashboardUrl,
    workspaceName: siteName,
    attachmentsCount,
    replyByEmailEnabled: false
  });

  await sendRichEmail({
    from: resolveImmediateTeamNotificationMailFrom(),
    to,
    subject: rendered.subject,
    bodyText: rendered.bodyText,
    bodyHtml: rendered.bodyHtml,
    emailCategory: "optional",
    footerTeamName: siteName
  });
}

export async function sendRichEmail({
  to,
  from,
  replyTo,
  subject,
  bodyText,
  bodyHtml,
  attachments = [],
  emailCategory = "critical",
  footerTeamName
}: SendRichEmailInput) {
  assertRenderedEmailShell(bodyHtml);

  if (emailCategory === "optional" && await isEmailRecipientUnsubscribed(to)) {
    return;
  }

  const appUrl = getAppUrl();
  const teamName = footerTeamName?.trim() || getAppDisplayName();
  const unsubscribeUrl = buildEmailUnsubscribeUrl(to);
  const legalFooter = buildStandardLegalFooter({
    teamName,
    appUrl,
    unsubscribeUrl
  });

  await sendSesEmail({
    from: from || resolvePrimaryBrandHelloMailFrom(),
    to,
    replyTo: replyTo || undefined,
    subject,
    bodyText: joinEmailText([bodyText, legalFooter.textBlock]),
    attachments,
    bodyHtml: injectFooterRows(
      bodyHtml,
      legalFooter.html
    )
  });
}
