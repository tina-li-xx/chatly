"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { classNames } from "@/lib/utils";
import { buildSettingsSectionHref } from "./dashboard-settings-section";
import { SETTINGS_NAV, SettingsDesktopNavItem, type SettingsSection } from "./dashboard-settings-shared";

const UNSAVED_DOT_SECTIONS = new Set<SettingsSection>([
  "profile",
  "contacts",
  "automation",
  "notifications",
  "aiAssist",
  "email"
]);

export function DashboardSettingsScaffold({
  activeSection,
  onSetActiveSection,
  children,
  isDirty,
  isSaving,
  onDiscard,
  onSave
}: {
  activeSection: SettingsSection;
  onSetActiveSection: (section: SettingsSection) => void;
  children: ReactNode;
  isDirty: boolean;
  isSaving: boolean;
  onDiscard: () => void;
  onSave: () => void;
}) {
  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-4 lg:hidden">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {SETTINGS_NAV.flatMap((group) => group.items).map((item) => {
              const Icon = item.icon;
              const showUnsavedDot =
                item.type === "section" &&
                activeSection === item.value &&
                isDirty &&
                UNSAVED_DOT_SECTIONS.has(item.value);

              if (item.type === "link") {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              }

              return (
                <a
                  key={item.value}
                  href={buildSettingsSectionHref(item.value)}
                  className={classNames(
                    "inline-flex items-center gap-2 whitespace-nowrap rounded-lg border px-3 py-2 text-sm font-medium transition",
                    activeSection === item.value
                      ? "border-blue-200 bg-blue-50 text-blue-600"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                  {showUnsavedDot ? <span className="h-2 w-2 rounded-full bg-amber-500" aria-hidden="true" /> : null}
                </a>
              );
            })}
          </div>
        </div>

        <div className="lg:grid lg:grid-cols-[220px_minmax(0,1fr)]">
          <aside className="hidden border-r border-slate-200 bg-white lg:block">
            <div className="px-3 py-5">
              {SETTINGS_NAV.map((group) => (
                <div key={group.label} className="mt-2 first:mt-0">
                  <p className="px-3 pb-2 text-[11px] font-medium uppercase tracking-[0.08em] text-slate-400">
                    {group.label}
                  </p>
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const label =
                        item.type === "section" &&
                        activeSection === item.value &&
                        isDirty &&
                        UNSAVED_DOT_SECTIONS.has(item.value)
                          ? `${item.label} •`
                          : item.label;
                      if (item.type === "link") {
                        return (
                          <SettingsDesktopNavItem
                            key={item.href}
                            href={item.href}
                            icon={item.icon}
                            label={label}
                            description={item.description}
                          />
                        );
                      }

                      return (
                        <SettingsDesktopNavItem
                          key={item.value}
                          href={buildSettingsSectionHref(item.value)}
                          icon={item.icon}
                          label={label}
                          description={item.description}
                          active={activeSection === item.value}
                          documentNavigation
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </aside>

          <div className="min-w-0 bg-slate-50/70 p-4 sm:p-6 lg:p-8">
            <div className="w-full space-y-6">
              {children}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
