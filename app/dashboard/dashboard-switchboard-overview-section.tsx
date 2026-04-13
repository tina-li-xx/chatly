import Link from "next/link";
import type { FounderSwitchboardData } from "@/lib/data/founder-switchboard";
import { SettingsCard } from "./dashboard-settings-shared";
import type { SwitchboardCustomerFilter } from "./dashboard-switchboard-customers-filter";
import { buildSwitchboardSectionHref, type SwitchboardSection } from "./dashboard-switchboard-section";

const SUMMARY_CARD_COPY = [
  { label: "Workspaces", key: "totalWorkspaces", section: "customers", customerFilter: "all" },
  { label: "Active this week", key: "activeWorkspaces7d", section: "customers", customerFilter: "active" },
  { label: "Paying", key: "payingWorkspaces", section: "customers", customerFilter: "paying" },
  { label: "Trials live", key: "trialingWorkspaces", section: "customers", customerFilter: "trialing" },
  { label: "30d conversations", key: "conversations30d", section: "activity", customerFilter: "all" },
  { label: "Verified installs", key: "verifiedWidgets", section: "customers", customerFilter: "verified" },
  { label: "Attention items", key: "attentionItems", section: "attention", customerFilter: "all" }
] as const;

type SummaryCardKey = keyof FounderSwitchboardData["summary"];

function OverviewMetricCard({
  label,
  value,
  section,
  customerFilter
}: {
  label: string;
  value: number;
  section: SwitchboardSection;
  customerFilter: SwitchboardCustomerFilter;
}) {
  return (
    <Link
      href={buildSwitchboardSectionHref(section, customerFilter)}
      className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
    >
      <SettingsCard className="p-5 transition hover:border-slate-300">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
        <p className="mt-3 font-serif text-3xl font-semibold tracking-[-0.02em] text-slate-900">{value}</p>
      </SettingsCard>
    </Link>
  );
}

export function DashboardSwitchboardOverviewSection({
  data,
  title: _title,
  subtitle: _subtitle
}: {
  data: FounderSwitchboardData;
  title: string;
  subtitle: string;
}) {
  return (
    <section>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {SUMMARY_CARD_COPY.map(({ label, key, section, customerFilter }) => (
          <OverviewMetricCard
            key={key}
            label={label}
            value={data.summary[key as SummaryCardKey]}
            section={section}
            customerFilter={customerFilter}
          />
        ))}
      </div>
    </section>
  );
}
