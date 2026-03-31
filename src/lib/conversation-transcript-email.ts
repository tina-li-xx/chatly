import { buildConversationTranscriptFooterContent, type TranscriptViralVariant } from "@/lib/conversation-transcript-footer";
import { renderButtonRow, renderChattingEmailPage } from "@/lib/chatly-email-foundation";
import {
  renderDashboardEmailTemplateFragment,
  resolveDashboardEmailTemplateValue,
  type DashboardEmailTemplate,
  type DashboardEmailTemplatePreviewContext
} from "@/lib/email-templates";
import { escapeHtml } from "@/lib/utils";

export type ConversationTranscriptMessage = {
  sender: "user" | "founder";
  content: string;
  createdAt: string;
};

const PREHEADER_TEXT = "Thanks for chatting! Here's a copy of your conversation for your records.";
const TRANSCRIPT_PLACEHOLDER = "{{transcript}}";

function splitTranscriptTemplateBody(body: string) {
  const [intro = "", ...rest] = body.split(TRANSCRIPT_PLACEHOLDER);
  return { intro: intro.trim(), outro: rest.join(TRANSCRIPT_PLACEHOLDER).trim() };
}

function formatConversationDate(value: string) {
  return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(new Date(value));
}

function formatConversationTime(value: string) {
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date(value));
}

