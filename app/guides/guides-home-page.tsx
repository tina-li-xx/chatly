import type { Route } from "next";
import Link from "next/link";
import { formatBlogDate, formatReadingTime } from "@/lib/blog-utils";
import type { GuideArticle } from "@/lib/guide-article";
import { GuidesShell } from "./guides-shell";

export function GuidesHomePage({
  featuredGuide,
  guides
}: {
  featuredGuide: GuideArticle;
  guides: GuideArticle[];
}) {
  return (
    <GuidesShell>
      <main className="pb-24">
        <section className="mx-auto grid max-w-[1240px] gap-10 px-4 pb-14 pt-10 sm:px-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)] lg:px-8 lg:pb-20 lg:pt-16">
          <div className="max-w-3xl">
            <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-700">
              Guides
            </span>
            <h1 className="display-font mt-6 text-4xl leading-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Practical guides for teams using Chatting every day
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
              Clear walkthroughs for integrations, inbox workflows, AI Assist, and the operational details teams usually have to figure out the hard way.
            </p>
          </div>

          <Link
            href={`/guides/${featuredGuide.slug}` as Route}
            className="group overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_50px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_28px_64px_rgba(15,23,42,0.12)]"
          >
            <div className="border-b border-slate-200 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.4),transparent_30%),linear-gradient(135deg,#dbeafe_0%,#eff6ff_42%,#fff7ed_100%)] p-4">
              <div className="overflow-hidden rounded-[20px] border border-white/70 bg-white/80 p-3">
                <img
                  src={featuredGuide.image.src}
                  alt={featuredGuide.image.alt}
                  className="aspect-[1.7/1] w-full object-contain"
                />
              </div>
            </div>
            <div className="space-y-4 p-6">
              <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-700">
                Featured guide
              </span>
              <div>
                <h2 className="text-2xl font-semibold leading-tight text-slate-900">{featuredGuide.title}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">{featuredGuide.excerpt}</p>
              </div>
              <div className="flex items-center gap-3 text-xs font-medium uppercase tracking-[0.1em] text-slate-400">
                <span>{formatBlogDate(featuredGuide.publishedAt)}</span>
                <span>•</span>
                <span>{formatReadingTime(featuredGuide.readingTime)}</span>
              </div>
            </div>
          </Link>
        </section>

        <section className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Library</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">All guides</h2>
            </div>
            <p className="text-sm text-slate-500">{guides.length} published</p>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            {guides.map((guide) => (
              <Link
                key={guide.slug}
                href={`/guides/${guide.slug}` as Route}
                className="group flex h-full flex-col overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_20px_40px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_24px_52px_rgba(15,23,42,0.1)]"
              >
                <div className="border-b border-slate-200 bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_50%,#fff7ed_100%)] p-4">
                  <div className="overflow-hidden rounded-[18px] border border-white/70 bg-white/80 p-2.5">
                    <img
                      src={guide.image.src}
                      alt={guide.image.alt}
                      className="aspect-[1.8/1] w-full object-contain"
                    />
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-center gap-3 text-xs font-medium uppercase tracking-[0.1em] text-slate-400">
                    <span>{formatBlogDate(guide.publishedAt)}</span>
                    <span>•</span>
                    <span>{formatReadingTime(guide.readingTime)}</span>
                  </div>
                  <h3 className="mt-4 text-xl font-semibold leading-tight text-slate-900">{guide.title}</h3>
                  <p className="mt-3 flex-1 text-sm leading-7 text-slate-600">{guide.excerpt}</p>
                  <span className="mt-6 text-sm font-semibold text-blue-700 transition group-hover:text-blue-800">
                    Read guide →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </GuidesShell>
  );
}
