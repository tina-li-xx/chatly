import type { DashboardHomeData } from "@/lib/data/dashboard-home";
import { DashboardHomeConversationsCard } from "./dashboard-home-conversations-card";
import { DashboardHomeTeamCard } from "./dashboard-home-team-card";
import { DashboardWidgetInstallCard } from "./dashboard-widget-install-card";

export function DashboardHomeSidebar({
  data,
  canManageTeam
}: {
  data: DashboardHomeData;
  canManageTeam: boolean;
}) {
  return (
    <div className="space-y-6">
      {canManageTeam ? (
        <DashboardHomeTeamCard
          members={data.teamMembers}
          pendingInviteCount={data.pendingTeamInvites}
        />
      ) : null}

      <DashboardHomeConversationsCard chart={data.chart} chartPending={data.chartPending} />

      <DashboardWidgetInstallCard initialInstalled={data.hasWidgetInstalled} siteIds={data.widgetSiteIds} />
    </div>
  );
}
