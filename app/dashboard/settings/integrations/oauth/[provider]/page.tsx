import { DashboardSettingsIntegrationsAuthPopup } from "../../../../dashboard-settings-integrations-auth-popup";

export default async function SettingsIntegrationOAuthPage({
  params,
  searchParams
}: {
  params: Promise<{ provider: string }>;
  searchParams?: Promise<{ shop?: string }>;
}) {
  const { provider } = await params;
  const query = (await searchParams) ?? {};

  if (provider !== "slack" && provider !== "shopify") {
    return null;
  }

  return <DashboardSettingsIntegrationsAuthPopup provider={provider} shopDomain={query.shop} />;
}
