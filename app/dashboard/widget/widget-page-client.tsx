"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import type { WidgetTab } from "../dashboard-widget-settings-shared";
import type { Site } from "@/lib/types";

const DashboardWidgetSettingsPage = dynamic(
  () =>
    import("../dashboard-widget-settings-page").then((module) => ({
      default: module.DashboardWidgetSettingsPage
    })),
  {
    ssr: false,
    loading: () => (
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="space-y-4">
          <div className="h-4 w-40 rounded-full bg-slate-100" />
          <div className="grid gap-6 xl:grid-cols-[480px_minmax(0,1fr)]">
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <div className="h-10 w-full rounded-lg bg-slate-100" />
              <div className="mt-6 space-y-4">
                {Array.from({ length: 6 }, (_, index) => (
                  <div key={index} className="h-16 rounded-xl bg-slate-50" />
                ))}
              </div>
            </div>
            <div className="rounded-xl bg-slate-100 p-8">
              <div className="mx-auto h-[420px] max-w-[520px] rounded-xl bg-white/70" />
            </div>
          </div>
        </div>
      </section>
    )
  }
);

type DashboardWidgetPageClientProps = {
  initialSites: Site[];
  proactiveChatUnlocked: boolean;
};

function normalizeWidgetTab(value: string | null): WidgetTab | undefined {
  if (value === "appearance" || value === "behavior" || value === "installation") {
    return value;
  }
  return undefined;
}

export function DashboardWidgetPageClient({
  initialSites,
  proactiveChatUnlocked
}: DashboardWidgetPageClientProps) {
  const searchParams = useSearchParams();
  const initialTab = normalizeWidgetTab(searchParams?.get("tab") ?? null);
  const focusTarget = searchParams?.get("focus") ?? null;

  useEffect(() => {
    if (!focusTarget) {
      return;
    }

    const timer = window.setTimeout(() => {
      document.getElementById(focusTarget)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);

    return () => window.clearTimeout(timer);
  }, [focusTarget, initialTab]);

  return (
    <DashboardWidgetSettingsPage
      initialSites={initialSites}
      proactiveChatUnlocked={proactiveChatUnlocked}
      initialTab={initialTab}
    />
  );
}
