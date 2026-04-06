import type { DashboardBillingSummary } from "@/lib/data/billing-types";
import type { ContactWorkspaceSettings } from "@/lib/contact-types";
import type { DashboardEmailTemplate } from "@/lib/email-templates";
import type { DashboardAiAssistSettings } from "@/lib/data/settings-ai-assist";
import type { DashboardAiAssistUsageSnapshot } from "@/lib/data/settings-ai-assist-usage";
import type {
  DashboardAutomationContext,
  DashboardAutomationSettings
} from "@/lib/data/settings-automation-types";
export type {
  DashboardAiAssistSettings
} from "@/lib/data/settings-ai-assist";
export type {
  DashboardAutomationAssignRule,
  DashboardAutomationAwayWhen,
  DashboardAutomationContext,
  DashboardAutomationFaqEntry,
  DashboardAutomationFaqSource,
  DashboardAutomationPagePrompt,
  DashboardAutomationPromptDelaySeconds,
  DashboardAutomationRuleCondition,
  DashboardAutomationSettings,
  DashboardAutomationTagRule
} from "@/lib/data/settings-automation-types";

export type DashboardSettingsProfile = {
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string;
  avatarDataUrl: string | null;
};

export type DashboardSettingsNotifications = {
  browserNotifications: boolean;
  soundAlerts: boolean;
  emailNotifications: boolean;
  newVisitorAlerts: boolean;
  highIntentAlerts: boolean;
};

export type DashboardSettingsEmail = {
  notificationEmail: string;
  replyToEmail: string;
  templates: DashboardEmailTemplate[];
  emailSignature: string;
};

export type DashboardSettingsReports = {
  weeklyReportEnabled: boolean;
  weeklyReportSendTime: string;
  weeklyReportIncludePersonalStats: boolean;
  workspaceWeeklyReportsEnabled: boolean;
  workspaceIncludeTeamLeaderboard: boolean;
  workspaceAiInsightsEnabled: boolean;
  canManageWorkspaceReports: boolean;
  recipientTimeZone: string | null;
  teamTimeZone: string | null;
};

export type DashboardNotificationDeliverySettings = DashboardSettingsNotifications & {
  notificationEmail: string;
};

export type DashboardEmailTemplateSettings = {
  profile: DashboardSettingsProfile;
  email: DashboardSettingsEmail;
};

export type DashboardSavedReply = {
  id: string;
  title: string;
  body: string;
  tags: string[];
  updatedAt: string;
};

export type DashboardHelpCenterArticle = {
  id: string;
  title: string;
  slug: string;
  body: string;
  updatedAt: string;
};

export type DashboardTeamMember = {
  id: string;
  name: string;
  email: string;
  initials: string;
  role: "owner" | "admin" | "member";
  status: "online" | "offline";
  lastActiveLabel: string;
  isCurrentUser: boolean;
  avatarDataUrl: string | null;
};

export type DashboardTeamInvite = {
  id: string;
  email: string;
  role: "admin" | "member";
  status: "pending";
  message: string;
  createdAt: string;
  updatedAt: string;
};

export type DashboardSettingsData = {
  profile: DashboardSettingsProfile;
  teamName?: string;
  notifications: DashboardSettingsNotifications;
  aiAssist: DashboardAiAssistSettings;
  aiAssistUsage?: DashboardAiAssistUsageSnapshot;
  email: DashboardSettingsEmail;
  contacts: ContactWorkspaceSettings;
  reports?: DashboardSettingsReports;
  automation?: DashboardAutomationSettings;
  automationContext?: DashboardAutomationContext;
  teamMembers: DashboardTeamMember[];
  teamInvites: DashboardTeamInvite[];
  billing: DashboardBillingSummary;
};

export type UpdateDashboardSettingsReportsInput = Pick<
  DashboardSettingsReports,
  | "weeklyReportEnabled"
  | "weeklyReportSendTime"
  | "weeklyReportIncludePersonalStats"
  | "workspaceWeeklyReportsEnabled"
  | "workspaceIncludeTeamLeaderboard"
  | "workspaceAiInsightsEnabled"
>;

export type UpdateDashboardSettingsInput = {
  profile: DashboardSettingsProfile;
  teamName?: string;
  notifications: DashboardSettingsNotifications;
  aiAssist?: DashboardAiAssistSettings;
  email: DashboardSettingsEmail;
  contacts?: ContactWorkspaceSettings;
  reports?: UpdateDashboardSettingsReportsInput;
  automation?: DashboardAutomationSettings;
  password?: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  } | null;
};
