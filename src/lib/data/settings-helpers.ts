import type {
  DashboardAutomationContext,
  DashboardSettingsNotifications,
  DashboardTeamMember
} from "@/lib/data/settings-types";
import {
  formatDashboardTeamLastActiveLabel,
  isDashboardTeamMemberOnline
} from "@/lib/dashboard-team-status";
import type { Site } from "@/lib/types";
import { displayNameFromEmail, firstNameFromDisplayName, initialsFromLabel } from "@/lib/user-display";
import { optionalText } from "@/lib/utils";
import { listSitesForUser } from "./sites";
import type { UserSettingsRow } from "@/lib/repositories/settings-repository";

type SettingsNameParts = {
  firstName: string;
  lastName: string;
};

type TeamMemberInput = {
  userId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: DashboardTeamMember["role"];
  lastSeenAt: string | null;
  isCurrentUser: boolean;
  avatarDataUrl: string | null;
};

export function splitSettingsName(
  email: string,
  firstName: string | null,
  lastName: string | null
): SettingsNameParts {
  const displayName = displayNameFromEmail(email);
  const fallbackFirstName = firstNameFromDisplayName(displayName);
  const fallbackLastName = displayName.replace(fallbackFirstName, "").trim();

  return {
    firstName: optionalText(firstName) || fallbackFirstName,
    lastName: optionalText(lastName) || fallbackLastName
  };
}

export const formatSettingsLastActiveLabel = formatDashboardTeamLastActiveLabel;
export const isSettingsUserOnline = isDashboardTeamMemberOnline;

export function mapDashboardNotificationSettings(
  row: Pick<
    UserSettingsRow,
    | "browser_notifications"
    | "sound_alerts"
    | "email_notifications"
    | "new_visitor_alerts"
    | "high_intent_alerts"
  >
): DashboardSettingsNotifications {
  return {
    browserNotifications: row.browser_notifications ?? true,
    soundAlerts: row.sound_alerts ?? true,
    emailNotifications: row.email_notifications ?? true,
    newVisitorAlerts: row.new_visitor_alerts ?? false,
    highIntentAlerts: row.high_intent_alerts ?? true
  };
}

export function buildDashboardAutomationContext(input: {
  primarySite: Site | null;
  tagOptions: string[];
  helpCenterArticleCount: number;
}): DashboardAutomationContext {
  return {
    primarySiteId: input.primarySite?.id ?? null,
    brandColor: input.primarySite?.brandColor ?? "#2563EB",
    widgetTitle: input.primarySite?.widgetTitle ?? "Talk to the team",
    officeHoursEnabled: input.primarySite?.operatingHoursEnabled ?? false,
    officeHoursTimezone: input.primarySite?.operatingHoursTimezone ?? null,
    operatingHours: input.primarySite?.operatingHours ?? null,
    defaultWelcomeMessage: input.primarySite?.greetingText ?? "Hi! How can we help you today?",
    tagOptions: input.tagOptions,
    helpCenterPath: input.primarySite ? `/help/${input.primarySite.id}` : null,
    helpCenterArticleCount: input.helpCenterArticleCount
  };
}

export function buildDashboardTeamMember(input: TeamMemberInput): DashboardTeamMember {
  const nameParts = splitSettingsName(input.email, input.firstName, input.lastName);
  const name =
    [nameParts.firstName, nameParts.lastName].filter(Boolean).join(" ").trim() ||
    displayNameFromEmail(input.email);

  return {
    id: input.userId,
    name,
    email: input.email,
    initials: initialsFromLabel(name),
    role: input.role,
    status: isSettingsUserOnline(input.lastSeenAt) ? "online" : "offline",
    lastActiveLabel: formatSettingsLastActiveLabel(input.lastSeenAt),
    isCurrentUser: input.isCurrentUser,
    avatarDataUrl: optionalText(input.avatarDataUrl)
  };
}

export async function findPrimarySiteForOwner(ownerUserId: string) {
  const sites = await listSitesForUser(ownerUserId);
  return sites[0] ?? null;
}
