import { seatCountFromActiveMemberships } from "@/lib/billing-seats";
import { getDashboardContactSettings } from "@/lib/data/contacts";
import { parseDashboardAiAssistSettings } from "@/lib/data/settings-ai-assist";
import { getDashboardAiAssistUsage } from "@/lib/data/settings-ai-assist-usage-read";
import { getDashboardBillingSummary } from "@/lib/data/billing";
import { getDashboardSettingsBillingSnapshot } from "@/lib/data/settings-billing-snapshot";
import { parseDashboardAutomationSettings } from "@/lib/data/settings-automation";
import { mapDashboardSettingsReports } from "@/lib/data/settings-reports";
import type {
  DashboardEmailTemplateSettings,
  DashboardSettingsData
} from "@/lib/data/settings-types";
import {
  buildDashboardAutomationContext,
  buildDashboardTeamMember,
  findPrimarySiteForOwner,
  mapDashboardNotificationSettings,
  splitSettingsName
} from "@/lib/data/settings-helpers";
import { parseDashboardEmailTemplates } from "@/lib/email-templates";
import { findDashboardReportSettingsRow } from "@/lib/repositories/report-settings-repository";
import { countHelpCenterArticleRows } from "@/lib/repositories/help-center-repository";
import {
  findBillingSummaryRow,
  findDashboardSettingsRow,
  findEmailTemplateSettingsRow
} from "@/lib/repositories/settings-repository";
import { findWorkspaceAiAssistSettingsValue } from "@/lib/repositories/ai-assist-settings-repository";
import { listSavedReplyRows } from "@/lib/repositories/saved-replies-repository";
import { listActiveTeamMemberRows } from "@/lib/repositories/workspace-repository";
import { displayNameFromEmail } from "@/lib/user-display";
import { optionalText } from "@/lib/utils";
import { getWorkspaceAccess } from "@/lib/workspace-access";
import { DEFAULT_TAGS } from "./constants";

export type DashboardSettingsLoadOptions = {
  fullBilling?: boolean;
  aiAssistUsage?: boolean;
  workspace?: {
    ownerUserId: string;
    role: "owner" | "admin" | "member";
  };
};

export async function getDashboardEmailTemplateSettings(
  userId: string
): Promise<DashboardEmailTemplateSettings> {
  const row = await findEmailTemplateSettingsRow(userId);
  if (!row) {
    throw new Error("User not found.");
  }

  const name = splitSettingsName(row.email, row.first_name, row.last_name);

  return {
    profile: {
      firstName: name.firstName,
      lastName: name.lastName,
      email: row.email,
      jobTitle: "",
      avatarDataUrl: optionalText(row.avatar_data_url)
    },
    email: {
      notificationEmail: optionalText(row.notification_email) || row.email,
      replyToEmail: optionalText(row.reply_to_email) || row.email,
      templates: parseDashboardEmailTemplates(row.email_templates_json),
      emailSignature: row.email_signature ?? ""
    }
  };
}

