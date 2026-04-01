import type { DashboardHomeData } from "@/lib/data/dashboard-home";
import { DashboardHomeConversationsCard } from "./dashboard-home-conversations-card";
import { DashboardWidgetInstallCard } from "./dashboard-widget-install-card";

export type DashboardHomeTeamRow = {
  name: string;
  initials: string;
  status: string;
  tone: string;
  activeCount: number | null;
};

export function DashboardHomeSidebar({
  data,
  teamRows
}: {
  data: DashboardHomeData;
  teamRows: DashboardHomeTeamRow[];
}) {
  return (
    <div className="space-y-6">
      <article className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-base font-semibold text-slate-900">Team status</h2>
        <div className="mt-4 space-y-4">
          {teamRows.map((member, index) => (
            <div key={`${member.name}-${index}`} className="flex items-center gap-3">
              <div className="relative">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700">
                  {member.initials}
                </span>
                <span className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${member.tone}`} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-900">{member.name}</p>
                <p className="text-xs font-normal text-slate-500">{member.status}</p>
              </div>
              {member.activeCount != null && member.activeCount > 0 ? (
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                  {member.activeCount} active
                </span>
              ) : null}
            </div>
          ))}
        </div>
      </article>

      <DashboardHomeConversationsCard chart={data.chart} chartPending={data.chartPending} />

      <DashboardWidgetInstallCard initialInstalled={data.hasWidgetInstalled} siteIds={data.widgetSiteIds} />
    </div>
  );
}
