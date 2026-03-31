import { randomUUID } from "node:crypto";
import type { BillingPlanKey } from "@/lib/billing-plans";
import { buildConversationFeedbackLinks } from "@/lib/conversation-feedback";
import { buildConversationResumeLink } from "@/lib/conversation-resume-link";
import { shouldShowTranscriptViralFooter } from "@/lib/conversation-transcript-footer";
import { renderConversationTranscriptEmailTemplate } from "@/lib/conversation-transcript-email";
import { renderVisitorConversationEmailTemplate } from "@/lib/conversation-visitor-email";
import { getDashboardEmailTemplateSettings } from "@/lib/data/settings";
import { getPublicAppUrl } from "@/lib/env";
import { getReplyDomain } from "@/lib/env.server";
import { type DashboardEmailTemplateKey } from "@/lib/email-templates";
import { sendRichEmail } from "@/lib/email";
import {
  claimTemplateDelivery,
  deletePendingTemplateDelivery,
  findConversationTemplateContext,
  listConversationTranscriptRows,
  markTemplateDeliverySent
} from "@/lib/repositories/conversation-template-email-repository";
import { displayNameFromEmail } from "@/lib/user-display";
import { optionalText } from "@/lib/utils";

type ConversationTemplateContext = {
  conversationId: string;
  siteId: string;
  sessionId: string;
  userId: string;
  siteName: string;
  visitorEmail: string | null;
  planKey: BillingPlanKey | null;
};

type ReplyAttachment = {
  fileName: string;
  contentType: string;
  content: Buffer;
};

function getAppUrl() {
  return getPublicAppUrl();
}

function getReplyAlias(conversationId: string) {
  const domain = getReplyDomain();

  if (!domain) {
    return null;
  }

  return `reply+${conversationId}@${domain}`;
}

function profileNameFromSettings(settings: Awaited<ReturnType<typeof getDashboardEmailTemplateSettings>>) {
  const name = [settings.profile.firstName, settings.profile.lastName].filter(Boolean).join(" ").trim();
  return name || displayNameFromEmail(settings.profile.email);
}

function buildFeedbackLinks(conversationId: string) {
  return buildConversationFeedbackLinks(getAppUrl(), conversationId);
}

async function getConversationTemplateContext(conversationId: string): Promise<ConversationTemplateContext | null> {
  const row = await findConversationTemplateContext(conversationId);
  if (!row) {
    return null;
  }

  return {
    conversationId: row.conversation_id,
    siteId: row.site_id,
    sessionId: row.session_id,
    userId: row.user_id,
    siteName: row.site_name,
    visitorEmail: row.email,
    planKey: row.plan_key
  };
}

function formatConversationTranscriptRows(
  rows: Awaited<ReturnType<typeof listConversationTranscriptRows>>,
  agentName: string
) {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit"
  });

  return rows
    .map((message) => {
      const author = message.sender === "founder" ? agentName : "Visitor";
      const content = message.content.trim() || "(attachment only)";
      return `[${formatter.format(new Date(message.created_at))}] ${author}: ${content}`;
    })
    .join("\n\n");
}

async function getConversationTranscript(conversationId: string, agentName: string) {
  return formatConversationTranscriptRows(await listConversationTranscriptRows(conversationId), agentName);
}

async function claimDelivery(input: {
  conversationId: string;
  templateKey: DashboardEmailTemplateKey;
  deliveryKey: string;
  recipientEmail: string;
}) {
  return claimTemplateDelivery({
    deliveryId: randomUUID(),
    conversationId: input.conversationId,
    templateKey: input.templateKey,
    deliveryKey: input.deliveryKey,
    recipientEmail: input.recipientEmail
  });
}

async function completeDelivery(deliveryKey: string) {
  await markTemplateDeliverySent(deliveryKey);
}

async function abandonDelivery(deliveryKey: string) {
  await deletePendingTemplateDelivery(deliveryKey);
}

