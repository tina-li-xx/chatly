"use client";

import type { ComponentType, ReactNode, SVGProps } from "react";
import { classNames } from "@/lib/utils";
import { SettingsDesktopNavItem } from "./dashboard-settings-shared";
import {
  buildAnalyticsSectionHref,
  type AnalyticsSection
} from "./dashboard-analytics-section";
import { BarChartIcon, BoltIcon, ChatBubbleIcon, UsersIcon } from "./dashboard-ui";

type AnalyticsNavItem = {
  value: AnalyticsSection;
  label: string;
  description: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
};

const ANALYTICS_NAV: AnalyticsNavItem[] = [
  {
    value: "overview",
    label: "Overview",
    description: "Headline volume and trend lines",
    icon: BarChartIcon
  },
  {
    value: "conversations",
    label: "Conversations",
    description: "Response, pages, satisfaction, and tags",
    icon: ChatBubbleIcon
  },
  {
    value: "teamPerformance",
    label: "Team Performance",
    description: "Teammate activity and response quality",
    icon: UsersIcon
  },
  {
    value: "aiAssist",
    label: "AI Assist",
    description: "Usage, adoption, and recent AI activity",
    icon: BoltIcon
  }
];

export function DashboardAnalyticsScaffold({
  activeSection,
  children
}: {
  activeSection: AnalyticsSection;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-200 bg-slate-50 px-4 py-4 lg:hidden">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {ANALYTICS_NAV.map((item) => {
            const Icon = item.icon;

            return (
              <a
                key={item.value}
                href={buildAnalyticsSectionHref(item.value)}
                className={classNames(
                  "inline-flex items-center gap-2 whitespace-nowrap rounded-lg border px-3 py-2 text-sm font-medium transition",
                  activeSection === item.value
                    ? "border-blue-200 bg-blue-50 text-blue-600"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </a>
            );
          })}
        </div>
      </div>

      <div className="lg:grid lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="hidden border-r border-slate-200 bg-white lg:block">
          <div className="px-3 py-5">
            <p className="px-3 pb-2 text-[11px] font-medium uppercase tracking-[0.08em] text-slate-400">
              Analytics
            </p>
            <div className="space-y-1">
              {ANALYTICS_NAV.map((item) => (
                <SettingsDesktopNavItem
                  key={item.value}
                  href={buildAnalyticsSectionHref(item.value)}
                  icon={item.icon}
                  label={item.label}
                  description={item.description}
                  active={activeSection === item.value}
                  documentNavigation
                />
              ))}
            </div>
          </div>
        </aside>

        <div className="min-w-0 bg-slate-50/70 p-4 sm:p-6 lg:p-8">
          <div className="w-full space-y-6">{children}</div>
        </div>
      </div>
    </section>
  );
}
