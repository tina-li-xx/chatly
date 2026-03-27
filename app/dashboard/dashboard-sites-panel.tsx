"use client";

import type { FormEvent } from "react";
import { getWidgetSnippet } from "@/lib/dashboard";
import type { Site } from "@/lib/types";

export function DashboardSitesPanel({
  sites,
  savingSiteId,
  onSaveSiteTitle
}: {
  sites: Site[];
  savingSiteId: string | null;
  onSaveSiteTitle: (event: FormEvent<HTMLFormElement>, siteId: string) => Promise<void>;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">Your sites</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">Embed a widget per product or domain.</h2>
        </div>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
          {sites.length} {sites.length === 1 ? "site" : "sites"}
        </span>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {sites.map((site) => (
          <article key={site.id} className="rounded-xl border border-slate-200 bg-slate-50 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">{site.name}</h3>
                <p className="mt-2 text-sm text-slate-500">
                  {site.domain || "Any domain"} · {site.conversationCount} conversation
                  {site.conversationCount === 1 ? "" : "s"}
                </p>
              </div>
              <span
                className="h-5 w-5 rounded-full border border-slate-200"
                style={{ backgroundColor: site.brandColor }}
              />
            </div>

            <div className="mt-6 rounded-xl bg-slate-900 p-4 text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Widget snippet</p>
              <pre className="mt-3 overflow-x-auto text-xs leading-6 text-white/90">
                <code>{getWidgetSnippet(site)}</code>
              </pre>
            </div>

            <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
              <p>
                Widget title: <span className="font-medium text-slate-900">{site.widgetTitle}</span>
              </p>
              <p>{site.greetingText}</p>
            </div>

            <form onSubmit={(event) => onSaveSiteTitle(event, site.id)} className="mt-4 flex flex-col gap-3 sm:flex-row">
              <input type="hidden" name="siteId" value={site.id} />
              <input
                name="widgetTitle"
                defaultValue={site.widgetTitle}
                placeholder="Talk to the team"
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={savingSiteId === site.id}
                className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {savingSiteId === site.id ? "Saving..." : "Save widget title"}
              </button>
            </form>
            <p className="mt-2 text-xs text-slate-500">
              Copy the updated snippet if this site is already embedded somewhere.
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
