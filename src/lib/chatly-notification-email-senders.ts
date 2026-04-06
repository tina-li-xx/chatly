import { renderAiAssistWarningEmail } from "@/lib/chatly-ai-assist-warning-email";
import {
  renderDailyDigestEmail,
  renderMentionNotificationEmail,
  renderWeeklyPerformanceEmail
} from "@/lib/chatly-notification-emails";
import { renderWeeklyWidgetInstallEmail } from "@/lib/chatly-weekly-widget-install-email";
import {
  resolveDailyDigestMailFrom,
  resolveImmediateTeamNotificationMailFrom,
  resolveWeeklyPerformanceReportMailFrom
} from "@/lib/mail-from-addresses";
import { sendRenderedEmail } from "@/lib/rendered-email-delivery";

export async function sendDailyDigestEmail(input: {
  to: string;
  date: string;
  metrics: Array<{ value: string; label: string }>;
  openConversations: Array<{ title: string; preview: string; meta: string }>;
  inboxUrl: string;
}) {
  return sendRenderedEmail({
    from: resolveDailyDigestMailFrom(),
    to: input.to,
    emailCategory: "optional",
    footerTeamName: "Chatting",
    rendered: renderDailyDigestEmail(input)
  });
}

export async function sendMentionNotificationEmail(input: {
  to: string;
  mentionerName: string;
  visitorName: string;
  note: string;
  noteMeta: string;
  conversationUrl: string;
}) {
  return sendRenderedEmail({
    from: resolveImmediateTeamNotificationMailFrom(),
    to: input.to,
    emailCategory: "optional",
    footerTeamName: "Chatting",
    rendered: renderMentionNotificationEmail(input)
  });
}

export async function sendWeeklyPerformanceEmail(input: {
  to: string;
  footerTeamName: string;
  report: Parameters<typeof renderWeeklyPerformanceEmail>[0];
}) {
  return sendRenderedEmail({
    from: resolveWeeklyPerformanceReportMailFrom(),
    to: input.to,
    emailCategory: "optional",
    footerTeamName: input.footerTeamName,
    rendered: renderWeeklyPerformanceEmail(input.report)
  });
}

export async function sendWeeklyWidgetInstallEmail(input: {
  to: string;
  teamName: string;
  widgetUrl: string;
  settingsUrl: string;
}) {
  return sendRenderedEmail({
    from: resolveWeeklyPerformanceReportMailFrom(),
    to: input.to,
    emailCategory: "optional",
    footerTeamName: input.teamName,
    rendered: renderWeeklyWidgetInstallEmail(input)
  });
}

export async function sendAiAssistWarningEmail(input: {
  to: string;
  teamName: string;
  used: number;
  limit: number;
  resetsAt: string;
  billingUrl: string;
  state: "warning" | "limited";
}) {
  return sendRenderedEmail({
    from: resolveWeeklyPerformanceReportMailFrom(),
    to: input.to,
    emailCategory: "critical",
    footerTeamName: input.teamName,
    rendered: renderAiAssistWarningEmail(input)
  });
}
