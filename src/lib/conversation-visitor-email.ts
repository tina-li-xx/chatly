import { buildConversationTranscriptFooterContent, type TranscriptViralVariant } from "@/lib/conversation-transcript-footer";
import type { ConversationFeedbackLink } from "@/lib/conversation-feedback";
import { renderTranscriptRecapPanel } from "@/lib/conversation-recap-email";
import { renderConversationFeedbackScale, renderConversationFeedbackText } from "@/lib/conversation-feedback-email";
import {
  joinEmailText,
  renderButtonRow,
  renderChattingEmailPage,
} from "@/lib/chatly-email-foundation";
import {
  renderDashboardEmailTemplateFragment,
  resolveDashboardEmailTemplateValue,
  type DashboardEmailTemplate,
  type DashboardEmailTemplateKey,
  type DashboardEmailTemplatePreviewContext
} from "@/lib/email-templates";
import { escapeHtml } from "@/lib/utils";
type SupportedVisitorTemplateKey = Exclude<DashboardEmailTemplateKey, "conversation_transcript">;

function splitBody(body: string) {
  const marker = "{{transcript}}";
  const [intro = "", ...rest] = body.split(marker);
  return { intro: intro.trim(), outro: rest.join(marker).trim() };
}

function resolveTitle(key: SupportedVisitorTemplateKey, context: DashboardEmailTemplatePreviewContext) {
  if (key === "offline_reply") {
    return "We replied to your message";
  }

  if (key === "satisfaction_survey") {
    return "How was your experience?";
  }

  return key === "welcome_email" ? `Welcome to ${context.teamName}` : `Checking in from ${context.teamName}`;
}

function shouldShowViralFooter(key: SupportedVisitorTemplateKey, showViralFooter: boolean) {
  return showViralFooter && (key === "offline_reply" || key === "follow_up_email");
}

export function renderVisitorConversationEmailTemplate(
  template: Pick<DashboardEmailTemplate, "subject" | "body">,
  context: DashboardEmailTemplatePreviewContext,
  options: {
    templateKey: SupportedVisitorTemplateKey;
    appUrl: string;
    conversationUrl: string;
    replyToEmail: string;
    teamAvatarUrl: string | null;
    showViralFooter: boolean;
    feedbackLinks?: ConversationFeedbackLink[];
    viralVariant?: TranscriptViralVariant;
    highlightVariables?: boolean;
  }
) {
  const subject = resolveDashboardEmailTemplateValue(template.subject, context);
  const body = splitBody(template.body);
  const intro = renderDashboardEmailTemplateFragment(body.intro, context, {
    highlightVariables: options.highlightVariables
  });
  const outro = renderDashboardEmailTemplateFragment(body.outro, context, {
    highlightVariables: options.highlightVariables
  });
  const viralFooter = buildConversationTranscriptFooterContent({
    appUrl: options.appUrl,
    teamName: context.teamName,
    showViralFooter: shouldShowViralFooter(options.templateKey, options.showViralFooter),
    viralVariant: options.viralVariant,
    utmSource: "visitor_email"
  });
  const feedbackScale =
    options.templateKey === "satisfaction_survey" && options.feedbackLinks?.length
      ? renderConversationFeedbackScale(options.feedbackLinks)
      : "";
  const footerLinks =
    options.templateKey === "welcome_email"
        ? {
            primary: { href: options.conversationUrl, label: "Continue on the web" },
            secondary: null
          }
      : options.templateKey === "satisfaction_survey"
        ? null
      : {
          primary: {
            href: `mailto:${options.replyToEmail}`,
            label: "Reply to This Email"
          },
          secondary: { href: options.conversationUrl, label: "Continue on the web" }
        };
  const transcriptPanel =
    options.templateKey === "offline_reply" || options.templateKey === "follow_up_email"
      ? context.transcript
        ? renderTranscriptRecapPanel(context.transcript)
        : ""
      : "";
  const textCta =
    options.templateKey === "satisfaction_survey" && options.feedbackLinks?.length
      ? renderConversationFeedbackText(options.feedbackLinks)
      : [footerLinks?.primary, footerLinks?.secondary]
          .filter((link): link is { label: string; href: string } => Boolean(link))
          .map((link) => `${link.label}: ${link.href}`)
          .join("\n");
  const callToAction =
    feedbackScale ||
    renderButtonRow({
      primary: footerLinks?.primary,
      secondary: footerLinks?.secondary
    });
  const legalText = viralFooter.legal?.text ?? "";
  const bodyText = joinEmailText([
    resolveTitle(options.templateKey, context),
    intro.text,
    options.templateKey === "offline_reply" || options.templateKey === "follow_up_email"
      ? context.transcript || undefined
      : undefined,
    outro.text,
    options.templateKey === "satisfaction_survey"
      ? "Click a rating above — it only takes a second."
      : "Need more help? Continue this conversation anytime.",
    textCta,
    viralFooter.viral?.text ?? "",
    legalText
  ]);

  return {
    subject,
    bodyText,
    bodyHtml: renderChattingEmailPage({
      preheader:
        options.templateKey === "satisfaction_survey"
          ? `We'd love your feedback on your recent chat with ${context.teamName}.`
          : `${context.teamName} sent you an update about your conversation.`,
      title: resolveTitle(options.templateKey, context),
      hero: { label: context.teamName, avatarUrl: options.teamAvatarUrl },
      sections: [
        intro.html
          ? {
              kind: "html" as const,
              html: `<div style="font:400 15px/1.7 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#475569;">${intro.html}</div>`,
              padding: "0 32px 24px"
            }
          : null,
        transcriptPanel ? ({ kind: "html" as const, html: transcriptPanel, padding: "0 32px 24px" }) : null,
        outro.html
          ? {
              kind: "html" as const,
              html: `<div style="font:400 15px/1.7 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#475569;">${outro.html}</div>`,
              padding: "0 32px 24px"
            }
          : null,
        viralFooter.viral
          ? {
              kind: "html" as const,
              html: `<div style="text-align:center;font:400 14px/1.6 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#475569;">${escapeHtml(
                viralFooter.viral.hookText
              )}</div><div style="margin-top:6px;text-align:center;font:400 13px/1.6 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#64748B;">${escapeHtml(
                viralFooter.viral.brandText
              ).replace("Chatting", "<strong style=\"color:#475569;\">Chatting</strong>")}</div><div style="margin-top:16px;text-align:center;">${renderButtonRow({
                primary: { href: viralFooter.viral.href, label: viralFooter.viral.ctaLabel }
              })}</div>`,
              align: "center" as const,
              padding: "28px 32px",
              background: "#F8FAFC",
              borderTopColor: "#E2E8F0"
            }
          : null
      ].filter((section): section is NonNullable<typeof section> => Boolean(section)),
      actions: {
        message:
          options.templateKey === "satisfaction_survey"
            ? "Click a rating below — it only takes a second."
            : "Need more help? Continue this conversation anytime.",
        customHtml: callToAction,
        borderTopColor: "#F1F5F9"
      },
      footer: viralFooter.legal
        ? {
            text: viralFooter.legal.attributionText,
            links: [{ label: viralFooter.legal.privacyLabel, href: viralFooter.legal.privacyHref }]
          }
        : null
    })
  };
}