function renderAvatar(size: 24 | 48, label: string, avatarUrl: string | null) {
  if (avatarUrl && /^(data:|cid:)/i.test(avatarUrl)) {
    return `<img src="${avatarUrl}" alt="${escapeHtml(label)} avatar" width="${size}" height="${size}" style="display:block;width:${size}px;height:${size}px;border-radius:50%;object-fit:cover;border:0;" />`;
  }

  const initials = label
    .split(/\s+/)
    .map((part) => part[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const fontSize = size === 48 ? 18 : 11;
  const lineHeight = size === 48 ? `${size}px` : "24px";

  return `<div style="width:${size}px;height:${size}px;border-radius:50%;background:#DBEAFE;color:#1D4ED8;font-size:${fontSize}px;font-weight:600;line-height:${lineHeight};text-align:center;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">${escapeHtml(
    initials
  )}</div>`;
}

function renderMessageHtml(message: ConversationTranscriptMessage, agentName: string, avatarHtml: string) {
  const content = escapeHtml(message.content.trim() || "(attachment only)").replace(/\n/g, "<br />");
  const time = formatConversationTime(message.createdAt);

  if (message.sender === "user") {
    return `<tr><td style="padding:0 0 16px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="left"><table role="presentation" cellpadding="0" cellspacing="0" style="max-width:80%;"><tr><td style="background:#E2E8F0;border-radius:12px 12px 12px 4px;padding:12px 16px;font-size:14px;line-height:1.5;color:#0F172A;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">${content}</td></tr></table><div style="margin-top:4px;font-size:11px;line-height:1.4;color:#94A3B8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">${time}</div></td></tr></table></td></tr>`;
  }

  return `<tr><td style="padding:0 0 16px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="right"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="padding:0 8px 0 0;"><table role="presentation" cellpadding="0" cellspacing="0" style="max-width:80%;"><tr><td style="background:#2563EB;border-radius:12px 12px 4px 12px;padding:12px 16px;font-size:14px;line-height:1.5;color:#FFFFFF;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">${content}</td></tr></table></td><td valign="bottom">${avatarHtml}</td></tr><tr><td colspan="2" align="right" style="padding-top:4px;font-size:11px;line-height:1.4;color:#94A3B8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">${escapeHtml(agentName)} • ${time}</td></tr></table></td></tr></table></td></tr>`;
}

export function buildConversationTranscriptPreviewMessages(): ConversationTranscriptMessage[] {
  return [
    { sender: "user", content: "Hi there! Do you offer annual billing?", createdAt: "2026-03-15T10:32:00.000Z" },
    {
      sender: "founder",
      content: "We do. I can get that set up for you in a couple of minutes.",
      createdAt: "2026-03-15T10:33:00.000Z"
    },
    { sender: "user", content: "Perfect, thank you.", createdAt: "2026-03-15T10:34:00.000Z" }
  ];
}

export function renderConversationTranscriptEmailTemplate(
  template: Pick<DashboardEmailTemplate, "subject" | "body">,
  context: DashboardEmailTemplatePreviewContext,
  options: {
    appUrl: string;
    conversationUrl: string;
    replyToEmail: string;
    messages: ConversationTranscriptMessage[];
    teamAvatarUrl: string | null;
    showViralFooter: boolean;
    viralVariant?: TranscriptViralVariant;
    highlightVariables?: boolean;
  }
) {
  const resolvedSubject = resolveDashboardEmailTemplateValue(template.subject, context);
  const bodySegments = splitTranscriptTemplateBody(template.body);
  const intro = renderDashboardEmailTemplateFragment(bodySegments.intro, context, { highlightVariables: options.highlightVariables });
  const outro = renderDashboardEmailTemplateFragment(bodySegments.outro, context, { highlightVariables: options.highlightVariables });
  const firstMessageDate = options.messages[0]?.createdAt ?? new Date().toISOString();
  const messageCount = options.messages.length;
  const messageCountLabel = `${messageCount} ${messageCount === 1 ? "message" : "messages"}`;
  const footer = buildConversationTranscriptFooterContent({
    appUrl: options.appUrl,
    teamName: context.teamName,
    showViralFooter: options.showViralFooter,
    viralVariant: options.viralVariant
  });
  const teamMessageAvatar = renderAvatar(24, context.teamName, options.teamAvatarUrl);
  const transcriptRows = options.messages.map((message) => renderMessageHtml(message, context.agentName, teamMessageAvatar)).join("");
  const bodyText = [
    `Your conversation with ${context.teamName}`,
    `${formatConversationDate(firstMessageDate)} • ${messageCountLabel}`,
    intro.text,
    options.messages
      .map((message) => {
        const name = message.sender === "founder" ? context.agentName : "Visitor";
        return `${name} (${formatConversationTime(message.createdAt)}): ${message.content.trim() || "(attachment only)"}`;
      })
      .join("\n\n"),
    outro.text,
    "Need more help? Continue this conversation anytime.",
    `Reply to This Email: mailto:${options.replyToEmail}`,
    `Continue on the web: ${options.conversationUrl}`,
    footer.viral?.text ?? "",
    footer.legal?.text ?? ""
  ]
    .filter(Boolean)
    .join("\n\n");
  const bodyHtml = renderChattingEmailPage({
    preheader: PREHEADER_TEXT,
    title: `Your conversation with ${context.teamName}`,
    meta: `${formatConversationDate(firstMessageDate)} • ${messageCountLabel}`,
    hero: { label: context.teamName, avatarUrl: options.teamAvatarUrl },
    sections: [
      intro.html ? ({ kind: "html" as const, html: intro.html, padding: "0 32px 24px" }) : null,
      {
        kind: "html" as const,
        html: `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${transcriptRows}</table>`,
        padding: "24px 32px",
        background: "#F8FAFC"
      },
      outro.html ? ({ kind: "html" as const, html: outro.html, padding: "0 32px 24px" }) : null,
      footer.viral
        ? {
            kind: "html" as const,
            html: `<div style="text-align:center;font-size:14px;line-height:1.6;color:#475569;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">${escapeHtml(
              footer.viral.hookText
            )}</div><div style="margin-top:6px;text-align:center;font-size:13px;line-height:1.6;color:#64748B;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">${escapeHtml(
              footer.viral.brandText
            ).replace("Chatting", "<strong style=\"color:#475569;\">Chatting</strong>")}</div><div style="margin-top:16px;text-align:center;">${renderButtonRow({
              primary: { href: footer.viral.href, label: footer.viral.ctaLabel }
            })}</div>`,
            align: "center" as const,
            padding: "28px 32px",
            background: "#F8FAFC",
            borderTopColor: "#E2E8F0"
          }
        : null
    ].filter((section): section is NonNullable<typeof section> => Boolean(section)),
    actions: {
      message: "Need more help? Continue this conversation anytime.",
      primary: { href: `mailto:${options.replyToEmail}`, label: "Reply to This Email" },
      secondary: { href: options.conversationUrl, label: "Continue on the web" }
    },
    footer: footer.legal
      ? {
          text: footer.legal.attributionText,
          links: [{ label: footer.legal.privacyLabel, href: footer.legal.privacyHref }]
        }
      : null
  });

  return {
    subject: resolvedSubject,
    bodyText,
    bodyHtml
  };
}
