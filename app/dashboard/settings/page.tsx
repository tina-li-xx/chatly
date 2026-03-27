import { requireUser } from "@/lib/auth";
import { getDashboardSettingsData } from "@/lib/data";
import { DashboardSettingsPage } from "../dashboard-settings-page";

export default async function SettingsPage() {
  const user = await requireUser();
  const settings = await getDashboardSettingsData(user.id);

  return <DashboardSettingsPage initialData={settings} />;
}
