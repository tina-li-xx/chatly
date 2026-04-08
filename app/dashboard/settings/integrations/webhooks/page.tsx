import { requireUser } from "@/lib/auth";
import { getDashboardSettingsData } from "@/lib/data";
import { DashboardSettingsIntegrationsWebhooksPage } from "../../../dashboard-settings-integrations-webhooks-page";

export default async function SettingsIntegrationsWebhooksRoute() {
  const user = await requireUser();
  const settings = await getDashboardSettingsData(user.id, {
    fullBilling: false,
    workspace: {
      ownerUserId: user.workspaceOwnerId,
      role: user.workspaceRole
    }
  });

  return <DashboardSettingsIntegrationsWebhooksPage planKey={settings.billing.planKey} />;
}
