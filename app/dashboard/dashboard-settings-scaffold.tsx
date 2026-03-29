"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { classNames } from "@/lib/utils";
import {
  DASHBOARD_PRIMARY_BUTTON_CLASS,
  DASHBOARD_SECONDARY_BUTTON_CLASS
} from "./dashboard-controls";
import { SETTINGS_NAV, type SettingsSection } from "./dashboard-settings-shared";

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
                <button
                  key={item.value}
                  type="button"
                  onClick={() => onSetActiveSection(item.value)}
                  className={classNames(
                    "inline-flex items-center gap-2 whitespace-nowrap rounded-lg border px-3 py-2 text-sm font-medium transition",
                    activeSection === item.value
                      ? "border-blue-200 bg-blue-50 text-blue-600"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
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
                      const Icon = item.icon;

                      if (item.type === "link") {
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                          >
                            <Icon className="h-[18px] w-[18px]" />
                            <span>{item.label}</span>
                          </Link>
                        );
                      }

                      const active = activeSection === item.value;

                      return (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => onSetActiveSection(item.value)}
                          className={classNames(
                            "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition",
                            active
                              ? "bg-blue-50 text-blue-600"
                              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                          )}
                        >
                          <Icon className="h-[18px] w-[18px]" />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </aside>

          <div className="min-w-0 bg-slate-50/70 p-4 sm:p-6 lg:p-8">
            <div className="mx-auto w-full max-w-[860px] space-y-6">
              {children}

              {isDirty && activeSection !== "billing" ? (
                <div className="sticky bottom-4 z-20">
                  <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <span className="h-2 w-2 rounded-full bg-amber-500" />
                      <span className="text-sm text-slate-600">Unsaved changes</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button type="button" onClick={onDiscard} className={DASHBOARD_SECONDARY_BUTTON_CLASS} disabled={isSaving}>
                        Discard
                      </button>
                      <button type="button" onClick={onSave} className={DASHBOARD_PRIMARY_BUTTON_CLASS} disabled={isSaving}>
                        {isSaving ? "Saving..." : "Save changes"}
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
