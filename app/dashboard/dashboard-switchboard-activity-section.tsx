import type { FounderRecentActivity } from "@/lib/data/founder-switchboard";
import { formatDateTime, formatRelativeTime } from "@/lib/utils";
import { SettingsCard, SettingsSectionHeader } from "./dashboard-settings-shared";
import { safePageLabel } from "./dashboard-switchboard-format";

export function DashboardSwitchboardActivitySection({
  items,
  title,
  subtitle
}: {
  items: FounderRecentActivity[];
  title: string;
  subtitle: string;
}) {
  return (
    <div className="space-y-6">
      <SettingsSectionHeader title={title} subtitle={subtitle} />

      <SettingsCard title="Conversation stream" description="Recent chat activity across every active workspace.">
        <div className="space-y-3">
          {items.map((activity) => (
            <div key={activity.conversationId} className="rounded-xl bg-slate-50 px-4 py-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-slate-900">{activity.teamName} <span className="text-slate-400">•</span> <span className="text-slate-600">{activity.siteName}</span></p>
                  <p className="mt-1 text-sm text-slate-500">{activity.visitorEmail || "Anonymous visitor"}{safePageLabel(activity.pageUrl) ? ` • ${safePageLabel(activity.pageUrl)}` : ""}</p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${activity.status === "open" ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`}>{activity.status}</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-700">{activity.preview}</p>
              <p className="mt-3 text-xs text-slate-500" title={formatDateTime(activity.createdAt)}>{formatRelativeTime(activity.createdAt)}</p>
            </div>
          ))}
        </div>
      </SettingsCard>
    </div>
  );
}
