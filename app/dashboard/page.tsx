import { requireUser } from "@/lib/auth";
import { resolveDashboardHomeRange } from "@/lib/data/dashboard-home-chart";
import { DashboardHome } from "./dashboard-home";

type DashboardPageProps = {
  searchParams?: Promise<{
    range?: string | string[];
  }>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = (await searchParams) ?? {};
  const user = await requireUser();
  const rangeDays = resolveDashboardHomeRange(params.range);

  return <DashboardHome userEmail={user.email} userId={user.id} rangeDays={rangeDays} />;
}
