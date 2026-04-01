import { randomUUID } from "node:crypto";
import type { BillingPlanKey } from "@/lib/billing-plans";
import { buildConversationFeedbackLinks } from "@/lib/conversation-feedback";
import {
  buildConversationTemplateRetryAt,
  buildInitialConversationTemplateRetryAt,
  type ConversationTemplateDeliveryStatus,
  type ReplyAttachment
} from "@/lib/conversation-template-email-policy";
import { buildConversationResumeLink } from "@/lib/conversation-resume-link";
import { shouldShowTranscriptViralFooter } from "@/lib/conversation-transcript-footer";
import { renderConversationTranscriptEmailTemplate } from "@/lib/conversation-transcript-email";
import { renderVisitorConversationEmailTemplate } from "@/lib/conversation-visitor-email";
import { getDashboardEmailTemplateSettings } from "@/lib/data/settings";
import { getPublicAppUrl } from "@/lib/env";
import { getReplyDomain } from "@/lib/env.server";
import { type DashboardEmailTemplateKey } from "@/lib/email-templates";
import { resolveConversationTemplateMailFrom } from "@/lib/mail-from-addresses";
import {
  claimTemplateDelivery,
  findConversationTemplateContext,
  listConversationTranscriptRows,
  markTemplateDeliveryFailed,
  markTemplateDeliverySent
} from "@/lib/repositories/conversation-template-email-repository";
import { sendRenderedEmail } from "@/lib/rendered-email-delivery";
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

type SendConversationTemplateEmailInput = {
  conversationId: string;
  userId?: string | null;
  templateKey: DashboardEmailTemplateKey;
  deliveryKey: string;
  attachments?: ReplyAttachment[];
  attemptCount?: number;
  skipClaim?: boolean;
};
function getReplyAlias(conversationId: string) {
  const domain = getReplyDomain();
  return domain ? `reply+${conversationId}@${domain}` : null;
}
function formatTranscript(rows: Awaited<ReturnType<typeof listConversationTranscriptRows>>, agentName: string) {
  const formatter = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" });
  return rows
    .map((message) => {
      const author = message.sender === "founder" ? agentName : "Visitor";
      const content = message.content.trim() || "(attachment only)";
      return `[${formatter.format(new Date(message.created_at))}] ${author}: ${content}`;
    })
    .join("\n\n");
}
async function queueRetry(deliveryKey: string, attemptCount: number, errorMessage: string) {
  try {
    await markTemplateDeliveryFailed({
      deliveryKey,
      errorMessage,
      nextAttemptAt: buildConversationTemplateRetryAt(attemptCount + 1)
    });
  } catch (retryStateError) {
    console.error("conversation template retry state update failed", retryStateError);
  }
  return "queued_retry" satisfies ConversationTemplateDeliveryStatus;
}
async function loadConversationContext(conversationId: string): Promise<ConversationTemplateContext | null> {
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
export async function sendConversationTemplateEmail(input: SendConversationTemplateEmailInput): Promise<ConversationTemplateDeliveryStatus> {
  const conversation = await loadConversationContext(input.conversationId);
  if (!conversation?.visitorEmail) {
    return input.skipClaim
      ? queueRetry(input.deliveryKey, input.attemptCount ?? 0, "visitor-email-missing")
      : "skipped";
  }

  const settingsUserId = input.userId ?? conversation.userId;
  const settings = await getDashboardEmailTemplateSettings(settingsUserId);
  const template = settings.email.templates.find((entry) => entry.key === input.templateKey);
  if (!template || !template.enabled) {
    return input.skipClaim
      ? queueRetry(input.deliveryKey, input.attemptCount ?? 0, "template-disabled")
      : "skipped";
  }
  if (!input.skipClaim) {
    const claimed = await claimTemplateDelivery({
      deliveryId: randomUUID(),
      conversationId: input.conversationId,
      userId: settingsUserId,
      templateKey: input.templateKey,
      deliveryKey: input.deliveryKey,
      recipientEmail: conversation.visitorEmail,
      nextAttemptAt: buildInitialConversationTemplateRetryAt()
    });
    if (!claimed) {
      return "duplicate";
    }
  }
  const appUrl = getPublicAppUrl();
  const profileName = [settings.profile.firstName, settings.profile.lastName].filter(Boolean).join(" ").trim();
  const resolvedProfileName = profileName || displayNameFromEmail(settings.profile.email);
  const agentName = settings.profile.firstName.trim() || resolvedProfileName.split(/\s+/)[0] || "Support";
  const conversationLink = buildConversationResumeLink(appUrl, {
    siteId: conversation.siteId,
    sessionId: conversation.sessionId,
    conversationId: conversation.conversationId
  });
  const transcriptRows = input.templateKey === "conversation_transcript"
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
    transcript: formatTranscript(
      transcriptRows ?? (await listConversationTranscriptRows(input.conversationId)),
      agentName
    ),
    unsubscribeLink: appUrl
  };
  const rendered =
    input.templateKey === "conversation_transcript"
      ? renderConversationTranscriptEmailTemplate(
          { subject: template.subject, body: template.body },
          templateContext,
          {
            appUrl,
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
            appUrl,
            conversationUrl: conversationLink,
            replyToEmail: replyTo,
            teamAvatarUrl: settings.profile.avatarDataUrl,
            showViralFooter: shouldShowTranscriptViralFooter(conversation.planKey),
            feedbackLinks: buildConversationFeedbackLinks(appUrl, input.conversationId)
          }
        );
  try {
    await sendRenderedEmail({
      from: resolveConversationTemplateMailFrom(input.templateKey, conversation.siteName),
      to: conversation.visitorEmail,
      replyTo,
      rendered,
      attachments: input.attachments ?? []
    });
    await markTemplateDeliverySent(input.deliveryKey);
    return "sent";
  } catch (error) {
    return queueRetry(
      input.deliveryKey,
      input.attemptCount ?? 0,
      error instanceof Error ? error.message : "email-send-failed"
    );
  }
}
