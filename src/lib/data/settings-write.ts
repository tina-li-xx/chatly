import { changeUserPassword } from "@/lib/auth";
import { updateDashboardContactSettings } from "@/lib/data/contacts";
import {
  normalizeDashboardAiAssistSettings,
  serializeDashboardAiAssistSettings
} from "@/lib/data/settings-ai-assist";
import {
  getDashboardSettingsData
} from "@/lib/data/settings-read";
import {
  findPrimarySiteForOwner
} from "@/lib/data/settings-helpers";
import {
  normalizeDashboardAutomationSettings,
  serializeDashboardAutomationSettings
} from "@/lib/data/settings-automation";
import { validateDashboardSettingsReports } from "@/lib/data/settings-reports";
import type { UpdateDashboardSettingsInput } from "@/lib/data/settings-types";
import {
  serializeDashboardEmailTemplates
} from "@/lib/email-templates";
import {
  upsertDashboardReportUserSettings,
  upsertWorkspaceReportSettings
} from "@/lib/repositories/report-settings-repository";
import {
  findUserIdByEmailExcludingUser,
  updateSettingsUserEmail,
  upsertUserSettingsRecord,
  upsertWorkspaceAutomationSettings
} from "@/lib/repositories/settings-repository";
import { upsertWorkspaceAiAssistSettings } from "@/lib/repositories/ai-assist-settings-repository";
import { optionalText } from "@/lib/utils";
import { getWorkspaceAccess } from "@/lib/workspace-access";
import { updateSiteName, updateSiteWidgetSettings } from "./sites";

async function ensureEmailAvailable(email: string, userId: string) {
  const existingUserId = await findUserIdByEmailExcludingUser(email, userId);
  if (existingUserId) {
    throw new Error("EMAIL_TAKEN");
  }
}

export async function updateDashboardSettings(
  userId: string,
  input: UpdateDashboardSettingsInput
) {
  const email = input.profile.email.trim().toLowerCase();
  const teamName = input.teamName?.trim();
  const reports = input.reports ? validateDashboardSettingsReports(input.reports) : null;
  const workspace = await getWorkspaceAccess(userId);
  const aiAssist = input.aiAssist
    ? normalizeDashboardAiAssistSettings(input.aiAssist)
    : null;
  const primarySite =
    teamName || input.automation
      ? await findPrimarySiteForOwner(workspace.ownerUserId)
      : null;
  const automationDefaults = {
    requireEmailWhenOffline: primarySite?.requireEmailOffline ?? true,
    expectedReplyTimeOnline: primarySite?.responseTimeMode ?? "minutes"
  };
  const automation = input.automation
    ? normalizeDashboardAutomationSettings(input.automation, automationDefaults)
    : null;

  if (!email) {
    throw new Error("MISSING_EMAIL");
  }
  if (typeof input.teamName === "string" && !teamName) {
    throw new Error("MISSING_TEAM_NAME");
  }

  await ensureEmailAvailable(email, userId);

  if (teamName && primarySite && primarySite.name !== teamName) {
    await updateSiteName(primarySite.id, teamName, userId);
  }

  await updateSettingsUserEmail(userId, email);
  await upsertUserSettingsRecord({
    userId,
    firstName: input.profile.firstName.trim(),
    lastName: input.profile.lastName.trim(),
    jobTitle: input.profile.jobTitle.trim(),
    avatarDataUrl: optionalText(input.profile.avatarDataUrl),
    notificationEmail: optionalText(input.email.notificationEmail),
    replyToEmail: optionalText(input.email.replyToEmail),
    emailTemplatesJson: serializeDashboardEmailTemplates(input.email.templates),
    browserNotifications: input.notifications.browserNotifications,
    soundAlerts: input.notifications.soundAlerts,
    emailNotifications: input.notifications.emailNotifications,
    newVisitorAlerts: input.notifications.newVisitorAlerts,
    highIntentAlerts: input.notifications.highIntentAlerts,
    emailSignature: input.email.emailSignature
  });

  if (reports) {
    await upsertDashboardReportUserSettings({
      userId,
      weeklyReportEnabled: reports.weeklyReportEnabled,
      weeklyReportSendHour: reports.weeklyReportSendHour,
      weeklyReportSendMinute: reports.weeklyReportSendMinute,
      weeklyReportIncludePersonalStats: reports.weeklyReportIncludePersonalStats
    });

    if (workspace.role !== "member") {
      await upsertWorkspaceReportSettings({
        ownerUserId: workspace.ownerUserId,
        weeklyReportsEnabled: reports.workspaceWeeklyReportsEnabled,
        includeTeamLeaderboard: reports.workspaceIncludeTeamLeaderboard,
        aiInsightsEnabled: reports.workspaceAiInsightsEnabled
      });
    }
  }

  if (automation) {
    await upsertWorkspaceAutomationSettings(
      workspace.ownerUserId,
      serializeDashboardAutomationSettings(automation, automationDefaults)
    );

    if (primarySite) {
      await updateSiteWidgetSettings(primarySite.id, userId, {
        domain: primarySite.domain,
        brandColor: primarySite.brandColor,
        widgetTitle: primarySite.widgetTitle,
        greetingText: primarySite.greetingText,
        launcherPosition: primarySite.launcherPosition,
        avatarStyle: primarySite.avatarStyle,
        showOnlineStatus: primarySite.showOnlineStatus,
        requireEmailOffline: automation.offline.leadCapture.requireEmailWhenOffline,
        offlineTitle: primarySite.offlineTitle,
        offlineMessage: automation.offline.leadCapture.formMessage,
        awayTitle: primarySite.awayTitle,
        awayMessage: automation.offline.autoReplyMessage,
        soundNotifications: primarySite.soundNotifications,
        autoOpenPaths: primarySite.autoOpenPaths,
        responseTimeMode: automation.offline.expectedReplyTimeOnline,
        operatingHoursEnabled: primarySite.operatingHoursEnabled,
        operatingHoursTimezone: primarySite.operatingHoursTimezone,
        operatingHours: primarySite.operatingHours
      });
    }
  }

  if (aiAssist) {
    await upsertWorkspaceAiAssistSettings(
      workspace.ownerUserId,
      serializeDashboardAiAssistSettings(aiAssist)
    );
  }

  if (input.contacts) {
    await updateDashboardContactSettings(userId, input.contacts);
  }

  if (
    input.password &&
    (input.password.currentPassword ||
      input.password.newPassword ||
      input.password.confirmPassword)
  ) {
    if (input.password.newPassword !== input.password.confirmPassword) {
      throw new Error("PASSWORD_CONFIRM");
    }

    await changeUserPassword(
      userId,
      input.password.currentPassword,
      input.password.newPassword
    );
  }

  return getDashboardSettingsData(userId, {
    fullBilling: false,
    workspace: {
      ownerUserId: workspace.ownerUserId,
      role: workspace.role
    }
  });
}
