import { getDashboardHomeData } from "@/lib/data/dashboard-home";
import { DashboardHomeMetrics } from "./dashboard-home-metrics";
import { DashboardHomeRecentConversations } from "./dashboard-home-recent-conversations";
import { DashboardHomeSidebar } from "./dashboard-home-sidebar";
import { DashboardHomeTimeZoneBootstrap } from "./dashboard-home-timezone-bootstrap";

export async function DashboardHome({
  userId,
  workspaceOwnerId,
  canManageTeam
}: {
  userId: string;
  workspaceOwnerId: string;
  canManageTeam: boolean;
}) {
  const data = await getDashboardHomeData(userId, {
    workspaceOwnerId
  });

  return (
    <div className="space-y-6">
      {data.chartPending ? <DashboardHomeTimeZoneBootstrap /> : null}
      <DashboardHomeMetrics data={data} />
      <section className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <DashboardHomeRecentConversations conversations={data.recentConversations} />
        <DashboardHomeSidebar data={data} canManageTeam={canManageTeam} />
      </section>
    </div>
  );
}
