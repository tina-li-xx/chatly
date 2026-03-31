import {
  buildDashboardEmailTemplatePreviewContext,
  type DashboardEmailTemplateKey
} from "@/lib/email-templates";
import { buildConversationFeedbackLinks } from "@/lib/conversation-feedback";
import {
  buildConversationTranscriptPreviewMessages,
  renderConversationTranscriptEmailTemplate
} from "@/lib/conversation-transcript-email";
import { shouldShowTranscriptViralFooter } from "@/lib/conversation-transcript-footer";
import { renderVisitorConversationEmailTemplate } from "@/lib/conversation-visitor-email";
import { getDashboardSettingsData } from "@/lib/data";
import { getPublicAppUrl } from "@/lib/env";
import { sendSettingsTemplateTestEmail } from "@/lib/email";
import { jsonError, jsonOk, requireJsonRouteUser } from "@/lib/route-helpers";
import { displayNameFromEmail } from "@/lib/user-display";

export async function POST(request: Request) {
  const auth = await requireJsonRouteUser();
  if ("response" in auth) {
    return auth.response;
  }

  try {
    const payload = (await request.json()) as {
      key?: unknown;
      subject?: unknown;
      body?: unknown;
      notificationEmail?: unknown;
      replyToEmail?: unknown;
    };

    const key = String(payload.key ?? "").trim() as DashboardEmailTemplateKey;
    const subject = String(payload.subject ?? "").trim();
    const body = String(payload.body ?? "").trim();
    const notificationEmail = String(payload.notificationEmail ?? "").trim();
    const replyToEmail = String(payload.replyToEmail ?? "").trim();

    if (!subject || !body || !notificationEmail) {
      return jsonError("missing-template-fields", 400);
    }

    const settings = await getDashboardSettingsData(auth.user.id);
    const profileName =
      [settings.profile.firstName, settings.profile.lastName].filter(Boolean).join(" ").trim() ||
      displayNameFromEmail(settings.profile.email);
    const previewContext = buildDashboardEmailTemplatePreviewContext({
      profileEmail: settings.profile.email,
      profileName,
      appUrl: getPublicAppUrl()
    });
    const rendered =
      key === "conversation_transcript"
        ? renderConversationTranscriptEmailTemplate(
            { subject, body },
            previewContext,
            {
              appUrl: getPublicAppUrl(),
              conversationUrl: previewContext.conversationLink,
              replyToEmail: replyToEmail || settings.email.replyToEmail || settings.profile.email,
              messages: buildConversationTranscriptPreviewMessages(),
              teamAvatarUrl: settings.profile.avatarDataUrl,
              showViralFooter: shouldShowTranscriptViralFooter(settings.billing.planKey)
            }
          )
        : renderVisitorConversationEmailTemplate(
            { subject, body },
            previewContext,
            {
              templateKey: key,
              appUrl: getPublicAppUrl(),
              conversationUrl: previewContext.conversationLink,
              replyToEmail: replyToEmail || settings.email.replyToEmail || settings.profile.email,
              teamAvatarUrl: settings.profile.avatarDataUrl,
              showViralFooter: shouldShowTranscriptViralFooter(settings.billing.planKey),
              feedbackLinks: buildConversationFeedbackLinks(getPublicAppUrl(), "preview")
            }
          );

    await sendSettingsTemplateTestEmail({
      to: notificationEmail,
      replyTo: replyToEmail || undefined,
      subject: rendered.subject,
      bodyText: rendered.bodyText,
      bodyHtml: rendered.bodyHtml
    });

    return jsonOk({ sent: true });
  } catch (error) {
    console.error("settings email template test failed", error);
    return jsonError("email-template-test-failed", 500);
  }
}