export async function getDashboardSettingsData(
  userId: string,
  options?: DashboardSettingsLoadOptions
): Promise<DashboardSettingsData> {
  const workspace = options?.workspace ?? await getWorkspaceAccess(userId);
  const [
    row,
    ownerRow,
    activeTeamRows,
    reportRow,
    primarySite,
    savedReplyRows,
    helpCenterArticleCount,
    billingSummary,
    contactsSettings,
    aiAssistSettingsValue,
    aiAssistUsage
  ] = await Promise.all([
    findDashboardSettingsRow(userId),
    workspace.ownerUserId === userId ? Promise.resolve(null) : findDashboardSettingsRow(workspace.ownerUserId),
    listActiveTeamMemberRows(workspace.ownerUserId),
    findDashboardReportSettingsRow(userId, workspace.ownerUserId),
    findPrimarySiteForOwner(workspace.ownerUserId),
    listSavedReplyRows(workspace.ownerUserId),
    countHelpCenterArticleRows(workspace.ownerUserId),
    options?.fullBilling === false
      ? findBillingSummaryRow(workspace.ownerUserId)
      : Promise.resolve(null),
    getDashboardContactSettings(userId),
    findWorkspaceAiAssistSettingsValue(workspace.ownerUserId),
    options?.aiAssistUsage
      ? getDashboardAiAssistUsage({
          ownerUserId: workspace.ownerUserId,
          viewerUserId: userId,
          viewerRole: workspace.role
        })
      : Promise.resolve(undefined)
  ]);

  if (!row) {
    throw new Error("User not found.");
  }

  const workspaceOwnerRow = workspace.ownerUserId === userId ? row : ownerRow;
  if (!workspaceOwnerRow) {
    throw new Error("Workspace owner not found.");
  }

  const name = splitSettingsName(row.email, row.first_name, row.last_name);
  const automation = parseDashboardAutomationSettings(
    workspaceOwnerRow.workspace_automation_settings_json,
    {
      requireEmailWhenOffline: primarySite?.requireEmailOffline ?? true,
      expectedReplyTimeOnline: primarySite?.responseTimeMode ?? "minutes"
    }
  );
  const teamName =
    primarySite?.name || `${displayNameFromEmail(workspaceOwnerRow.email)} Team`;
  const tagOptions = Array.from(
    new Set([
      ...DEFAULT_TAGS,
      ...savedReplyRows.flatMap((reply) => reply.tags)
    ])
  ).sort((left, right) => left.localeCompare(right));
  const activeMembers = activeTeamRows.map((member) =>
    buildDashboardTeamMember({
      userId: member.user_id,
      email: member.email,
      firstName: member.first_name,
      lastName: member.last_name,
      role: member.role,
      lastSeenAt: member.last_seen_at,
      isCurrentUser: member.user_id === userId,
      avatarDataUrl: member.avatar_data_url
    })
  );
  const usedSeats = seatCountFromActiveMemberships(activeMembers.length);
  const billing =
    options?.fullBilling === false
      ? await getDashboardSettingsBillingSnapshot({
          ownerUserId: workspace.ownerUserId,
          usedSeats,
          siteCount: Number(billingSummary?.site_count ?? 0)
        })
      : await getDashboardBillingSummary(workspace.ownerUserId, usedSeats);

  return {
    profile: {
      firstName: name.firstName,
      lastName: name.lastName,
      email: row.email,
      jobTitle: row.job_title ?? "",
      avatarDataUrl: optionalText(row.avatar_data_url)
    },
    teamName,
    notifications: mapDashboardNotificationSettings(row),
    aiAssist: parseDashboardAiAssistSettings(aiAssistSettingsValue),
    aiAssistUsage,
    email: {
      notificationEmail: optionalText(row.notification_email) || row.email,
      replyToEmail: optionalText(row.reply_to_email) || row.email,
      templates: parseDashboardEmailTemplates(row.email_templates_json),
      emailSignature: row.email_signature ?? ""
    },
    contacts: contactsSettings.settings,
    reports: mapDashboardSettingsReports(reportRow, workspace.role !== "member"),
    automation,
    automationContext: buildDashboardAutomationContext({
      primarySite,
      tagOptions,
      helpCenterArticleCount
    }),
    teamMembers: [
      buildDashboardTeamMember({
        userId: workspaceOwnerRow.user_id,
        email: workspaceOwnerRow.email,
        firstName: workspaceOwnerRow.first_name,
        lastName: workspaceOwnerRow.last_name,
        role: "owner",
        lastSeenAt: workspaceOwnerRow.last_seen_at,
        isCurrentUser: workspaceOwnerRow.user_id === userId,
        avatarDataUrl: workspaceOwnerRow.avatar_data_url
      }),
      ...activeMembers
    ],
    teamInvites: [],
    billing
  };
}
