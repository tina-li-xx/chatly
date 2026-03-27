import {
  buildDashboardEmailTemplatePreviewContext,
  renderDashboardEmailTemplate
} from "@/lib/email-templates";
import { getDashboardSettingsData } from "@/lib/data";
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
      subject?: unknown;
      body?: unknown;
      notificationEmail?: unknown;
      replyToEmail?: unknown;
    };

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
      profileName
    });
    const rendered = renderDashboardEmailTemplate({ subject, body }, previewContext, {
      highlightVariables: false,
      includeShell: true
    });

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
