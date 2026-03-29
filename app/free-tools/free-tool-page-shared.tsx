import Link from "next/link";
import type { Route } from "next";
import type { FreeTool, FreeToolFaqItem } from "@/lib/free-tools-data";

export function FreeToolBreadcrumb({ title }: { title: string }) {
  return (
    <nav className="mb-8 flex items-center gap-2 text-sm text-slate-500">
      <Link href="/free-tools" className="font-medium text-slate-700 transition hover:text-slate-900">
        Free Tools
      </Link>
      <span>/</span>
      <span>{title}</span>
    </nav>
  );
}

export function FreeToolHero({ tool, subtitle }: { tool: FreeTool; subtitle: string }) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white px-8 py-10 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
      <div className="inline-flex h-14 w-14 items-center justify-center rounded-[18px] bg-blue-50 text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
        {tool.iconLabel}
      </div>
      <h1 className="display-font mt-5 text-4xl leading-tight text-slate-900 sm:text-5xl">{tool.title}</h1>
      <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">{subtitle}</p>
    </section>
  );
}

export function FreeToolContextualCta({
  title,
  body
}: {
  title: string;
  body: string;
}) {
  return (
    <section className="rounded-[18px] border border-blue-100 border-l-4 border-l-blue-600 bg-blue-50 px-6 py-6">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">Want to do this automatically?</p>
      <h2 className="mt-3 text-2xl font-semibold text-slate-900">{title}</h2>
      <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">{body}</p>
      <Link
        href="/login"
        className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
      >
        Try Chatting free
        <span aria-hidden="true">→</span>
      </Link>
    </section>
  );
}

export function FreeToolMobileStickyCta() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-[0_-4px_12px_rgba(15,23,42,0.08)] backdrop-blur sm:hidden">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4">
        <p className="text-sm font-medium text-slate-700">Try Chatting Free</p>
        <Link href="/login" className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white">
          Start now
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </div>
  );
}

export function FreeToolMetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[16px] border border-slate-200 bg-white px-4 py-4 text-center">
      <div className="text-3xl font-bold text-slate-900">{value}</div>
      <div className="mt-1 text-sm font-medium text-slate-500">{label}</div>
    </div>
  );
}

export function FreeToolEmptyResults({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center rounded-[18px] border border-dashed border-slate-300 bg-white px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-xl text-blue-600">+</div>
      <h2 className="mt-5 text-2xl font-semibold text-slate-900">{title}</h2>
      <p className="mt-3 max-w-md text-base leading-7 text-slate-600">{body}</p>
    </div>
  );
}

export function FreeToolGradeCard({
  grade,
  descriptor
}: {
  grade: string;
  descriptor: string;
}) {
  const gradeClasses =
    grade.startsWith("A")
      ? "bg-emerald-50 text-emerald-600"
      : grade.startsWith("B")
        ? "bg-blue-50 text-blue-600"
        : grade.startsWith("C")
          ? "bg-amber-50 text-amber-500"
          : "bg-rose-50 text-rose-500";

  return (
    <div className={`rounded-[18px] px-5 py-6 text-center ${gradeClasses}`}>
      <p className="text-sm font-semibold uppercase tracking-[0.16em]">Your grade</p>
      <div className="mt-3 text-7xl font-bold leading-none">{grade}</div>
      <p className="mt-3 text-lg font-medium text-slate-700">{descriptor}</p>
    </div>
  );
}

export function FreeToolBenchmarkBar({
  average,
  top,
  current
}: {
  average: number;
  top: number;
  current: number;
}) {
  const max = Math.max(average, top, current, 1) * 1.25;
  const currentPercent = Math.min(100, (current / max) * 100);
  const averagePercent = Math.min(100, (average / max) * 100);
  const topPercent = Math.min(100, (top / max) * 100);

  return (
    <div className="rounded-[18px] border border-slate-200 bg-white px-5 py-5">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">How you compare</p>
      <div className="mt-5">
        <div className="relative pb-8">
          <div className="relative h-6 overflow-hidden rounded-full border border-slate-200 bg-slate-100">
            <div className="absolute inset-y-0 left-0 w-[22%] bg-emerald-200" />
            <div className="absolute inset-y-0 left-[22%] w-[28%] bg-blue-200" />
            <div className="absolute inset-y-0 left-[50%] w-[22%] bg-amber-200" />
            <div className="absolute inset-y-0 right-0 w-[28%] bg-rose-200" />
            <div className="absolute inset-y-0 left-0 right-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.5),rgba(255,255,255,0))]" />
            <div className="absolute inset-y-1 w-px bg-emerald-700/45" style={{ left: `${topPercent}%` }} />
            <div className="absolute inset-y-1 w-px bg-slate-500/35" style={{ left: `${averagePercent}%` }} />
          </div>
          <div
            className="absolute -top-4 h-0 w-0 -translate-x-1/2 border-x-[7px] border-t-0 border-b-[10px] border-x-transparent border-b-slate-900"
            style={{ left: `${currentPercent}%` }}
          />
          <div
            className="absolute top-full mt-2 -translate-x-1/2 rounded-full bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white"
            style={{ left: `${currentPercent}%` }}
          >
            You
          </div>
        </div>
      </div>
      <ul className="mt-5 space-y-2 text-sm leading-6 text-slate-600">
        <li>Top performers: {top} min</li>
        <li>Industry average: {average} min</li>
        <li>Your time: {current} min</li>
      </ul>
    </div>
  );
}

export function FreeToolFaq({ items }: { items: FreeToolFaqItem[] }) {
  return (
    <section className="rounded-[24px] border border-slate-200 bg-white px-6 py-8 shadow-[0_18px_40px_rgba(15,23,42,0.05)] sm:px-8">
      <h2 className="display-font text-3xl text-slate-900">FAQ</h2>
      <div className="mt-6 space-y-5">
        {items.map((item) => (
          <div key={item.question} className="rounded-[18px] border border-slate-200 bg-slate-50 px-5 py-5">
            <h3 className="text-lg font-semibold text-slate-900">{item.question}</h3>
            <p className="mt-2 text-sm leading-7 text-slate-600">{item.answer}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function FreeToolRelated({ tools }: { tools: FreeTool[] }) {
  return (
    <section>
      <h2 className="display-font text-3xl text-slate-900">Related tools</h2>
      <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {tools.map((tool) => (
          <Link key={tool.slug} href={tool.href as Route} className="rounded-[22px] border border-slate-200 bg-white px-6 py-6 transition hover:-translate-y-0.5 hover:shadow-[0_20px_36px_rgba(15,23,42,0.08)]">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
              {tool.iconLabel}
            </div>
            <h3 className="mt-4 text-xl font-semibold leading-8 text-slate-900">{tool.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{tool.excerpt}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
