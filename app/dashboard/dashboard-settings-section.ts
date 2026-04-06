import type { SettingsSection } from "./dashboard-settings-shared";

const VALID_SETTINGS_SECTIONS = new Set<SettingsSection>([
  "profile",
  "contacts",
  "automation",
  "notifications",
  "aiAssist",
  "savedReplies",
  "integrations",
  "reports",
  "email",
  "billing",
  "referrals"
]);

export function resolveSettingsSection(value: string | null | undefined): SettingsSection {
  const section = String(value ?? "").trim();
  return VALID_SETTINGS_SECTIONS.has(section as SettingsSection) ? (section as SettingsSection) : "profile";
}

export function buildSettingsSectionHref(section: SettingsSection) {
  return `/dashboard/settings?section=${section}`;
}
