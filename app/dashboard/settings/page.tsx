import { requireUser } from "@/lib/auth";
import { getDashboardSettingsData } from "@/lib/data";
import { resolveSettingsSection } from "../dashboard-settings-section";
import { DashboardSettingsPage } from "../dashboard-settings-page";

type SettingsPageProps = {
  searchParams?: Promise<{
    section?: string | string[];
  }>;
};

export default async function SettingsPage({ searchParams }: SettingsPageProps = {}) {
  const params = (await searchParams) ?? {};
  const user = await requireUser();
  const requestedSection = Array.isArray(params.section) ? params.section[0] : params.section;
  const activeSection = resolveSettingsSection(requestedSection);
  const settings = await getDashboardSettingsData(user.id, {
    fullBilling: activeSection === "billing" || activeSection === "referrals",
    aiAssistUsage: activeSection === "aiAssist",
    workspace: {
      ownerUserId: user.workspaceOwnerId,
      role: user.workspaceRole
    }
  });

  return (
    <DashboardSettingsPage
      key={activeSection}
      initialData={settings}
      activeSection={activeSection}
      canManageSavedReplies={user.workspaceRole !== "member"}
    />
  );
}