async function sendConversationTemplateEmail(input: {
  conversationId: string;
  userId: string;
  templateKey: DashboardEmailTemplateKey;
  deliveryKey: string;
  attachments?: ReplyAttachment[];
}) {
  const [settings, conversation] = await Promise.all([
    getDashboardEmailTemplateSettings(input.userId),
    getConversationTemplateContext(input.conversationId)
  ]);

  if (!conversation?.visitorEmail) {
    return "skipped";
  }

  const template = settings.email.templates.find((entry) => entry.key === input.templateKey);
  if (!template || !template.enabled) {
    return "skipped";
  }

  const claimed = await claimDelivery({
    conversationId: input.conversationId,
    templateKey: input.templateKey,
    deliveryKey: input.deliveryKey,
    recipientEmail: conversation.visitorEmail
  });

  if (!claimed) {
    return "duplicate";
  }

  const profileName = profileNameFromSettings(settings);
  const agentName = settings.profile.firstName.trim() || profileName.split(/\s+/)[0] || "Support";
  const conversationLink = buildConversationResumeLink(getAppUrl(), {
    siteId: conversation.siteId,
    sessionId: conversation.sessionId,
    conversationId: conversation.conversationId
  });
  const feedbackLinks = buildFeedbackLinks(input.conversationId);
  const transcriptRows =
    input.templateKey === "conversation_transcript"
      ? await listConversationTranscriptRows(input.conversationId)
      : null;
  const replyTo =
    input.templateKey === "welcome_email"
      ? settings.email.replyToEmail
      : getReplyAlias(input.conversationId) || settings.email.replyToEmail;
  const templateContext = {
    visitorName: conversation.visitorEmail.split("@")[0] || "there",
    visitorEmail: conversation.visitorEmail,
    teamName: conversation.siteName,
    agentName,
    companyName: conversation.siteName,
    conversationLink,
    transcript: transcriptRows
      ? formatConversationTranscriptRows(transcriptRows, agentName)
      : await getConversationTranscript(input.conversationId, agentName),
    unsubscribeLink: getAppUrl()
  };
  const rendered =
    input.templateKey === "conversation_transcript"
      ? renderConversationTranscriptEmailTemplate(
          {
            subject: template.subject,
            body: template.body
          },
          templateContext,
          {
            appUrl: getAppUrl(),
            conversationUrl: conversationLink,
            replyToEmail: replyTo,
            messages: (transcriptRows ?? []).map((message) => ({
              sender: message.sender,
              content: message.content,
              createdAt: message.created_at
            })),
            teamAvatarUrl: settings.profile.avatarDataUrl,
            showViralFooter: shouldShowTranscriptViralFooter(conversation.planKey)
          }
        )
      : renderVisitorConversationEmailTemplate(
          {
            subject: template.subject,
            body: [template.body, optionalText(settings.email.emailSignature)].filter(Boolean).join("\n\n")
          },
          templateContext,
          {
            templateKey: input.templateKey,
            appUrl: getAppUrl(),
            conversationUrl: conversationLink,
            replyToEmail: replyTo,
            teamAvatarUrl: settings.profile.avatarDataUrl,
            showViralFooter: shouldShowTranscriptViralFooter(conversation.planKey),
            feedbackLinks
          }
        );

  try {
    await sendRichEmail({
      to: conversation.visitorEmail,
      replyTo,
      subject: rendered.subject,
      bodyText: rendered.bodyText,
      bodyHtml: rendered.bodyHtml,
      attachments: input.attachments ?? []
    });
    await completeDelivery(input.deliveryKey);
    return "sent";
  } catch (error) {
    await abandonDelivery(input.deliveryKey);
    throw error;
  }
}

export async function sendOfflineReplyTemplateEmail(input: {
  conversationId: string;
  userId: string;
  messageId: string;
  attachments?: ReplyAttachment[];
}) {
  return sendConversationTemplateEmail({
    conversationId: input.conversationId,
    userId: input.userId,
    templateKey: "offline_reply",
    deliveryKey: `offline_reply:${input.messageId}`,
    attachments: input.attachments
  });
}

export async function sendWelcomeTemplateEmail(input: {
  conversationId: string;
  userId: string;
}) {
  return sendConversationTemplateEmail({
    conversationId: input.conversationId,
    userId: input.userId,
    templateKey: "welcome_email",
    deliveryKey: `welcome_email:${input.conversationId}`
  });
}

export async function sendResolvedConversationTemplateEmails(input: {
  conversationId: string;
  userId: string;
}) {
  for (const templateKey of [
    "conversation_transcript",
    "follow_up_email",
    "satisfaction_survey"
  ] as const) {
    await sendConversationTemplateEmail({
      conversationId: input.conversationId,
      userId: input.userId,
      templateKey,
      deliveryKey: `${templateKey}:${input.conversationId}`
    });
  }
}
