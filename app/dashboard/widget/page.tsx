import { requireUser } from "@/lib/auth";
import { listSitesForUser } from "@/lib/data";
import { DashboardWidgetPageClient } from "./widget-page-client";

export default async function DashboardWidgetPage() {
  const user = await requireUser();
  const sites = await listSitesForUser(user.id);

  return <DashboardWidgetPageClient initialSites={sites} />;
}
