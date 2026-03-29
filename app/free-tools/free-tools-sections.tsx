import Link from "next/link";
import type { Route } from "next";
import { formatBlogDate } from "@/lib/blog-utils";
import { freeToolCategories } from "@/lib/free-tools-data";
import type { FreeTool, FreeToolCategorySlug } from "@/lib/free-tools-data";

function ToolIcon({ label }: { label: string }) {
  return (
    <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
      {label}
    </span>
  );
}

function FreeToolBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex rounded-md bg-blue-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-700">
      {label}
    </span>
  );
}

export function FreeToolCategoryTabs({
  selectedCategory
}: {
  selectedCategory: FreeToolCategorySlug | "all";
}) {
  const tabs = [
    { label: "All", href: "/free-tools", active: selectedCategory === "all" },
    ...freeToolCategories.map((category) => ({
      label: category.label,
      href: `/free-tools/category/${category.slug}`,
      active: selectedCategory === category.slug
    }))
  ];

  return (
    <div className="flex gap-2 overflow-x-auto py-1">
      {tabs.map((tab) => (
        <Link
          key={tab.label}
          href={tab.href as Route}
          className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
            tab.active ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}

export function FeaturedFreeTool({ tool }: { tool: FreeTool }) {
  return (
    <Link
      href={tool.href as Route}
      className="block rounded-[28px] border border-slate-200 bg-white px-6 py-8 shadow-[0_20px_40px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_48px_rgba(15,23,42,0.08)] sm:px-8"
    >
      <div className="flex flex-wrap items-center gap-3">
        <FreeToolBadge label="Featured" />
        <FreeToolBadge label={tool.kind} />
      </div>
      <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-[24px] bg-[linear-gradient(135deg,#dbeafe_0%,#eff6ff_100%)]">
          <ToolIcon label={tool.iconLabel} />
        </div>
        <div className="flex-1">
          <h2 className="display-font text-4xl leading-tight text-slate-900">{tool.title}</h2>
          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">{tool.excerpt}</p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white">
          Try it free
          <span aria-hidden="true">→</span>
        </span>
      </div>
    </Link>
  );
}

export function FreeToolCard({ tool }: { tool: FreeTool }) {
  return (
    <Link
      href={tool.href as Route}
      className="group flex min-h-[220px] flex-col rounded-[22px] border border-slate-200 bg-white px-6 py-6 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_20px_36px_rgba(15,23,42,0.08)]"
    >
      <ToolIcon label={tool.iconLabel} />
      <h3 className="mt-5 text-xl font-semibold leading-8 text-slate-900">{tool.title}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-600">{tool.excerpt}</p>
      <div className="mt-auto pt-6 text-sm font-medium text-blue-600">
        Use tool <span aria-hidden="true">→</span>
      </div>
      <div className="mt-4 text-xs uppercase tracking-[0.16em] text-slate-400">
        {tool.kind} • Updated {formatBlogDate(tool.updatedAt)}
      </div>
    </Link>
  );
}

export function FreeToolsCtaBanner() {
  return (
    <section className="rounded-[28px] bg-blue-50 px-8 py-10 text-center">
      <h2 className="display-font text-3xl text-slate-900">Ready to put these insights into action?</h2>
      <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-slate-600">
        Start talking to your website visitors today with Chatting.
      </p>
      <Link
        href="/login"
        className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-700"
      >
        Start free — no credit card required
        <span aria-hidden="true">→</span>
      </Link>
    </section>
  );
}
