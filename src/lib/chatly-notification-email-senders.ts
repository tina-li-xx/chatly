import {
  renderDailyDigestEmail,
  renderMentionNotificationEmail,
  renderWeeklyPerformanceEmail
} from "@/lib/chatly-notification-emails";
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
    rendered: renderMentionNotificationEmail(input)
  });
}

export async function sendWeeklyPerformanceEmail(input: {
  to: string;
  dateRange: string;
  highlights: string[];
  busiestHours: string;
  topPages: string[];
  reportUrl: string;
}) {
  return sendRenderedEmail({
    from: resolveWeeklyPerformanceReportMailFrom(),
    to: input.to,
    rendered: renderWeeklyPerformanceEmail(input)
  });
}
