import { requireUser } from "@/lib/auth";
import { getDashboardWidgetPageData } from "@/lib/data/widget-page";
import { DashboardWidgetPageClient } from "./widget-page-client";

export default async function DashboardWidgetPage() {
  const user = await requireUser();
  const { sites, proactiveChatUnlocked } = await getDashboardWidgetPageData(user.workspaceOwnerId);

  return (
    <DashboardWidgetPageClient
      initialSites={sites}
      proactiveChatUnlocked={proactiveChatUnlocked}
    />
  );
}
