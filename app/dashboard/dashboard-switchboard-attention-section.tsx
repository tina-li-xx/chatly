import type { FounderAttentionItem } from "@/lib/data/founder-switchboard";
import { SettingsCard, SettingsSectionHeader } from "./dashboard-settings-shared";

export function DashboardSwitchboardAttentionSection({
  items,
  title,
  subtitle
}: {
  items: FounderAttentionItem[];
  title: string;
  subtitle: string;
}) {
  return (
    <div className="space-y-6">
      <SettingsSectionHeader title={title} subtitle={subtitle} />

      <SettingsCard
        title="Needs attention"
        description="Founder follow-up across installs, billing state, and low-signal accounts."
        actions={<span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{items.length}</span>}
      >
        <div className="space-y-3">
          {items.length ? items.map((item) => (
            <div key={`${item.ownerUserId}-${item.reason}`} className="rounded-xl bg-slate-50 px-4 py-4">
              <p className="font-medium text-slate-900">{item.teamName}</p>
              <p className="mt-1 text-sm text-slate-500">{item.reason}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.detail}</p>
              <a href={`mailto:${item.ownerEmail}`} className="mt-3 inline-flex text-sm font-medium text-blue-600 hover:text-blue-700">Email owner</a>
            </div>
          )) : <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">Nothing urgent right now.</p>}
        </div>
      </SettingsCard>
    </div>
  );
}
