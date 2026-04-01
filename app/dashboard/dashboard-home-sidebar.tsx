import type { DashboardHomeData } from "@/lib/data/dashboard-home";
import { DashboardWidgetInstallCard } from "./dashboard-widget-install-card";
import { DashboardHomeRangeSelect } from "./dashboard-home-range-select";

export type DashboardHomeTeamRow = {
  name: string;
  initials: string;
  status: string;
  tone: string;
  activeCount: number | null;
};

function metricBadge(value: number | null) {
  if (value == null) {
    return { text: "No data", tone: "text-slate-500" };
  }

  if (value === 0) {
    return { text: "0", tone: "text-slate-500" };
  }

  return { text: `${value > 0 ? "+" : ""}${value}%`, tone: value > 0 ? "text-green-600" : "text-slate-500" };
}

export function DashboardHomeSidebar({
  data,
  teamRows
}: {
  data: DashboardHomeData;
  teamRows: DashboardHomeTeamRow[];
}) {
  const chartBadge = metricBadge(data.chart.changePercent);
  const chartMax = Math.max(...data.chart.points.map((point) => point.count), 1);

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

      <article className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-slate-900">Conversations</h2>
          <label className="sr-only" htmlFor="dashboard-range">
            Time period
          </label>
          <DashboardHomeRangeSelect value={data.chart.rangeDays} />
        </div>

        <div className="mt-5 flex h-32 items-end gap-3">
          {data.chart.points.map((point) => (
            <div key={point.label} className="flex w-8 flex-col items-center gap-2">
              <div className="flex h-[100px] w-8 items-end">
                <div
                  className="w-8 rounded-t-sm bg-blue-600"
                  style={{ height: `${Math.max((point.count / chartMax) * 100, point.count > 0 ? 12 : 4)}px` }}
                />
              </div>
              <span className="text-xs font-normal text-slate-400">{point.label}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-end justify-between border-t border-slate-200 pt-4">
          <div>
            <p className="text-2xl font-bold tracking-tight text-slate-900">{data.chart.total}</p>
            <p className="mt-1 text-xs font-normal text-slate-500">{data.chart.totalLabel}</p>
          </div>
          <div className="text-right">
            <p className={`text-xs font-medium ${chartBadge.tone}`}>{chartBadge.text}</p>
            <p className="mt-1 text-xs font-normal text-slate-500">{data.chart.comparisonLabel}</p>
          </div>
        </div>
      </article>

      <DashboardWidgetInstallCard initialInstalled={data.hasWidgetInstalled} siteIds={data.widgetSiteIds} />
    </div>
  );
}
