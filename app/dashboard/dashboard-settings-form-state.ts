import { createDefaultDashboardAiAssistSettings } from "@/lib/data/settings-ai-assist";
import { createDefaultDashboardAutomationSettings } from "@/lib/data/settings-automation";
import { normalizeDashboardSettingsReports } from "@/lib/data/settings-reports";
import type { DashboardSettingsData } from "@/lib/data/settings-types";
import type { ContactWorkspaceSettings } from "@/lib/contact-types";
import type { EditableSettings } from "./dashboard-settings-shared";

export type PasswordDraft = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export const emptyPasswordDraft = (): PasswordDraft => ({
  currentPassword: "",
  newPassword: "",
  confirmPassword: ""
});

function sanitizeContactSettings(value?: ContactWorkspaceSettings): ContactWorkspaceSettings {
  if (!value) {
    return { statuses: [], customFields: [], dataRetention: "forever" };
  }
  const legacyStatuses = new Set([
    "lead:Lead:blue",
    "trial:Trial:purple",
    "customer:Customer:green",
    "vip:VIP:amber",
    "churned:Churned:gray"
  ]);
  const statuses =
    value.statuses.length === legacyStatuses.size &&
    value.statuses.every((status) => legacyStatuses.has(`${status.key}:${status.label}:${status.color}`))
      ? []
      : value.statuses;

  return { ...value, statuses };
}

export function buildEditableSettings(initialData: DashboardSettingsData): EditableSettings {
  return {
    profile: initialData.profile,
    teamName: initialData.teamName ?? "",
    notifications: initialData.notifications,
    aiAssist:
      initialData.aiAssist ?? createDefaultDashboardAiAssistSettings(),
    email: initialData.email,
    contacts: sanitizeContactSettings(initialData.contacts),
    reports: normalizeDashboardSettingsReports(initialData.reports),
    automation: initialData.automation ?? createDefaultDashboardAutomationSettings()
  };
}
