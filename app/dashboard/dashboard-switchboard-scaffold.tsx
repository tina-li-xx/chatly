"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { classNames } from "@/lib/utils";
import { SettingsDesktopNavItem } from "./dashboard-settings-shared";
import { buildSwitchboardSectionHref, type SwitchboardSection } from "./dashboard-switchboard-section";
import { SWITCHBOARD_NAV } from "./dashboard-switchboard-shared";

export function DashboardSwitchboardScaffold({
  activeSection,
  children
}: {
  activeSection: SwitchboardSection;
  children: ReactNode;
}) {
  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-4 lg:hidden">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {SWITCHBOARD_NAV.flatMap((group) => group.items).map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.value}
                  href={buildSwitchboardSectionHref(item.value)}
                  className={classNames(
                    "inline-flex items-center gap-2 whitespace-nowrap rounded-lg border px-3 py-2 text-sm font-medium transition",
                    activeSection === item.value
                      ? "border-blue-200 bg-blue-50 text-blue-600"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.mobileLabel ?? item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="lg:grid lg:grid-cols-[220px_minmax(0,1fr)]">
          <aside className="hidden border-r border-slate-200 bg-white lg:block">
            <div className="px-3 py-5">
              {SWITCHBOARD_NAV.map((group) => (
                <div key={group.label} className="mt-2 first:mt-0">
                  <p className="px-3 pb-2 text-[11px] font-medium uppercase tracking-[0.08em] text-slate-400">
                    {group.label}
                  </p>
                  <div className="space-y-1">
                    {group.items.map((item) => (
                      <SettingsDesktopNavItem
                        key={item.value}
                        href={buildSwitchboardSectionHref(item.value)}
                        icon={item.icon}
                        label={item.label}
                        description={item.description}
                        active={activeSection === item.value}
                        documentNavigation
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </aside>

          <div className="min-w-0 bg-slate-50/70 p-4 sm:p-6 lg:p-8">
            <div className="w-full space-y-6">{children}</div>
          </div>
        </div>
      </section>
    </div>
  );
}
