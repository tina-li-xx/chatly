"use client";

import type { DashboardStats } from "@/lib/types";
import { classNames } from "@/lib/utils";
import type { BannerState } from "./dashboard-client.types";

function StatCard({
  label,
  value,
  tone = "blue"
}: {
  label: string;
  value: string;
  tone?: "blue" | "red";
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <p className={classNames("text-xs font-medium uppercase tracking-[0.2em]", tone === "blue" ? "text-blue-600" : "text-red-500")}>
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}

export function DashboardOverview({
  userEmail,
  conversationsCount,
  answeredConversations,
  helpfulResponses,
  topTags,
  banner
}: {
  userEmail: string;
  conversationsCount: number;
  answeredConversations: number;
  helpfulResponses: number;
  topTags: DashboardStats["topTags"];
  banner: BannerState;
}) {
  return (
    <>
      <header className="flex flex-col gap-6 rounded-xl border border-slate-200 bg-white px-6 py-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">Workspace inbox</p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight tracking-tight text-slate-900">
            Real-time conversations, clean context, fast replies.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Signed in as {userEmail}. Keep the conversation at the center, with visitor context and inbox state close by when you need it.
          </p>
        </div>
        <form action="/auth/logout" method="post">
          <button
            type="submit"
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
          >
            Log out
          </button>
        </form>
      </header>

      <section className="grid gap-4 lg:grid-cols-4">
        <StatCard label="Conversations" value={String(conversationsCount)} />
        <StatCard label="Replied" value={String(answeredConversations)} />
        <StatCard label="Helpful clicks" value={String(helpfulResponses)} tone="red" />
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Top tags</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {topTags.length ? (
              topTags.map((tag) => (
                <span key={tag.tag} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
                  {tag.tag} ({tag.count})
                </span>
              ))
            ) : (
              <span className="text-sm text-slate-500">No tagging data yet.</span>
            )}
          </div>
        </div>
      </section>

      {banner ? (
        <div
          className={classNames(
            "rounded-xl px-4 py-3 text-sm",
            banner.tone === "error"
              ? "border border-rose-200 bg-rose-50 text-rose-700"
              : "border border-emerald-200 bg-emerald-50 text-emerald-700"
          )}
        >
          {banner.text}
        </div>
      ) : null}
    </>
  );
}
