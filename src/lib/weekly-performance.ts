import { sendWeeklyPerformanceEmail, sendWeeklyWidgetInstallEmail } from "@/lib/chatting-notification-email-senders";
import { claimWeeklyPerformanceDelivery, listWeeklyPerformanceRecipientRows, listWeeklyPerformanceWorkspaceRows } from "@/lib/repositories/weekly-performance-repository";
import { withRetryableDatabaseConnectionRetry } from "@/lib/retryable-database-errors";
import { previousLocalWeekStartDateKey, resolveReportTimeZone, shouldRunWeeklyReport } from "@/lib/report-time";
import { optionalText } from "@/lib/utils";
import { buildWeeklySnapshotRequest, cleanupClaimedWeeklyPerformanceDelivery, createWeeklyPerformanceSnapshotLoader, loadWeeklyPerformanceSnapshot, type WeeklyPerformanceSnapshot, WeeklyPerformanceCleanupError } from "@/lib/weekly-performance-runtime";

type WeeklyPerformanceSendStatus = "sent" | "too-early" | "already-sent";

function hasWeeklyDeliveryWindowAligned(
  now: Date,
  recipientTimeZone?: string | null,
  teamTimeZone?: string | null
) {
  const recipientZone = resolveReportTimeZone(recipientTimeZone);
  const workspaceZone = resolveReportTimeZone(teamTimeZone ?? recipientTimeZone);
  return previousLocalWeekStartDateKey(now, recipientZone) === previousLocalWeekStartDateKey(now, workspaceZone);
}

export function shouldRunWeeklyPerformanceEmails(
  now = new Date(),
  recipientTimeZone?: string | null,
  teamTimeZone?: string | null,
  sendHour = 9,
  sendMinute = 0
) {
  return (
    shouldRunWeeklyReport(now, recipientTimeZone, sendHour, sendMinute) &&
    hasWeeklyDeliveryWindowAligned(now, recipientTimeZone, teamTimeZone)
  );
}

async function ensureWeeklySnapshots(
  now: Date,
  loadSnapshot: ReturnType<typeof createWeeklyPerformanceSnapshotLoader>
) {
  const workspaces = await withRetryableDatabaseConnectionRetry(() => listWeeklyPerformanceWorkspaceRows());

  for (const workspace of workspaces) {
    if (!workspace.widget_installed) continue;

    await loadSnapshot(buildWeeklySnapshotRequest({
      ownerUserId: workspace.owner_user_id,
      teamName: workspace.team_name,
      teamTimeZone: workspace.team_timezone,
      weekStart: previousLocalWeekStartDateKey(now, workspace.team_timezone),
      includeAiInsights: workspace.workspace_ai_insights_enabled,
      includeTeamLeaderboard: workspace.workspace_include_team_leaderboard
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
  snapshot?: WeeklyPerformanceSnapshot;
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
  if (!(await withRetryableDatabaseConnectionRetry(() => claimWeeklyPerformanceDelivery(input.userId, input.ownerUserId, deliveryKey)))) {
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
    try {
      await sendWeeklyWidgetInstallEmail({
        to: input.notificationEmail,
        teamName: snapshotRequest.teamName,
        widgetUrl: snapshotRequest.widgetUrl,
        settingsUrl: snapshotRequest.settingsUrl
      });
      return "sent";
    } catch (error) {
      await cleanupClaimedWeeklyPerformanceDelivery({ userId: input.userId, ownerUserId: input.ownerUserId, deliveryKey, sendError: error });
      throw error;
    }
  }

  const snapshot = input.snapshot ?? (await loadWeeklyPerformanceSnapshot(snapshotRequest));

  try {
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
    return "sent";
  } catch (error) {
    await cleanupClaimedWeeklyPerformanceDelivery({ userId: input.userId, ownerUserId: input.ownerUserId, deliveryKey, sendError: error });
    throw error;
  }
}

export async function runScheduledWeeklyPerformanceEmails(now = new Date()) {
  const loadSnapshot = createWeeklyPerformanceSnapshotLoader();
  await ensureWeeklySnapshots(now, loadSnapshot);

  const recipients = await withRetryableDatabaseConnectionRetry(() => listWeeklyPerformanceRecipientRows());
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
        now,
        snapshot: recipient.widget_installed
          ? await loadSnapshot(buildWeeklySnapshotRequest({
              ownerUserId: recipient.owner_user_id,
              teamName: recipient.team_name,
              teamTimeZone: recipient.team_timezone,
              weekStart: previousLocalWeekStartDateKey(now, recipient.team_timezone),
              includeAiInsights: recipient.workspace_ai_insights_enabled,
              includeTeamLeaderboard: recipient.workspace_include_team_leaderboard
            }))
          : undefined
      });
      sent += status === "sent" ? 1 : 0;
      skipped += status === "sent" ? 0 : 1;
    } catch (error) {
      skipped += 1;
      if (error instanceof WeeklyPerformanceCleanupError) {
        console.error(
          "weekly performance delivery cleanup failed",
          recipient.user_id,
          recipient.owner_user_id,
          error.sendError,
          error.cleanupError
        );
        continue;
      }

      console.error("weekly performance email failed", recipient.user_id, recipient.owner_user_id, error);
    }
  }

  return { processedRecipients: recipients.length, sent, skipped };
}
