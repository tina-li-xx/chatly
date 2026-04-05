import {
  sendWeeklyPerformanceEmail,
  sendWeeklyWidgetInstallEmail
} from "@/lib/chatly-notification-email-senders";
import { getPublicAppUrl } from "@/lib/env";
import { optionalText } from "@/lib/utils";
import {
  hasWeeklyPerformanceDelivery,
  insertWeeklyPerformanceDelivery,
  listWeeklyPerformanceRecipientRows,
  listWeeklyPerformanceWorkspaceRows
} from "@/lib/repositories/weekly-performance-repository";
import {
  previousLocalWeekStartDateKey,
  resolveReportTimeZone,
  shouldRunWeeklyReport
} from "@/lib/report-time";
import { getOrCreateWeeklyPerformanceSnapshot } from "@/lib/weekly-performance-snapshot-service";

type WeeklyPerformanceSendStatus = "sent" | "too-early" | "already-sent";

function reportLinks() {
  const baseUrl = getPublicAppUrl();
  return {
    reportUrl: `${baseUrl}/dashboard/analytics?range=last_week`,
    settingsUrl: `${baseUrl}/dashboard/settings?section=reports`,
    widgetUrl: `${baseUrl}/dashboard/widget`
  };
}

function teamNameOrFallback(teamName?: string | null) {
  return teamName || "Chatting";
}

function buildWeeklySnapshotRequest(input: {
  ownerUserId: string;
  teamName?: string | null;
  teamTimeZone?: string | null;
  weekStart: string;
  includeAiInsights?: boolean;
  includeTeamLeaderboard?: boolean;
}) {
  return {
    ...reportLinks(),
    ownerUserId: input.ownerUserId,
    teamName: teamNameOrFallback(input.teamName),
    weekStart: input.weekStart,
    teamTimeZone: resolveReportTimeZone(input.teamTimeZone),
    includeAiInsights: input.includeAiInsights ?? true,
    includeTeamLeaderboard: input.includeTeamLeaderboard ?? true
  };
}

export function shouldRunWeeklyPerformanceEmails(
  now = new Date(),
  recipientTimeZone?: string | null,
  teamTimeZone?: string | null,
  sendHour = 9,
  sendMinute = 0
) {
  const recipientZone = resolveReportTimeZone(recipientTimeZone);
  const workspaceZone = resolveReportTimeZone(teamTimeZone ?? recipientTimeZone);
  return (
    shouldRunWeeklyReport(now, recipientZone, sendHour, sendMinute) &&
    previousLocalWeekStartDateKey(now, recipientZone) === previousLocalWeekStartDateKey(now, workspaceZone)
  );
}

async function ensureWeeklySnapshots(now: Date) {
  const workspaces = await listWeeklyPerformanceWorkspaceRows();

  for (const workspace of workspaces) {
    if (!workspace.widget_installed) {
      continue;
    }

    await getOrCreateWeeklyPerformanceSnapshot(buildWeeklySnapshotRequest({
      ownerUserId: workspace.owner_user_id,
      teamName: workspace.team_name,
      teamTimeZone: workspace.team_timezone,
      weekStart: previousLocalWeekStartDateKey(now, workspace.team_timezone),
      includeAiInsights: workspace.workspace_ai_insights_enabled,
      includeTeamLeaderboard: workspace.workspace_include_team_leaderboard,
    }));
  }
}

export async function sendUserWeeklyPerformanceEmail(input: {
  userId: string;
  ownerUserId: string;
  notificationEmail: string;
  recipientTimeZone?: string | null;
  teamTimeZone?: string | null;
  teamName?: string | null;
  weeklyReportSendHour?: number;
  weeklyReportSendMinute?: number;
  weeklyReportIncludePersonalStats?: boolean;
  workspaceIncludeTeamLeaderboard?: boolean;
  workspaceAiInsightsEnabled?: boolean;
  widgetInstalled?: boolean;
  now?: Date;
}): Promise<WeeklyPerformanceSendStatus> {
  const now = input.now ?? new Date();
  const teamTimeZone = resolveReportTimeZone(input.teamTimeZone ?? input.recipientTimeZone);

  if (
    !shouldRunWeeklyPerformanceEmails(
      now,
      input.recipientTimeZone,
      teamTimeZone,
      input.weeklyReportSendHour ?? 9,
      input.weeklyReportSendMinute ?? 0
    )
  ) {
    return "too-early";
  }

  const deliveryKey = previousLocalWeekStartDateKey(now, teamTimeZone);
  if (await hasWeeklyPerformanceDelivery(input.userId, input.ownerUserId, deliveryKey)) {
    return "already-sent";
  }

  const snapshotRequest = buildWeeklySnapshotRequest({
    ownerUserId: input.ownerUserId,
    teamName: input.teamName,
    teamTimeZone,
    weekStart: deliveryKey,
    includeAiInsights: input.workspaceAiInsightsEnabled ?? true,
    includeTeamLeaderboard: input.workspaceIncludeTeamLeaderboard ?? true
  });

  if (!input.widgetInstalled) {
    await sendWeeklyWidgetInstallEmail({
      to: input.notificationEmail,
      teamName: snapshotRequest.teamName,
      widgetUrl: snapshotRequest.widgetUrl,
      settingsUrl: snapshotRequest.settingsUrl
    });
    await insertWeeklyPerformanceDelivery(input.userId, input.ownerUserId, deliveryKey);
    return "sent";
  }

  const snapshot = await getOrCreateWeeklyPerformanceSnapshot(snapshotRequest);

  await sendWeeklyPerformanceEmail({
    to: input.notificationEmail,
    footerTeamName: snapshotRequest.teamName,
    report: {
      ...snapshot,
      recipientUserId: input.userId,
      teamPerformance: input.workspaceIncludeTeamLeaderboard === false ? [] : snapshot.teamPerformance,
      personalPerformance:
        input.weeklyReportIncludePersonalStats === false
          ? null
          : snapshot.personalPerformanceByUserId[input.userId] ?? null
    }
  });
  await insertWeeklyPerformanceDelivery(input.userId, input.ownerUserId, deliveryKey);

  return "sent";
}

export async function runScheduledWeeklyPerformanceEmails(now = new Date()) {
  await ensureWeeklySnapshots(now);

  const recipients = await listWeeklyPerformanceRecipientRows();
  let sent = 0;
  let skipped = 0;

  for (const recipient of recipients) {
    try {
      const status = await sendUserWeeklyPerformanceEmail({
        userId: recipient.user_id,
        ownerUserId: recipient.owner_user_id,
        notificationEmail: optionalText(recipient.notification_email) || recipient.email,
        recipientTimeZone: recipient.recipient_timezone,
        teamTimeZone: recipient.team_timezone,
        teamName: recipient.team_name,
        weeklyReportSendHour: recipient.weekly_report_send_hour,
        weeklyReportSendMinute: recipient.weekly_report_send_minute,
        weeklyReportIncludePersonalStats: recipient.weekly_report_include_personal_stats,
        workspaceIncludeTeamLeaderboard: recipient.workspace_include_team_leaderboard,
        workspaceAiInsightsEnabled: recipient.workspace_ai_insights_enabled,
        widgetInstalled: recipient.widget_installed,
        now
      });
      sent += status === "sent" ? 1 : 0;
      skipped += status === "sent" ? 0 : 1;
    } catch (error) {
      skipped += 1;
      console.error("weekly performance email failed", recipient.user_id, recipient.owner_user_id, error);
    }
  }

  return { processedRecipients: recipients.length, sent, skipped };
}
