import { requireUser } from "@/lib/auth";
import { getAnalyticsDataset } from "@/lib/data/analytics";
import { DashboardAnalyticsPage } from "../dashboard-analytics-page";

export default async function AnalyticsPage() {
  const user = await requireUser();
  const dataset = await getAnalyticsDataset(user.id);

  return <DashboardAnalyticsPage initialDataset={dataset} userEmail={user.email} />;
}
